const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_zenith_jwt_key_12345';

// Authenticate JWT Token middleware
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Authentication token is empty.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User session expired or user no longer exists.' });
    }

    // Attach user profile payload to request context
    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isGuest: user.isGuest
    };

    next();
  } catch (error) {
    console.error('JWT Authentication Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Session signature invalid. Access denied.' });
  }
}

// Role Authorization middleware (RBAC)
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication credentials not set.' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied. Required roles: [${roles.join(', ')}]. Current role: [${req.user.role}].` 
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
