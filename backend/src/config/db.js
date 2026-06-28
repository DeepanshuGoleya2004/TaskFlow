const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load Schema Models
const User = require('../models/User');
const Category = require('../models/Category');

const MONODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task_tracker';

async function initDatabase() {
  console.log('Connecting to MongoDB...');
  
  try {
    await mongoose.connect(MONODB_URI);
    console.log('✅ Connected to MongoDB successfully.');
    
    // Seed initial collections
    await seedCategories();
    await seedDefaultUsers();
    
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB or seed database:', error.message);
    throw error;
  }
}

async function seedCategories() {
  const count = await Category.countDocuments();
  if (count === 0) {
    console.log('Seeding initial categories to MongoDB...');
    const categories = [
      { name: 'Design', color: 'hsl(280, 80%, 65%)', icon: '🎨' },
      { name: 'Engineering', color: 'hsl(200, 80%, 65%)', icon: '💻' },
      { name: 'Marketing', color: 'hsl(340, 80%, 65%)', icon: '📈' },
      { name: 'General', color: 'hsl(120, 80%, 65%)', icon: '⚙️' }
    ];
    await Category.insertMany(categories);
    console.log('Categories seeded.');
  }
}

async function seedDefaultUsers() {
  // 1. Seed Admin
  const adminExists = await User.findOne({ email: 'admin@taskflow.com' });
  if (!adminExists) {
    console.log('Seeding default Admin user...');
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    await User.create({
      fullName: 'System Admin',
      email: 'admin@taskflow.com',
      password: hashedPassword,
      role: 'Admin',
      avatar: 'SA',
      isGuest: false
    });
  }

  // 2. Seed Default Member (Sarah Connor)
  const memberExists = await User.findOne({ email: 'sarah@taskflow.com' });
  if (!memberExists) {
    console.log('Seeding default Member user (Sarah)...');
    const hashedPassword = await bcrypt.hash('SarahPass123!', 10);
    await User.create({
      fullName: 'Sarah Connor',
      email: 'sarah@taskflow.com',
      password: hashedPassword,
      role: 'Member',
      avatar: 'SC',
      isGuest: false
    });
  }

  // 3. Seed Default Guest
  const guestExists = await User.findOne({ email: 'guest@taskflow.com' });
  if (!guestExists) {
    console.log('Seeding default Guest account...');
    const hashedPassword = await bcrypt.hash('GuestPass123!', 10);
    await User.create({
      fullName: 'Guest User',
      email: 'guest@taskflow.com',
      password: hashedPassword,
      role: 'Guest',
      avatar: 'GU',
      isGuest: true
    });
  }
}

module.exports = {
  initDatabase
};
