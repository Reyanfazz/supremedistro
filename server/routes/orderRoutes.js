// backend/routes/orderRoutes.js
import express from 'express';
import Order from '../models/Order.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ✅ Create order AFTER payment is successful
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const { products, shippingAddress, totalAmount, paymentMethod, paymentIntentId } = req.body;

    if (!shippingAddress || !shippingAddress.address) {
      return res.status(400).json({ error: 'Shipping address is required.' });
    }

    const order = new Order({
      user: req.user.id,
      products,
      shippingAddress,
      totalAmount,
      paymentMethod,
      paymentIntentId,
      status: 'pending', // will move to 'paid' or 'processing' if needed
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Order save error:", err);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// ✅ Admin - All orders
router.get('/admin', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ User - My orders
router.get('/user', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

export default router;
