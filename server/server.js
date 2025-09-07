// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import fs from 'fs';
import path from 'path';

// Routes
import './config/passport.js';
import productroutes from './routes/productRoutes.js';
import router from './routes/auth.js';
import protectedRoutes from './routes/protectedRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import addressRoutes from './routes/address.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/payment.js'; // payment intents
import webhookRoutes from './routes/paymentWebhook.js'; // webhook

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads folder if not exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// === CORS ===
const allowedOrigins = [
  'http://localhost:3000',
  'https://supremedistro.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// === Middleware ===
// Only parse JSON for normal routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(uploadsDir));

// === Routes ===
app.use('/api/auth', router);
app.use('/api/protected', protectedRoutes);
app.use('/api/products', productroutes);
app.use('/api/admin', adminRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/categories', categoryRoutes);

// ✅ Payment Intent route (JSON)
app.use('/api/payment', paymentRoutes);

// ✅ Stripe Webhook route (raw body, separate)
app.use('/api/webhook', webhookRoutes);

// === MongoDB connection ===
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
