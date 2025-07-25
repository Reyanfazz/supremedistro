// server/models/Product.js
import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },

  brand: { type: String, required: true },
  brandLogo: { type: String }, // ✅ Path to logo image
  brandDescription: { type: String }, // ✅ Description about the brand

  dailyPrice: { type: Number, required: true },
  offSalePrice: { type: Number },
  stock: { type: Number, default: 0 }, // ✅ Number of items in stock

  isFeatured: { type: Boolean, default: false },
  isDealOfDay: { type: Boolean, default: false },
  expiryDate: { type: Date, default: null },

  image: { type: String }, // ✅ Main image
  images: [{ type: String }], // ✅ Additional gallery images

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
