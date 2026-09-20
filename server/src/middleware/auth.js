const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kaal_kuaan_operational_secret_key_2026');
      req.user = await User.findOne({ userId: decoded.id }).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  // Allow optional public pass-through if header not provided
  req.user = { role: 'PUBLIC', name: 'Citizen / Visitor' };
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role [${req.user?.role || 'ANONYMOUS'}] is not permitted access to this operational route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
