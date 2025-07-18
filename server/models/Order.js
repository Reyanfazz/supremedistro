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

const Order = mongoose.model('Order', orderSchema);

export default Order;
