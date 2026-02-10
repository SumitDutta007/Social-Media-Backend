/**
 * Script to Create Admin Users
 * 
 * Usage: node create-admin.js
 * 
 * This script allows you to create admin users securely
 * without exposing admin registration to the public
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user');

// Admin user details
const adminUser = {
  username: 'admin',
  email: 'admin@socialapp.com',
  password: 'Admin@123',  // Change this!
  isAdmin: true
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { username: adminUser.username },
        { email: adminUser.email }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Is Admin:', existingAdmin.isAdmin);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // Create admin user
    const newAdmin = await User.create({
      username: adminUser.username,
      email: adminUser.email,
      password: hashedPassword,
      isAdmin: true
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', newAdmin.username);
    console.log('Email:', newAdmin.email);
    console.log('Is Admin:', newAdmin.isAdmin);
    console.log('User ID:', newAdmin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Login Credentials:');
    console.log('Username:', adminUser.username);
    console.log('Password:', adminUser.password);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

createAdmin();
