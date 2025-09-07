// backend/routes/paymentWebhook.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import Order from "../models/Order.js";

dotenv.config();
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Raw body parser required by Stripe
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payments
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      try {
        // Metadata (short)
        const shippingAddress = {
          name: paymentIntent.metadata.name || "",
          email: paymentIntent.metadata.email || "",
          phone: paymentIntent.metadata.phone || "",
        };

        // ✅ Get full cart sent from frontend (optional: store in DB directly via payment intent)
        const items = paymentIntent.metadata.fullCart
          ? JSON.parse(paymentIntent.metadata.fullCart)
          : []; // fallback empty

        // Save order with exact cart info
        await Order.create({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "paid",
          customerEmail: shippingAddress.email,
          customerName: shippingAddress.name,
          customerPhone: shippingAddress.phone,
          shippingAddress,
          items: items.length
            ? items
            : paymentIntent.metadata.items
            ? paymentIntent.metadata.items.split(",").map((name) => ({ name, quantity: 1 }))
            : [],
          paymentMethod: paymentIntent.payment_method_types[0],
          createdAt: new Date(),
        });

        console.log("✅ Order saved:", paymentIntent.id);
      } catch (dbErr) {
        console.error("❌ Failed to save order:", dbErr.message);
      }
    }

    res.json({ received: true });
  }
);

export default router;
