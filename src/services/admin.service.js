const { Op } = require('sequelize');

class AdminService {
  constructor(models) {
    this.Job = models.Job;
    this.Contract = models.Contract;
    this.Profile = models.Profile;
    this.sequelize = models.sequelize;
  }

  async getBestProfession({ start, end }) {
    return this.Job.findOne({
      attributes: [
        [this.sequelize.col('Contract.Contractor.profession'), 'profession'],
        [this.sequelize.fn('SUM', this.sequelize.col('price')), 'total_earned']
      ],
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [new Date(start), new Date(end)]
        }
      },
      include: [
        {
          model: this.Contract,
          attributes: [],
          include: [
            {
              model: this.Profile,
              as: 'Contractor',
              attributes: []
            }
          ]
        }
      ],
      group: ['Contract.Contractor.profession'],
      order: [[this.sequelize.fn('SUM', this.sequelize.col('price')), 'DESC']],
      raw: true
    });
  }

  async getBestClients({ start, end, limit = 2 }) {
    return this.Job.findAll({
      attributes: [
        [this.sequelize.col('Contract.Client.id'), 'id'],
        [this.sequelize.col('Contract.Client.firstName'), 'firstName'],
        [this.sequelize.col('Contract.Client.lastName'), 'lastName'],
        [this.sequelize.fn('SUM', this.sequelize.col('price')), 'paid']
      ],
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [new Date(start), new Date(end)]
        }
      },
      include: [
        {
          model: this.Contract,
          attributes: [],
          include: [
            {
              model: this.Profile,
              as: 'Client',
              attributes: []
            }
          ]
        }
      ],
      group: ['Contract.Client.id'],
      order: [[this.sequelize.fn('SUM', this.sequelize.col('price')), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });
  }
}

module.exports = AdminService;
