import { Router } from 'express';
const router = Router();
import { genSalt, hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import '../config/passport.js'; // ensure passport config runs once

import User from '../models/User.js';

const { sign, verify } = jwt;

// Helper: generate JWT token
const generateToken = (user) => {
  return sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Manual Register (default role: 'user')
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please enter all fields' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const salt = await genSalt(10);
    const hashed = await hash(password, salt);

    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: { id: newUser._id, name, email, role: newUser.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please enter all fields' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.password)
      return res.status(400).json({ message: 'Please login with Google' });

    const isMatch = await compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    // Pass token and role to frontend for role-based navigation
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}&role=${req.user.role}`
    );
  }
);

// JWT Authorization Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Example protected route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You have access to protected data', user: req.user });
});

export default router;
