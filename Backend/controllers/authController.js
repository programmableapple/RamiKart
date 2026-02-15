const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const logger = require("./logger");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  const { name, userName, email, password, role } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      logger.warning(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
      logger.warning(`Registration attempt with existing username: ${userName}`);
      return res.status(400).json({ message: 'Username already in use' });
    }

    // Auto-assign admin for specific email, otherwise always default to 'user'
    const ADMIN_EMAIL = 'rami.khayata49@gmail.com';
    const assignedRole = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';

    const newUser = new User({
      name,
      userName,
      email,
      password,
      role: assignedRole
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    logger.success(`New user registered: ${email} with role: ${newUser.role}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        userName: newUser.userName,
        email: newUser.email,
        role: newUser.role
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    logger.error('Registration Error: ' + err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Try finding user by either email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { userName: emailOrUsername }]
    });

    if (!user) {
      logger.warning(`Login failed: No user found for ${emailOrUsername}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user has passwordHash field before comparing
    if (!user.password) {
      logger.error(`No password hash found for user ${user._id}`);
      return res.status(500).json({ message: "Internal server error" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warning(`Login failed: Incorrect password for ${emailOrUsername}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create or update session
    await Session.findOneAndUpdate(
      { userId: user._id },
      {
        refreshToken,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    logger.info(`║ ✅ User ${user.email} logged in successfully`);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userName: user.userName,
        role: user.role
      }
    });
  } catch (err) {
    logger.error("Login Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    await Session.findOneAndDelete({ userId: decoded.id });
    logger.info(`║ ✅ User ${decoded.name} logged out and session cleared`);

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    logger.error("Logout Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ id: user.id });
    res.json({ accessToken });
  });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });


    user.password = newPassword;
    await user.save();

    logger.info(`║ ✅ Password changed successfully for user ${user.email}`);
    res.status(200).json({ message: "Password changed successfully" });
  }
  catch (err) {
    logger.error("Change Password Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }

}

/**
 * GET /api/auth/settings
 * Retrieve the current user's settings.
 */
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Provide defaults if settings don't exist yet (for pre-existing users)
    const defaults = {
      theme: 'system',
      language: 'en',
      privacy: {
        profileVisibility: 'public',
        activityStatus: true,
        showEmail: false,
      },
      appearance: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
      },
    };

    const settings = user.settings || defaults;
    res.json({ settings });
  } catch (err) {
    logger.error("Get Settings Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/auth/settings
 * Update the current user's settings (deep merge).
 */
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const incoming = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Deep merge: only update fields that are provided
    if (!user.settings) {
      user.settings = {};
    }

    if (incoming.theme !== undefined) user.settings.theme = incoming.theme;
    if (incoming.language !== undefined) user.settings.language = incoming.language;

    if (incoming.privacy) {
      if (!user.settings.privacy) user.settings.privacy = {};
      if (incoming.privacy.profileVisibility !== undefined)
        user.settings.privacy.profileVisibility = incoming.privacy.profileVisibility;
      if (incoming.privacy.activityStatus !== undefined)
        user.settings.privacy.activityStatus = incoming.privacy.activityStatus;
      if (incoming.privacy.showEmail !== undefined)
        user.settings.privacy.showEmail = incoming.privacy.showEmail;
    }

    if (incoming.appearance) {
      if (!user.settings.appearance) user.settings.appearance = {};
      if (incoming.appearance.reducedMotion !== undefined)
        user.settings.appearance.reducedMotion = incoming.appearance.reducedMotion;
      if (incoming.appearance.highContrast !== undefined)
        user.settings.appearance.highContrast = incoming.appearance.highContrast;
      if (incoming.appearance.fontSize !== undefined)
        user.settings.appearance.fontSize = incoming.appearance.fontSize;
    }

    user.markModified('settings');
    await user.save();

    logger.info(`║ ✅ Settings updated for user ${user.email}`);
    res.json({ message: "Settings updated successfully", settings: user.settings });
  } catch (err) {
    logger.error("Update Settings Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/auth/profile
 * Retrieve the current user's profile.
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -settings');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      profile: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        website: user.website || '',
        avatar: user.avatar || '',
        role: user.role,
      }
    });
  } catch (err) {
    logger.error("Get Profile Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/auth/profile
 * Update the current user's profile (supports avatar file upload).
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, userName, email, bio, location, phone, website } = req.body;

    // Check if email is being changed and is unique
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    // Check if username is being changed and is unique
    if (userName && userName !== user.userName) {
      const existing = await User.findOne({ userName });
      if (existing) return res.status(400).json({ message: "Username already taken" });
      user.userName = userName;
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (phone !== undefined) user.phone = phone;
    if (website !== undefined) user.website = website;

    // Handle avatar upload
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    logger.info(`║ ✅ Profile updated for user ${user.email}`);
    res.json({
      message: "Profile updated successfully",
      profile: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        website: user.website,
        avatar: user.avatar,
        role: user.role,
      }
    });
  } catch (err) {
    logger.error("Update Profile Error: " + err.message);
    res.status(500).json({ message: "Server error" });
  }
};