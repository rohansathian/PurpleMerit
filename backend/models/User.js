const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: { type: String },
  role: { type: String, default: 'manager' }
});

module.exports = mongoose.model('User', UserSchema);
