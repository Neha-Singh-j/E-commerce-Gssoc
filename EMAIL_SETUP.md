# 📧 Email Configuration Setup Guide

## Gmail Setup for Password Reset Feature

The "Forgot Password" feature requires a Gmail account with **App Password** authentication.

### Step-by-Step Setup:

#### 1️⃣ **Enable 2-Step Verification**
- Go to: https://myaccount.google.com/security
- Click on "2-Step Verification"
- Follow the prompts to enable it (required for App Passwords)

#### 2️⃣ **Generate App Password**
- Go to: https://myaccount.google.com/apppasswords
- Sign in if prompted
- Select app: **Mail**
- Select device: **Other (Custom name)** → Enter "Shopiko E-commerce"
- Click **Generate**
- Copy the **16-character password** (shown without spaces)

#### 3️⃣ **Update .env File**
Open `.env` and update these lines:

```env
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop    # Paste the 16-character App Password
```

**Important:**
- Use your actual Gmail address for `SMTP_USER`
- Use the App Password (not your regular Gmail password) for `SMTP_PASS`
- You can include or exclude spaces in the App Password - both work

#### 4️⃣ **Restart Your Server**
```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
```

---

## Testing the Feature

1. Navigate to: http://localhost:3000/login
2. Click **"Forgot Password?"**
3. Enter your email address
4. Check your inbox for the password reset email
5. Click the link in the email to reset your password

---

## Troubleshooting

### Error: "Invalid login: 535 Username and Password not accepted"

**Causes:**
- ✗ Using regular Gmail password instead of App Password
- ✗ 2-Step Verification not enabled
- ✗ Wrong email address in SMTP_USER

**Solutions:**
1. Make sure 2-Step Verification is enabled
2. Generate a NEW App Password
3. Copy it exactly (with or without spaces)
4. Update `.env` file
5. Restart server

### Error: "Email service is not configured properly"

This means the SMTP credentials in `.env` are invalid. Follow steps 1-4 above.

### Email Not Received

1. **Check Spam folder** - reset emails might go to spam
2. **Verify email address** - make sure you entered the correct email
3. **Check server logs** - look for email sending errors
4. **Wait a few minutes** - sometimes emails are delayed

---

## Alternative: Use Different Email Service

If you don't want to use Gmail, you can use other services:

### SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

---

## Security Notes

⚠️ **Never commit `.env` file to Git** - it contains sensitive credentials

✅ `.env` is already in `.gitignore`

✅ For production, use environment variables instead of `.env` file

✅ Rotate App Passwords regularly for better security

---

## Email Templates

The password reset emails include:
- Professional HTML formatting
- Gradient branding matching your site
- Clickable reset link
- 1-hour expiration notice
- Confirmation email after successful password change

All templates can be customized in:
- `routes/auth.js` (lines 60-90, 165-175)
- `routes/production/auth.js` (lines 180-210, 280-290)

---

**Need Help?** Check the error logs in your terminal for detailed error messages.
