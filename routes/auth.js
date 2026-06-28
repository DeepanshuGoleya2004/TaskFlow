const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_zenith_jwt_key_12345';

// ==========================================
// 1. User Registration Route
// ==========================================
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
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
    const { fullName, email, password } = req.body;

    // Check if email already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email address is already in use.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get avatar initials
    const avatar = fullName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase();

    // Create User
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'Member',
      avatar,
      isGuest: false
    });

    res.status(211).json({ 
      id: newUser._id, 
      message: 'Account created successfully! Redirecting to Login...' 
    });
  } catch (error) {
    console.error('Registration API Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error. Registration failed.' });
  }
});

// ==========================================
// 2. User Login Route
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.isGuest) {
      return res.status(401).json({ error: 'Invalid login email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
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

// ==========================================
// 3. Guest Login Route (Sandbox Reseeder)
// ==========================================
router.post('/guest-login', async (req, res) => {
  try {
    const guestUser = await User.findOne({ email: 'guest@taskflow.com' });
    if (!guestUser) {
      return res.status(500).json({ error: 'Predefined Guest Account missing in database.' });
    }

    // 1. Wipe previous Guest Tasks & associated data to sandbox sessions
    await Task.deleteMany({ user_id: guestUser._id });
    await Comment.deleteMany({ user_id: guestUser._id });
    await ActivityLog.deleteMany({ user_id: guestUser._id });

    // 2. Resolve default Categories
    const designCat = await Category.findOne({ name: 'Design' });
    const engineeringCat = await Category.findOne({ name: 'Engineering' });
    const generalCat = await Category.findOne({ name: 'General' });

    // ISO dates offsets
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const in3days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const in5days = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    // 3. Seed Demo Tasks for Guest User
    const demoTasks = [
      {
        title: 'Design Landing Page',
        description: 'Design glassmorphic layouts and color scheme details.',
        status: 'Todo',
        priority: 'High',
        category_id: designCat ? designCat._id : null,
        assignee_id: guestUser._id,
        user_id: guestUser._id,
        due_date: tomorrow,
        estimated_minutes: 240,
        actual_minutes: 0
      },
      {
        title: 'Learn React Hooks',
        description: 'Practice useState, useEffect, and custom hooks.',
        status: 'In Progress',
        priority: 'Medium',
        category_id: engineeringCat ? engineeringCat._id : null,
        assignee_id: guestUser._id,
        user_id: guestUser._id,
        due_date: in7days,
        estimated_minutes: 180,
        actual_minutes: 45
      },
      {
        title: 'Deploy MERN Project',
        description: 'Setup Render/Railway servers and MongoDB Atlas connection.',
        status: 'Todo',
        priority: 'Urgent',
        category_id: engineeringCat ? engineeringCat._id : null,
        assignee_id: guestUser._id,
        user_id: guestUser._id,
        due_date: in3days,
        estimated_minutes: 120,
        actual_minutes: 0
      },
      {
        title: 'Prepare Interview',
        description: 'Review JS algorithms and system architecture questions.',
        status: 'Review',
        priority: 'Medium',
        category_id: generalCat ? generalCat._id : null,
        assignee_id: guestUser._id,
        user_id: guestUser._id,
        due_date: in5days,
        estimated_minutes: 300,
        actual_minutes: 90
      },
      {
        title: 'Complete Internship Assignment',
        description: 'Submit the finished task tracker repository.',
        status: 'Completed',
        priority: 'High',
        category_id: generalCat ? generalCat._id : null,
        assignee_id: guestUser._id,
        user_id: guestUser._id,
        due_date: today,
        estimated_minutes: 120,
        actual_minutes: 120
      }
    ];

    await Task.insertMany(demoTasks);

    // 4. Log creation activity
    await ActivityLog.create({
      user_id: guestUser._id,
      action: 'created',
      details: 'Guest session sandbox reseeded with default tasks'
    });

    // 5. Generate JWT Token
    const token = jwt.sign({ id: guestUser._id }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      user: {
        id: guestUser._id,
        fullName: guestUser.fullName,
        email: guestUser.email,
        role: guestUser.role,
        avatar: guestUser.avatar,
        isGuest: true
      }
    });
  } catch (error) {
    console.error('Guest Login API Error:', error.message);
    res.status(500).json({ error: 'Failed to initialize Guest session.' });
  }
});

// ==========================================
// 4. User Profile Details & Statistics Route
// ==========================================
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch stats for profile page
    const totalTasks = await Task.countDocuments({ user_id: userId });
    const completedTasks = await Task.countDocuments({ user_id: userId, status: 'Completed' });
    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const dbUser = await User.findById(userId);

    res.json({
      fullName: dbUser.fullName,
      email: dbUser.email,
      role: dbUser.role,
      avatar: dbUser.avatar,
      isGuest: dbUser.isGuest,
      joinedDate: dbUser.createdAt,
      stats: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_percent: completionPercent
      }
    });
  } catch (error) {
    console.error('Profile API Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
});

// ==========================================
// 5. User Logout Endpoint
// ==========================================
router.post('/logout', authenticate, async (req, res) => {
  try {
    if (req.user.isGuest) {
      // Clear guest specific tasks on exit
      await Task.deleteMany({ user_id: req.user.id });
      await Comment.deleteMany({ user_id: req.user.id });
      await ActivityLog.deleteMany({ user_id: req.user.id });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout API Error:', error.message);
    res.status(500).json({ error: 'Error processing logout.' });
  }
});

module.exports = router;
