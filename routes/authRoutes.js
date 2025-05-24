const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidationRules, registrationValidationRules, passwordResetValidationRules, passwordChangeValidationRules, validate } = require('../middlewares/validation');
const authMiddleware = require('../middlewares/auth');

// Public routes
router.post('/register', registrationValidationRules(), validate, authController.register);
router.post('/login', loginValidationRules(), validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification-email', authController.resendVerificationEmail);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', passwordResetValidationRules(), validate, authController.resetPassword);

// Protected routes (require authentication)
router.use(authMiddleware);
router.post('/change-password', passwordChangeValidationRules(), validate, authController.changePassword);
router.put('/profile', authController.updateProfile);
router.post('/logout-all', authController.logoutAll);

module.exports = router;
