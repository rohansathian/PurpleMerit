const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');

// Create
router.post('/', auth, async (req, res, next) => {
  try {
    const d = await Driver.create(req.body);
    res.json(d);
  } catch (err) { next(err); }
});

// Read all
router.get('/', auth, async (req, res, next) => {
  try { const ds = await Driver.find(); res.json(ds); } catch (err) { next(err); }
});

// Read one
router.get('/:id', auth, async (req, res, next) => {
  try { const d = await Driver.findById(req.params.id); res.json(d); } catch (err) { next(err); }
});

// Update
router.put('/:id', auth, async (req, res, next) => {
  try { const d = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(d); } catch (err) { next(err); }
});

// Delete
router.delete('/:id', auth, async (req, res, next) => {
  try { await Driver.findByIdAndDelete(req.params.id); res.json({ ok:true }); } catch (err) { next(err); }
});

module.exports = router;
