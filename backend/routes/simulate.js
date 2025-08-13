const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const simulateController = require('../controllers/simulateController');
const auth = require('../middleware/auth');

router.post('/run', auth, [
  body('availableDrivers').isInt({ min: 1 }),
  body('routeStartTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('maxHoursPerDriver').isFloat({ min: 1 })
], async (req, res, next) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const output = await simulateController.runSimulation(req.body);
    res.json(output);
  } catch (err) { next(err); }
});

module.exports = router;
