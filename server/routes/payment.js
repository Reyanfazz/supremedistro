import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent & Save Order
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const { amount, shippingAddress, items, paymentMethod } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    if (!shippingAddress || !shippingAddress.address) return res.status(400).json({ error: "Shipping address is required." });

    // Create order in DB
    const order = await Order.create({
      user: req.user.id,
      products: items.map((i) => ({ product: i._id || i.product, quantity: i.quantity })),
      shippingAddress,
      totalAmount: amount / 100,
      paymentMethod: paymentMethod || "card",
      status: "pending",
      paymentStatus: "pending",
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      description: "SupremeDistro Order",
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order._id.toString(), userId: req.user.id },
    });

    // Save PaymentIntent ID
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: "Payment Intent creation failed" });
  }
});

export default router;
