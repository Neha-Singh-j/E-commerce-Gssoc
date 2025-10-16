const express = require("express");
const User = require("../models/User");
const passport = require("passport");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.get("/register", (req, res) => {
  res.render("auth/signup");
});

router.post("/register", async (req, res) => {
  try {
    let { username, password, email, role, gender } = req.body;
    
    // Validate required fields
    if (!username || !password || !email || !role || !gender) {
      req.flash("error", "All fields are required.");
      return res.redirect("/register");
    }

    let user = new User({ username, email, gender, role });
    let newUser = await User.register(user, password);
    
    req.flash("success", "Registration successful! Please login.");
    res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific errors
    if (error.name === 'UserExistsError') {
      req.flash("error", "A user with that username already exists.");
    } else if (error.code === 11000) {
      req.flash("error", "Email already registered.");
    } else {
      req.flash("error", "Registration failed. Please try again.");
    }
    
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  function (req, res) {
    try{
      // console.log(req.user.username, "User");
      req.flash("success", `Welcome Back ${req.user.username}`);
      // res.json(`Welcome Back ${req.user.username}`);
      res.redirect("/products");
    }
    catch(error){
      res.json(error);
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out successfully");
    res.redirect("/login");
  });
});

// Forgot Password - Display Form
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password");
});

// Forgot Password - Send Reset Email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/forgot-password");
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString("hex");

    // Set token and expiration (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetURL = `http://${req.headers.host}/reset-password/${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.SMTP_USER,
      subject: "Reset Your Password - Shopiko",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="background: linear-gradient(to right, #6a11cb, #fc4a1a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 32px; margin: 0;">Shopiko</h1>
            </div>
            <h2 style="color: #6a11cb; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello,</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Shopiko account associated with <strong>${user.email}</strong>.</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(to right, #6a11cb, #fc4a1a); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset My Password</a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:</p>
            <p style="color: #6a11cb; font-size: 14px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${resetURL}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
              <p style="color: #999; font-size: 13px; line-height: 1.6;"><strong>Important:</strong></p>
              <ul style="color: #999; font-size: 13px; line-height: 1.6;">
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">This is an automated email from Shopiko. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    req.flash("success", `An email has been sent to ${user.email} with further instructions.`);
    res.redirect("/login");
  } catch (error) {
    console.error("Forgot password error:", error);
    
    // Check if it's an email authentication error
    if (error.code === 'EAUTH') {
      req.flash("error", "Email service is not configured properly. Please contact the administrator.");
    } else {
      req.flash("error", "An error occurred. Please try again.");
    }
    res.redirect("/forgot-password");
  }
});

// Reset Password - Display Form
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot-password");
    }

    res.render("auth/reset-password", { token: req.params.token });
  } catch (error) {
    console.error("Reset password GET error:", error);
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("/forgot-password");
  }
});

// Reset Password - Update Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot-password");
    }

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/reset-password/${req.params.token}`);
    }

    // Set new password using passport-local-mongoose method
    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      to: user.email,
      from: process.env.SMTP_USER,
      subject: "Password Successfully Changed - Shopiko",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="background: linear-gradient(to right, #6a11cb, #fc4a1a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 32px; margin: 0;">Shopiko</h1>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background: linear-gradient(to right, #6a11cb, #fc4a1a); border-radius: 50%; padding: 15px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <h2 style="color: #6a11cb; text-align: center; margin-bottom: 20px;">Password Changed Successfully!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello <strong>${user.username}</strong>,</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">This is a confirmation that the password for your Shopiko account <strong>${user.email}</strong> has been successfully changed.</p>
            <div style="background: #f0f8ff; border-left: 4px solid #6a11cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="color: #333; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>Security Note:</strong> If you did not make this change, please contact our support team immediately to secure your account.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://${process.env.CORS_ORIGIN || 'localhost:3000'}/login" style="display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #6a11cb, #fc4a1a); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Your Account</a>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">This is an automated email from Shopiko. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    req.flash("success", "Success! Your password has been changed. Please login with your new password.");
    res.redirect("/login");
  } catch (error) {
    console.error("Reset password POST error:", error);
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("/forgot-password");
  }
});

module.exports = router;