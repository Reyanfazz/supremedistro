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
    default: 'pending', // fulfillment status
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending', // payment status
  },
  paymentIntentId: { type: String }, // Stripe PaymentIntent ID
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
}, { timestamps: true });

// Virtual for total quantity
orderSchema.virtual('totalQuantity').get(function () {
  return this.products.reduce((acc, item) => acc + item.quantity, 0);
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
