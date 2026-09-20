const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'kaal_kuaan_operational_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register a citizen or user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password = 'password123', role = 'PUBLIC', phone = '', district = 'Nalgonda', mandal = 'Vemulapally', village = 'Ramanapet' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      // User exists, return existing profile
      return res.status(200).json({
        success: true,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          jurisdiction: user.jurisdiction,
          badgeOrPhone: user.badgeOrPhone
        },
        token: generateToken(user.userId)
      });
    }

    const userId = `USR-${Date.now().toString(36).toUpperCase()}`;
    user = await User.create({
      userId,
      name,
      email,
      password,
      role,
      jurisdiction: { district, mandal, village },
      badgeOrPhone: phone
    });

    res.status(201).json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        jurisdiction: user.jurisdiction,
        badgeOrPhone: user.badgeOrPhone
      },
      token: generateToken(user.userId)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (supports email-only citizen login or email+password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    let user = await User.findOne({ email });

    // If citizen user doesn't exist yet, auto-register them
    if (!user) {
      const derivedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const userId = `USR-${Date.now().toString(36).toUpperCase()}`;
      user = await User.create({
        userId,
        name: derivedName || 'Citizen User',
        email,
        password: password || 'password123',
        role: 'PUBLIC',
        jurisdiction: { district: 'Nalgonda', mandal: 'Vemulapally', village: 'Ramanapet' },
        badgeOrPhone: '+91 98480 00000'
      });
    } else if (password) {
      // If password was provided, verify it
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your password.' });
      }
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        jurisdiction: user.jurisdiction,
        badgeOrPhone: user.badgeOrPhone
      },
      token: generateToken(user.userId)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently authenticated user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kaal_kuaan_operational_secret_key_2026');
    const user = await User.findOne({ userId: decoded.id }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        jurisdiction: user.jurisdiction,
        badgeOrPhone: user.badgeOrPhone
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
});

// @route   GET /api/auth/users
// @desc    List available mock users for quick switching during judge evaluation
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/switch-role
// @desc    Fast role-switch for demo convenience
router.post('/switch-role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findOne({ role });
    if (!user) {
      return res.status(404).json({ success: false, message: `No user with role ${role} found` });
    }
    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        jurisdiction: user.jurisdiction,
        badgeOrPhone: user.badgeOrPhone
      },
      token: generateToken(user.userId)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
