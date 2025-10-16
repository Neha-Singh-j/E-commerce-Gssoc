# Password Reset & Show Password Features - Setup Guide

## Features Implemented

### 1. Forgot Password Functionality
- **Forgot Password Link**: Added on the login page
- **Email-based Reset**: Secure token sent via email
- **Token Expiration**: Reset links expire after 1 hour
- **Secure Password Update**: New passwords are hashed before storage

### 2. Show Password Toggle
- **Eye Icon**: Added to all password fields
- **Toggle Functionality**: Click to switch between hidden/visible password
- **Pages Updated**: Login, Register, and Reset Password pages

## Setup Instructions

### Step 1: Configure Email Settings

You need to set up email credentials in your `.env` file for the password reset feature to work.

#### For Gmail Users:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update .env file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

#### For Other Email Providers:

Update the `.env` file with your provider's SMTP settings:
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### Step 2: Install Dependencies

The required package `nodemailer` should already be installed. If not:

```bash
npm install nodemailer
```

### Step 3: Test the Features

1. **Start the server**:
```bash
npm start
```

2. **Test Forgot Password**:
   - Go to `/login`
   - Click "Forgot Password?"
   - Enter your email address
   - Check your email for the reset link
   - Click the link and set a new password

3. **Test Show Password**:
   - Go to `/login` or `/register`
   - Type in the password field
   - Click the eye icon to toggle visibility

## API Endpoints

### GET `/forgot-password`
- Displays the forgot password form

### POST `/forgot-password`
- **Body**: `{ email: "user@example.com" }`
- Sends password reset email with token

### GET `/reset-password/:token`
- Displays the reset password form
- Validates token and expiration

### POST `/reset-password/:token`
- **Body**: `{ password: "newpassword", confirmPassword: "newpassword" }`
- Updates the user's password
- Clears the reset token
- Sends confirmation email

## Security Features

1. **Secure Tokens**: 
   - Generated using `crypto.randomBytes(20)`
   - Stored hashed in the database
   - Expire after 1 hour

2. **Password Hashing**: 
   - New passwords are hashed using passport-local-mongoose
   - Never stored in plain text

3. **Email Validation**: 
   - Checks if email exists before sending reset link
   - Prevents user enumeration with generic messages

4. **Token Validation**: 
   - Verifies token exists and hasn't expired
   - Removes token after successful password reset

## User Schema Updates

Added fields to the User model:
```javascript
resetPasswordToken: {
  type: String,
}
resetPasswordExpires: {
  type: Date,
}
```

## Files Modified/Created

### Created:
- `views/auth/forgot-password.ejs` - Forgot password form
- `views/auth/reset-password.ejs` - Reset password form
- `public/js/password-toggle.js` - Password visibility toggle script

### Modified:
- `models/User.js` - Added reset token fields
- `routes/auth.js` - Added password reset routes
- `views/auth/login.ejs` - Added forgot password link and eye icon
- `views/auth/signup.ejs` - Added eye icon

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Ensure Gmail App Password is correct (not regular password)
3. Check console for error messages
4. Verify port 587 is not blocked by firewall

### Token Expired
- Reset tokens expire after 1 hour
- Request a new password reset link

### Password Not Updating
- Ensure passwords match in the form
- Check minimum password length (6 characters)
- Review server logs for errors

## Testing Checklist

- [ ] Forgot password link appears on login page
- [ ] Email is sent with reset link
- [ ] Reset link works within 1 hour
- [ ] Reset link expires after 1 hour
- [ ] New password works for login
- [ ] Confirmation email is sent
- [ ] Eye icon appears on all password fields
- [ ] Clicking eye icon toggles password visibility
- [ ] Icon changes between eye and eye-slash

## Future Enhancements

- [ ] Add password strength indicator
- [ ] Add reCAPTCHA to prevent abuse
- [ ] Add rate limiting for password reset requests
- [ ] SMS-based password reset option
- [ ] Remember me functionality
- [ ] Two-factor authentication

## Support

For issues or questions, please refer to the main README.md or create an issue in the repository.
