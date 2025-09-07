// backend/routes/paymentRoutes.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, shippingAddress, metadataItems, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      description: "SupremeDistro Order",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: metadataItems || "", // short string for Stripe
        name: shippingAddress?.name || "",
        email: shippingAddress?.email || "",
        phone: shippingAddress?.phone || "",
      },
    });

    // Send clientSecret & full items to frontend (for DB save via webhook)
    res.json({ clientSecret: paymentIntent.client_secret, items });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: "Payment Intent creation failed" });
  }
});

export default router;
