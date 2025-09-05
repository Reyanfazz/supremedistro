import express from 'express';
import Order from '../models/Order.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Save order after successful payment
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { products, shippingAddress, totalAmount, paymentMethod } = req.body;

    if (!shippingAddress || !shippingAddress.address) {
      return res.status(400).json({ error: 'Shipping address is required.' });
    }

    const order = new Order({
      user: req.user.id,
      products,
      shippingAddress,
      totalAmount,
      paymentMethod,
      status: 'pending', // default status
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders for admin
router.get('/admin', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('products.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for a specific user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('products.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

export default router;
