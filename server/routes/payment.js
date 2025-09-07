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
    const { amount, shippingAddress, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Metadata max 500 chars
    const metadataItems = JSON.stringify(items.map((i) => i.name)).slice(0, 500);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      description: "SupremeDistro Order",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: metadataItems,
        name: shippingAddress?.name || "",
        email: shippingAddress?.email || "",
        phone: shippingAddress?.phone || "",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: "Payment Intent creation failed" });
  }
});

export default router;
