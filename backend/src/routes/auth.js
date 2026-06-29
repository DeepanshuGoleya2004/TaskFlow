const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

// Models
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_zenith_jwt_key_12345';

// User Registration Route
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('mobileNumber').trim().notEmpty().withMessage('Mobile Number is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirm password must match password');
    }
    return true;
  })
];

router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { fullName, email, mobileNumber, password } = req.body;

    // Check if email already registered
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ error: 'Email address is already in use.' });
    }

    // Check if mobile number already registered
    const mobileExists = await User.findOne({ mobileNumber });
    if (mobileExists) {
      return res.status(400).json({ error: 'Mobile number is already in use.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get avatar initials
    const avatar = fullName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase();

    // Create User
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      mobileNumber,
      password: hashedPassword,
      role: 'Member',
      avatar,
      isGuest: false
    });

    res.status(201).json({ 
      id: newUser._id, 
      message: 'Account created successfully! Redirecting to Login...' 
    });
  } catch (error) {
    console.error('Registration API Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error. Registration failed.' });
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  try {
    const { loginId, email, password } = req.body;
    const identifier = loginId || email;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Mobile and password are required' });
    }

    // Validate email/mobile format
    const isEmail = identifier.includes('@');
    if (isEmail) {
      if (!/^\S+@\S+\.\S+$/.test(identifier)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    } else {
      if (!/^\d{7,15}$/.test(identifier)) {
        return res.status(400).json({ error: 'Invalid mobile number format' });
      }
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Search user by email or mobile
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { mobileNumber: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        avatar: user.avatar,
        isGuest: false
      }
    });
  } catch (error) {
    console.error('Login API Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error. Login failed.' });
  }
});

// Me Profile Retrieval Endpoint
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, '-password');
    if (!user) {
      return res.status(404).json({ error: 'User session not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Me Session API Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve active session.' });
  }
});

// User Profile Details Route
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const dbUser = await User.findById(userId, '-password');
    if (!dbUser) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      fullName: dbUser.fullName,
      email: dbUser.email,
      mobileNumber: dbUser.mobileNumber,
      role: dbUser.role,
      avatar: dbUser.avatar,
      isGuest: dbUser.isGuest,
      joinedDate: dbUser.createdAt
    });
  } catch (error) {
    console.error('Profile API Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
});

// User Logout Endpoint
router.post('/logout', authenticate, async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout API Error:', error.message);
    res.status(500).json({ error: 'Error processing logout.' });
  }
});

// Check registered users count
router.get('/check-users', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Check users count error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve user count.' });
  }
});

module.exports = router;
