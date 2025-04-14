const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const { contractService } = require('../services/service.registry');

router.get('/:id', getProfile, async (req, res) => {
  const { id } = req.params;
  const profileId = req.profile.id;

  const contract = await contractService.getContractByIdForProfile(id, profileId);

  if (!contract) return res.status(404).end();
  res.json(contract);
});

router.get('/', getProfile, async (req, res) => {
  const profileId = req.profile.id;
  const contracts = await contractService.getAllContractsForProfile(profileId);

  if (!contracts?.length) return res.status(404).end();
  res.json(contracts);
});

module.exports = router;
