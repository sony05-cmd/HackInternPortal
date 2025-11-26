// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

// Middleware to check if user is recruiter or admin
exports.isRecruiterOrAdmin = (req, res, next) => {
  if (req.session && (req.session.userRole === 'recruiter' || req.session.userRole === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Recruiter or admin access required' });
};
