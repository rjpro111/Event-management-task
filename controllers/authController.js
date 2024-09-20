// backend/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (err) {
    next(err);
  }
};
