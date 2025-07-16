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

// === Middleware ===
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use(session({
  secret: '09d8a71cc46255b0268719484799422226da6e1fcff5835c5fb806a58463ae6b',
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
