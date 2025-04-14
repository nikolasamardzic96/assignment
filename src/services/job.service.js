const { Op } = require('sequelize');
const { ContractStatus } = require('../const');

class JobService {
  constructor(models, profileService) {
    this.Job = models.Job;
    this.Contract = models.Contract;
    this.profileService = profileService;
  }

  async getUnpaidJobsForProfile(profileId) {
    return this.Job.findAll({
      where: {
        paid: null
      },
      include: {
        model: this.Contract,
        required: true,
        where: {
          status: ContractStatus.IN_PROGRESS,
          [Op.or]: [
            { contractorId: profileId },
            { clientId: profileId }
          ]
        }
      }
    });
  }

  async payForJob(jobId, clientProfile, sequelize) {
    const transaction = await sequelize.transaction();

    try {
      const job = await this._fetchEligibleJob(jobId, clientProfile.id, transaction);
      if (!job) {
        await transaction.rollback();
        return { error: 'Job not found or already paid', status: 404 };
      }

    const amount = parseFloat(job.price);
    const contractorId = job.Contract.ContractorId;

    const result = await this.profileService.transferFunds({
      clientId: clientProfile.id,
      contractorId,
      amount
    }, transaction);

    if (result.error) {
      await transaction.rollback();
      return result;
    }

    job.paid = true;
    job.paymentDate = new Date();
    await job.save({ transaction });

    await transaction.commit();
    return { success: true };
    } catch (err) {
      console.error('Payment error:', err);
      await transaction.rollback();
      return { error: 'Something went wrong during payment', status: 500 };
    }
  }

  async _fetchEligibleJob(jobId, clientId, transaction) {
    return this.Job.findOne({
      where: {
        id: jobId,
        paid: { [Op.not]: true }
      },
      include: {
        model: this.Contract,
        required: true,
        where: {
          clientId,
          status: ContractStatus.IN_PROGRESS
        }
      },
      transaction,
      lock: true
    });
  }
}

module.exports = JobService;
