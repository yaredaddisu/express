const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Unauthorized' });
    }
  };
};

module.exports = authorizeRole;
