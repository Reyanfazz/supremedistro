import express from 'express';
import Address from '../models/Address.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ GET all addresses for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// ✅ POST add new address
router.post('/', protect, async (req, res) => {
  try {
    const { fullName, phone, addressLine, city, postalCode, country } = req.body;

    if (!fullName || !phone || !addressLine || !city || !postalCode || !country) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newAddress = new Address({
      fullName,
      phone,
      addressLine,
      city,
      postalCode,
      country,
      userId: req.user.id,
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to save address' });
  }
});

// ✅ PUT update address
router.put('/:id', protect, async (req, res) => {
  try {
    const { fullName, phone, addressLine, city, postalCode, country } = req.body;

    if (!fullName || !phone || !addressLine || !city || !postalCode || !country) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const updated = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { fullName, phone, addressLine, city, postalCode, country },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Address not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update address' });
  }
});

// ✅ DELETE address
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete address' });
  }
});

export default router;
