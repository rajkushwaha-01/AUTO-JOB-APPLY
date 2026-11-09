const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../modules/user.model");

// POST /api/auth/register
// (input validation is handled upstream by registerValidator + validate middleware)
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(201).json({
      token,
      user // password is stripped automatically by the toJSON override on the model
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
// (input validation is handled upstream by loginValidator + validate middleware)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected, uses req.userId set by auth middleware)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };