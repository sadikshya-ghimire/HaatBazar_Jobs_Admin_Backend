const jwt = require('jsonwebtoken');
const AdminInfo = require('../models/AdminInfo');

const protect = async (req, res, next) => {
  let token;

  console.log('Auth headers:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token.substring(0, 20) + '...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded, user ID:', decoded.id);
      
      req.user = await AdminInfo.findById(decoded.id).select('-password');
      console.log('User found:', req.user ? req.user.email : 'No user found');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      return next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
  }

  console.log('No token found in request');
  return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  console.log('Admin check - User role:', req.user?.role);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('Admin check failed. User:', req.user);
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };
