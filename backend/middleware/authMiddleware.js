const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded user info (id, role) to request
      req.user = decoded;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ msg: 'Not authorized, token failed or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no access token provided.' });
  }
};

// Middleware to restrict access based on user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: 'Access denied. User role not found.' });
    }

    const normalizedUserRole = req.user.role.toLowerCase();
    const normalizedAllowedRoles = roles.map(r => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({ 
        msg: `Access denied. Role '${req.user.role}' is not authorized to perform this action.` 
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
