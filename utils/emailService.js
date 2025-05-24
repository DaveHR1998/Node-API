const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'API Service'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Password reset email template
const sendPasswordResetEmail = async (user, resetToken, resetUrl) => {
  const subject = 'Password Reset Request';
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hello ${user.firstName},</p>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>Or use this token: <strong>${resetToken}</strong></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Regards,<br>The API Team</p>
  `;
  
  const text = `
    Password Reset Request
    
    Hello ${user.firstName},
    
    You requested a password reset. Please visit the following link to reset your password:
    ${resetUrl}
    
    Or use this token: ${resetToken}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
    
    Regards,
    The API Team
  `;
  
  return await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

// Password change confirmation email
const sendPasswordChangeConfirmationEmail = async (user) => {
  const subject = 'Password Changed Successfully';
  const html = `
    <h1>Password Changed Successfully</h1>
    <p>Hello ${user.firstName},</p>
    <p>Your password has been changed successfully.</p>
    <p>If you did not make this change, please contact our support team immediately.</p>
    <p>Regards,<br>The API Team</p>
  `;
  
  const text = `
    Password Changed Successfully
    
    Hello ${user.firstName},
    
    Your password has been changed successfully.
    
    If you did not make this change, please contact our support team immediately.
    
    Regards,
    The API Team
  `;
  
  return await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

// Welcome email template with verification link
const sendWelcomeEmail = async (user, verificationToken, verificationUrl) => {
  const subject = 'Welcome to our Platform - Verify Your Email';
  const html = `
    <h1>Welcome to our Platform!</h1>
    <p>Hello ${user.firstName},</p>
    <p>Thank you for registering with us. Your account has been created successfully.</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}">Verify Email Address</a></p>
    <p>Or use this verification code: <strong>${verificationToken}</strong></p>
    <p>This link will expire in 24 hours.</p>
    <p>Regards,<br>The API Team</p>
  `;
  
  const text = `
    Welcome to our Platform!
    
    Hello ${user.firstName},
    
    Thank you for registering with us. Your account has been created successfully.
    
    Please verify your email address by visiting the following link:
    ${verificationUrl}
    
    Or use this verification code: ${verificationToken}
    
    This link will expire in 24 hours.
    
    Regards,
    The API Team
  `;
  
  return await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

// Email verification success template
const sendEmailVerificationSuccessEmail = async (user) => {
  const subject = 'Email Verification Successful';
  const html = `
    <h1>Email Verification Successful</h1>
    <p>Hello ${user.firstName},</p>
    <p>Your email address has been successfully verified.</p>
    <p>You can now enjoy all the features of our platform.</p>
    <p>Regards,<br>The API Team</p>
  `;
  
  const text = `
    Email Verification Successful
    
    Hello ${user.firstName},
    
    Your email address has been successfully verified.
    
    You can now enjoy all the features of our platform.
    
    Regards,
    The API Team
  `;
  
  return await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordChangeConfirmationEmail,
  sendWelcomeEmail,
  sendEmailVerificationSuccessEmail
};
