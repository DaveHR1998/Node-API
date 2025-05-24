const User = require('../models/user');
const { Op } = require('sequelize');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if requester is admin or the user themselves
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { firstName, lastName, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user',
      isActive: true
    });

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userData
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a user (admin for any user, users for themselves)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, role, isActive } = req.body;
    
    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === parseInt(userId);
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }

    // Find the user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    
    // Only admin can change email, role, and active status
    if (isAdmin) {
      if (email) {
        // Check if email is already in use by another user
        const existingUser = await User.findOne({ 
          where: { 
            email,
            id: { [Op.ne]: userId }
          } 
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use by another user'
          });
        }
        
        updateData.email = email;
      }
      
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    // Update the user
    await user.update(updateData);

    // Get updated user without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Activate/Deactivate a user (admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const userId = req.params.id;
    
    // Find the user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow deactivating yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Toggle active status
    await user.update({ isActive: !user.isActive });

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while toggling user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
