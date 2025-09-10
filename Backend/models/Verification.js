// backend/models/Verification.js
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be deleted 600 seconds (10 minutes) after createdAt
  }
});

module.exports = mongoose.model('Verification', verificationSchema);