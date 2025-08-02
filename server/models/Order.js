// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'packed', 'shipped', 'out-for-delivery', 'delivered'],
    default: 'pending',
  },
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
  totalAmount: Number,
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// ✅ Add virtual for total quantity
orderSchema.virtual('totalQuantity').get(function () {
  return this.products.reduce((acc, item) => acc + item.quantity, 0);
});

// ✅ Ensure shippingAddress is always required for confirmed orders
orderSchema.pre('validate', function (next) {
  if (this.isNew && (!this.shippingAddress || !this.shippingAddress.address)) {
    return next(new Error('Shipping address is required.'));
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
