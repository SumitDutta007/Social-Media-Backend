const jwt = require('jsonwebtoken');

// JWT Secret (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT Token
const generateToken = (userId, isAdmin = false) => {
  return jwt.sign(
    { 
      id: userId,
      isAdmin: isAdmin 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Verify JWT Token Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      message: 'Please login to access this resource'
    });
  }

  try {
    // Extract token from "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.',
        message: 'Token format should be: Bearer <token>'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'Authentication failed. Please login again.'
    });
  }
};

// Verify User Authorization (user can only modify their own data)
const verifyAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Access denied',
        message: 'You are not authorized to perform this action'
      });
    }
  });
};

// Verify Admin Role
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required for this action'
      });
    }
  });
};

module.exports = {
  generateToken,
  verifyToken,
  verifyAuthorization,
  verifyAdmin
};
