const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema({
  input: { type: Object, required: true },
  result: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SimulationResult', SimulationSchema);
