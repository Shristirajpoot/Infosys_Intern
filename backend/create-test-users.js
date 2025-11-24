// Test script to create sample users and test profile endpoints
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('./models/user.model');

const testUsers = [
  {
    name: 'Admin Sarah Johnson',
    email: 'admin@wastezero.com',
    password: 'admin123',
    role: 'admin',
    location: 'Admin Office, NYC',
    bio: 'System Administrator',
    skills: ['management', 'system-admin'],
    isVerified: true
  },
  {
    name: 'Green Earth Foundation',
    email: 'contact@greenearth.org', 
    password: 'ngo123',
    role: 'ngo',
    location: 'San Francisco, CA',
    bio: 'Environmental Conservation NGO',
    skills: ['environmental-conservation', 'community-outreach'],
    isVerified: true
  },
  {
    name: 'John Smith',
    email: 'john.smith@gmail.com',
    password: 'volunteer123', 
    role: 'volunteer',
    location: 'Los Angeles, CA',
    bio: 'Environmental Volunteer',
    skills: ['waste-management', 'recycling'],
    isVerified: true
  }
];

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastezero');
    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    console.log('Cleared existing test users');

    // Create new test users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.name} (${userData.role})`);
    }

    console.log('Test users created successfully!');
    console.log('\nLogin credentials:');
    testUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUsers();
