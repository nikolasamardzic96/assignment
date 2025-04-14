const models = require('../model');
const ProfileService = require('./profile.service');
const JobService = require('./job.service');
const ContractService = require('./contract.service');
const AdminService = require('./admin.service');

const profileService = new ProfileService(models);
const jobService = new JobService(models, profileService);
const contractService = new ContractService(models);
const adminService = new AdminService(models);

module.exports = {
  profileService,
  jobService,
  contractService,
  adminService
};
