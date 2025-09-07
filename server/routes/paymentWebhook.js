import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import Order from "../models/Order.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const handlePaymentIntent = async (paymentIntent, status) => {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;
    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = status;
        await order.save();
        console.log(`Order ${orderId} payment marked as ${status}`);
      }
    } catch (err) {
      console.error(`Failed to update order ${orderId}:`, err.message);
    }
  };

  if (event.type === "payment_intent.succeeded") await handlePaymentIntent(event.data.object, "succeeded");
  if (event.type === "payment_intent.payment_failed") await handlePaymentIntent(event.data.object, "failed");

  res.json({ received: true });
});

export default router;
