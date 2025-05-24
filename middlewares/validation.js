const { body, validationResult } = require('express-validator');

// Validation rules for login
const loginValidationRules = () => {
  return [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ];
};

// Validation rules for registration
const registrationValidationRules = () => {
  return [
    body('firstName')
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ];
};

// Validation rules for password reset
const passwordResetValidationRules = () => {
  return [
    body('token')
      .notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ];
};

// Validation rules for password change
const passwordChangeValidationRules = () => {
  return [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('New password must be different from current password');
        }
        return true;
      })
  ];
};

// Validation rules for task creation
const taskValidationRules = () => {
  return [
    body('title')
      .notEmpty().withMessage('Task title is required')
      .isLength({ max: 100 }).withMessage('Task title must be less than 100 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status value'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),
    body('dueDate')
      .optional()
      .isISO8601().withMessage('Due date must be a valid date')
  ];
};

// Middleware to validate the request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    success: false,
    errors: extractedErrors
  });
};

module.exports = {
  loginValidationRules,
  registrationValidationRules,
  passwordResetValidationRules,
  passwordChangeValidationRules,
  taskValidationRules,
  validate
};
