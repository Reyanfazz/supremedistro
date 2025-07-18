// server/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dailyPrice: { type: Number, required: true },
  offSalePrice: { type: Number },
  isFeatured: { type: Boolean, default: false },
   isDealOfDay: { type: Boolean, default: false },
  expiryDate: { type: Date, default: null },
  image: { type: String },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
