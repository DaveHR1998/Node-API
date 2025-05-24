const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

// Apply auth middleware to all routes
router.use(authMiddleware);

// User routes
router.get('/', adminMiddleware, userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', adminMiddleware, userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/toggle-status', adminMiddleware, userController.toggleUserStatus);

module.exports = router;
