import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/dashboard-stats', async (req, res) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [totalProducts, recentOrders, totalOrdersThisWeek] = await Promise.all([
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
  ]);

  res.json({
    totalProducts,
    totalOrdersThisWeek,
    recentOrders,
  });
});

export default router;
