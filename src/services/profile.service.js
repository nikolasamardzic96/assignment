const { Op } = require('sequelize');
const { ContractStatus, ProfileType } = require('../const');

class ProfileService {
  constructor(models) {
    this.Job = models.Job;
    this.Contract = models.Contract;
    this.Profile = models.Profile;
  }

  async depositBalance({ profile, amount, sequelize }) {
    const transaction = await sequelize.transaction();
  
    try {
      const unpaidJobs = await this.Job.findAll({
        where: { paid: { [Op.not]: true } },
        include: {
          model: this.Contract,
          required: true,
          where: {
            clientId: profile.id,
            status: ContractStatus.IN_PROGRESS
          }
        },
        transaction
      });

      const totalUnpaid = unpaidJobs.reduce((sum, job) => sum + parseFloat(job.price), 0);
      const maxAllowed = totalUnpaid * 0.25;
  
      if (amount > maxAllowed) {
        await transaction.rollback();
        return {
          error: `Deposit exceeds 25% limit. Max allowed: ${maxAllowed.toFixed(2)}`,
          status: 400
        };
      }
  
      profile.balance = parseFloat(profile.balance) + parseFloat(amount);
      await profile.save({ transaction });
  
      await transaction.commit();
      return { success: true, newBalance: profile.balance };
    } catch (err) {
      console.error('Deposit error:', err);
      await transaction.rollback();
      return { error: 'Something went wrong during deposit', status: 500 };
    }
  }

  async transferFunds({ clientId, contractorId, amount }, transaction) {
    const [client, contractor] = await Promise.all([
      this.Profile.findOne({ where: { id: clientId }, transaction, lock: true }),
      this.Profile.findOne({ where: { id: contractorId }, transaction, lock: true }),
    ]);
  
    if (parseFloat(client.balance) < parseFloat(amount)) {
      return { error: 'Insufficient balance', status: 400 };
    }
  
    client.balance -= parseFloat(amount);
    contractor.balance += parseFloat(amount);
  
    await Promise.all([
      client.save({ transaction }),
      contractor.save({ transaction })
    ]);
  
    return { success: true };
  }
}

module.exports = ProfileService;
