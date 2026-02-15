// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  avatar: { type: String, default: '' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  settings: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, enum: ['en', 'es', 'fr', 'de', 'zh'], default: 'en' },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
      activityStatus: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
    },
    appearance: {
      reducedMotion: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    },
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
