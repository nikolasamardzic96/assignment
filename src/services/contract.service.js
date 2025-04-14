const { Op } = require('sequelize');
const { ContractStatus } = require('../const');

class ContractService {
  constructor(models) {
    this.Contract = models.Contract;
  }

  async getContractByIdForProfile(contractId, profileId) {
    return this.Contract.findOne({
      where: {
        id: contractId,
        [Op.or]: [
          { contractorId: profileId },
          { clientId: profileId }
        ]
      }
    });
  }

  async getAllContractsForProfile(profileId) {
    console.log("hey IM gere")
    console.log(ContractStatus.TERMINATED)
    return this.Contract.findAll({
        where: {
            [Op.or]: [
                { contractorId: profileId },
                { clientId: profileId }
            ],
            status: {
                [Op.not]: ContractStatus.TERMINATED
            }
        }
    });
  }
}

module.exports = ContractService;