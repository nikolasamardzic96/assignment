const express = require('express');
const router = express.Router();
const { adminService } = require('../services/service.registry');
const { validateDateRange } = require('../utils/validators');

router.get('/best-profession', async (req, res) => {
  const { start, end } = validateDateRange(req.query.start, req.query.end);

  if (!start || !end) {
    return res.status(400).json({ error: 'Invalid or missing date range' });
  }

  try {
    const result = await adminService.getBestProfession({ start, end });

    if (!result) {
      return res.status(404).json({ error: 'No paid jobs found in the given range' });
    }

    res.json(result);
  } catch (err) {
    console.error('Best profession error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/best-clients', async (req, res) => {
  const { start, end } = validateDateRange(req.query.start, req.query.end);
  const limit = req.query.limit;
  
  if (!start || !end) {
    return res.status(400).json({ error: 'Invalid or missing date range' });
  }

  try {
    const results = await adminService.getBestClients({ start, end, limit });
    res.json(results);
  } catch (err) {
    console.error('Best clients error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
