
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    priceAtPurchase: { type: Number },
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentInfo: {
    method: { type: String },
    status: { type: String }
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
