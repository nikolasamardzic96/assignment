const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const { profileService } = require('../services/service.registry');
const { ProfileType } = require('../const');

router.post('/deposit/:userId', getProfile, async (req, res) => {
  const profile = req.profile;
  const { userId } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  if (profile.type !== ProfileType.CLIENT) {
    return res.status(403).json({ error: 'Only clients can deposit' });
  }

  if (parseInt(userId) !== profile.id) {
    return res.status(403).json({ error: 'You can only deposit to your own account' });
  }

  const sequelize = req.app.get('sequelize');
  const result = await profileService.depositBalance({ profile, amount, sequelize });

  if (result?.error) {
    return res.status(result.status || 500).json({ error: result.error });
  }

  res.json(result);
});

module.exports = router;
