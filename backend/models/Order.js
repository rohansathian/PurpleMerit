const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // your schema fields here
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  }
}, { timestamps: true });

// ✅ Prevent OverwriteModelError by reusing existing model if it exists
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
