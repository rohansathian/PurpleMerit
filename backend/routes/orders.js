const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  valueRs: { type: Number, required: true },
  routeId: { type: String, required: true },
  deliveryTimestamp: { type: Date } // optional historical timestamp
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
