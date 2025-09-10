const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Verification = require('../models/Verification');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateCode } = require('../utils/generateCode');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Generate verification code
    const verificationCode = generateCode(6);
    
    // Remove any existing verification codes for this email
    await Verification.deleteMany({ email });
    
    // Save verification code
    await Verification.create({
      email,
      code: verificationCode
    });
    
    // Send verification email
    await sendVerificationEmail(email, verificationCode);
    
    res.status(200).json({ 
      message: 'Verification code sent to your email',
      email 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify code endpoint
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Find the verification code
    const verification = await Verification.findOne({ email, code });
    
    if (!verification) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Check if code is expired (manually check since TTL might not have deleted it yet)
    const now = new Date();
    const codeAge = now - verification.createdAt;
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    if (codeAge > tenMinutes) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }
    
    // Create user
    const { name, mobile, password } = req.body;
    const newUser = await User.create({
      name,
      email,
      mobile,
      password,
      isVerified: true
    });
    
    // Delete verification code
    await Verification.deleteOne({ email, code });
    
    // Generate token
    const token = signToken(newUser._id);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists and is verified
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }
    
    // Generate token
    const token = signToken(user._id);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change password endpoint
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId).select('+password');
    
    // Check current password
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;