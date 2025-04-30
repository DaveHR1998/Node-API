const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidationRules, validate } = require('../middlewares/validation');

// Login route with validation
router.post('/login', loginValidationRules(), validate, authController.login);

module.exports = router;
