const express = require('express');
const router = express.Router();
const SimulationResult = require('../models/SimulationResult');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    const items = await SimulationResult.find().sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (err) { next(err); }
});

module.exports = router;
