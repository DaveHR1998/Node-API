// Admin middleware - checks if the authenticated user has admin role
const adminMiddleware = (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // If user is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while checking admin privileges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = adminMiddleware;
