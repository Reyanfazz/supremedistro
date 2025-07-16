import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user-dashboard', protect, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}` });
});

router.get('/admin-dashboard', protect, isAdmin, (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

export default router;