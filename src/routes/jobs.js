const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const { jobService } = require('../services/service.registry');
const { ProfileType } = require('../const');

router.get('/unpaid', getProfile, async (req, res) => {
  const profileId = req.profile.id;

  const unpaidJobs = await jobService.getUnpaidJobsForProfile(profileId);

  if (!unpaidJobs?.length) return res.status(404).end();
  res.json(unpaidJobs);
});

router.post('/:job_id/pay', getProfile, async (req, res) => {
  const { job_id } = req.params;
  const profile = req.profile;

  if (profile.type !== ProfileType.CLIENT) {
    return res.status(403).json({ error: 'Only clients can pay for jobs' });
  }

  const sequelize = req.app.get('sequelize');
  const result = await jobService.payForJob(job_id, profile, sequelize);

  if (result?.error) {
    return res.status(result.status || 500).json({ error: result.error });
  }

  res.json(result);
});

module.exports = router;