// === server.js (root of backend) ===
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';

import router from './routes/auth.js';
import protectedRoutes from './routes/protectedRoutes.js';

// === Load env ===
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// === CORS ===
const allowedOrigins = [
  'http://localhost:3000',
  'https://supremedistro.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// === Middleware ===
app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// === Routes ===
app.use('/api/auth', router);
app.use('/api/protected', protectedRoutes);

// === MongoDB connection ===
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
