const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentShiftHours: { type: Number, default: 0 }, // hours today
  past7DaysHours: { type: [Number], default: [] } // up to 7 numbers
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);
