const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordChangeConfirmationEmail, sendWelcomeEmail, sendEmailVerificationSuccessEmail } = require('../utils/emailService');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeAllUserRefreshTokens } = require('../utils/tokenService');
require('dotenv').config();

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      // Generate a new verification token if needed
      const emailVerificationToken = crypto.randomBytes(20).toString('hex');
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;
      
      // Update user with new token
      await user.update({ emailVerificationToken });
      
      // Send a new verification email
      await sendWelcomeEmail(user, emailVerificationToken, verificationUrl);
      
      return res.status(401).json({
        success: false,
        message: 'Your email address is not verified. A new verification email has been sent to your inbox.'
      });
    }

    // Verify password
    const isValidPassword = await user.validPassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login time
    await user.update({ lastLogin: new Date() });

    // Generate access token
    const accessToken = generateAccessToken(user);
    
    // Generate refresh token
    const refreshToken = await generateRefreshToken(user, req);

    // Return success response with tokens
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // If user not found, still return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to user record
    await user.update({
      resetToken,
      resetTokenExpiry
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send email
    await sendPasswordResetEmail(user, resetToken, resetUrl);

    return res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with this token and token not expired
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Update user password
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password (when user is logged in)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await user.validPassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    await sendPasswordChangeConfirmationEmail(user);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while changing your password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user profile
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName
    });

    // Get updated user without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating your profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');

    // Create new user with default role 'user'
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'user',
      isActive: true,
      emailVerificationToken,
      emailVerified: false
    });

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;

    // Send welcome email with verification link
    await sendWelcomeEmail(user, emailVerificationToken, verificationUrl);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Return success response with token
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: false
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await User.findOne({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Update user to verified
    await user.update({
      emailVerified: true,
      emailVerificationToken: null
    });

    // Send verification success email
    await sendEmailVerificationSuccessEmail(user);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during email verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // If user not found, still return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If your email is registered and not verified, you will receive a verification email'
      });
    }
    
    // If user is already verified
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Your email is already verified. You can log in with your credentials.'
      });
    }
    
    // Generate a new verification token
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;
    
    // Update user with new token
    await user.update({ emailVerificationToken });
    
    // Send a new verification email
    await sendWelcomeEmail(user, emailVerificationToken, verificationUrl);
    
    return res.status(200).json({
      success: true,
      message: 'If your email is registered and not verified, you will receive a verification email'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resending the verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Refresh access token using refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify the refresh token
    const tokenDoc = await verifyRefreshToken(refreshToken);
    const user = tokenDoc.User;
    
    // Generate a new access token
    const accessToken = generateAccessToken(user);
    
    return res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// Logout - revoke refresh token
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Revoke the refresh token
    await revokeRefreshToken(refreshToken);
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout from all devices - revoke all refresh tokens for a user
exports.logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Revoke all refresh tokens for the user
    await revokeAllUserRefreshTokens(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout from all devices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
