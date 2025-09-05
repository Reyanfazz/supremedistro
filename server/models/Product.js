// server/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },

  brand: { type: String, required: true },
  brandLogo: { type: String },
  brandDescription: { type: String },

  dailyPrice: { type: Number, required: true },
  offSalePrice: { type: Number },
  stock: { type: Number, default: 0 },

  isFeatured: { type: Boolean, default: false },
  isDealOfDay: { type: Boolean, default: false },
  expiryDate: { type: Date, default: null },

  image: { type: String },
  images: [{ type: String }],
}, { timestamps: true });

// ✅ Fix OverwriteModelError by reusing existing model if loaded
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
