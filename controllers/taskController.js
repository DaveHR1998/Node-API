const Task = require('../models/task');
const User = require('../models/user');
const { Op } = require('sequelize');

// Get all tasks (with optional filtering)
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Build filter conditions
    const whereConditions = {};
    
    // If not admin, only show user's own tasks
    if (!isAdmin) {
      whereConditions.userId = userId;
    }
    
    // Filter by status if provided
    if (status) {
      whereConditions.status = status;
    }
    
    // Filter by priority if provided
    if (priority) {
      whereConditions.priority = priority;
    }
    
    // Search in title and description if search term provided
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Get tasks with user information
    const tasks = await Task.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Build query conditions
    const whereConditions = { id: taskId };
    
    // If not admin, only allow access to own tasks
    if (!isAdmin) {
      whereConditions.userId = userId;
    }
    
    const task = await Task.findOne({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, priority } = req.body;
    const userId = req.body.userId || req.user.id;
    
    // If a non-admin user tries to create a task for someone else
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create tasks for other users'
      });
    }
    
    // Check if the user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create the task
    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      priority,
      userId
    });
    
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { title, description, status, dueDate, priority } = req.body;
    
    // Build query conditions
    const whereConditions = { id: taskId };
    
    // If not admin, only allow updating own tasks
    if (!isAdmin) {
      whereConditions.userId = userId;
    }
    
    // Find the task
    const task = await Task.findOne({ where: whereConditions });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to update it'
      });
    }
    
    // Update the task
    await task.update({
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      status: status || task.status,
      dueDate: dueDate || task.dueDate,
      priority: priority || task.priority
    });
    
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Build query conditions
    const whereConditions = { id: taskId };
    
    // If not admin, only allow deleting own tasks
    if (!isAdmin) {
      whereConditions.userId = userId;
    }
    
    // Find the task
    const task = await Task.findOne({ where: whereConditions });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it'
      });
    }
    
    // Delete the task
    await task.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
