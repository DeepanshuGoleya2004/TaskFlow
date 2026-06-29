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

module.exports = {
  initDatabase
};
