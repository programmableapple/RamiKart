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

    const newUser = new User({
      name,
      userName,
      email,
      password,
      role: role || 'user'
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
  const {oldPassword, newPassword} = req.body;
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