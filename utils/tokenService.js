const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refreshToken');
const { Op } = require('sequelize');
require('dotenv').config();

// Generate JWT access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
};

// Generate refresh token
const generateRefreshToken = async (user, req) => {
  try {
    // Generate a random token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Set expiry date - 7 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // Get user agent and IP address if available
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    
    // Create refresh token in database
    const tokenObject = await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiryDate,
      userAgent,
      ipAddress
    });
    
    return tokenObject.token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

// Verify refresh token
const verifyRefreshToken = async (token) => {
  try {
    // Find token in database
    const refreshToken = await RefreshToken.findOne({
      where: {
        token,
        isRevoked: false,
        expiryDate: { [Op.gt]: new Date() }
      },
      include: [{ model: RefreshToken.sequelize.models.User }]
    });
    
    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }
    
    return refreshToken;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    throw error;
  }
};

// Revoke a refresh token
const revokeRefreshToken = async (token) => {
  try {
    const refreshToken = await RefreshToken.findOne({ where: { token } });
    
    if (!refreshToken) {
      throw new Error('Token not found');
    }
    
    await refreshToken.update({ isRevoked: true });
    return true;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    throw error;
  }
};

// Revoke all refresh tokens for a user
const revokeAllUserRefreshTokens = async (userId) => {
  try {
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } }
    );
    return true;
  } catch (error) {
    console.error('Error revoking all user refresh tokens:', error);
    throw error;
  }
};

// Clean up expired tokens (can be run as a scheduled task)
const cleanupExpiredTokens = async () => {
  try {
    const result = await RefreshToken.destroy({
      where: {
        [Op.or]: [
          { expiryDate: { [Op.lt]: new Date() } },
          { isRevoked: true }
        ]
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  cleanupExpiredTokens
};
