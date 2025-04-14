// 1. Core/Third-party modules
const express = require('express');
const bodyParser = require('body-parser');

// 2. App core (database + app setup)
const { sequelize } = require('./model');

// 3. Middleware
const { getProfile } = require('./middleware/getProfile');

// 4. Constants and Utils
const { ProfileType } = require('./const');
const { validateDateRange } = require('./utils/validators');

// 5. Services
const {
  jobService,
  profileService,
  contractService,
  adminService
} = require('./services/service.registry');

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Attach sequelize instance to the app (for transactions, raw queries, etc.)
app.set('sequelize', sequelize);

// Attach all models (Profile, Contract, Job) to the app
app.set('models', sequelize.models);



/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) =>{
    const { id } = req.params;
    const profileId = req.profile.id;

    const contract = await contractService.getContractByIdForProfile(id, profileId)

    if(!contract) return res.status(404).end();
    res.json(contract)
});

/**
 * Returns a list of contracts belonging to a user (client or contractor). 
 * The list should only contain non-terminated contracts.
 */
app.get('/contracts', getProfile, async (req, res) => {
    const profileId = req.profile.id;
    const contracts = await contractService.getAllContractsForProfile(profileId);

    if(!contracts?.length) return res.status(404).end(); // or we can return []
    res.json(contracts);
});


/**
 *  Get all unpaid jobs for a user (**_either_** a client or contractor),
 *  but only for **_active contracts_**.
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {   
    const profileId = req.profile.id;

    const unpaidJobs = await jobService.getUnpaidJobsForProfile(profileId);

    if(!unpaidJobs?.length) return res.status(404).end();
    res.json(unpaidJobs);
});

/**
 * Pay for a job. 
 * A client can only pay if their balance is greater than or equal to the amount due. 
 * The payment amount should be moved from the client's balance to the contractor's balance.
 */
app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const { job_id } = req.params;
    const profile = req.profile;
  
    if (profile.type !== ProfileType.CLIENT) {
      return res.status(403).json({ error: 'Only clients can pay for jobs' });
    }
    
    const result = await jobService.payForJob(job_id, profile, sequelize);
  
    if (result?.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }
  
    res.json(result);
});

/**
 * Deposit money into a client's balance. 
 * A client cannot deposit more than 25% of the total of jobs to pay at the time of deposit.
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const profile = req.profile;
    const { userId } = req.params;
    const { amount } = req.body;
  
    // Controller-level validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }
  
    if (profile.type !== ProfileType.CLIENT) {
      return res.status(403).json({ error: 'Only clients can deposit' });
    }
  
    if (parseInt(userId) !== profile.id) {
      return res.status(403).json({ error: 'You can only deposit to your own account' });
    }
    
    const result = await profileService.depositBalance({
      profile,
      amount,
      sequelize
    });
  
    if (result?.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }
  
    res.json(result);
});

/**
 * Returns the profession that earned the most money (sum of jobs paid) for any contractor who worked within the specified time range.
 */
app.get('/admin/best-profession', async (req, res) => {
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

/**
 * Returns the clients who paid the most for jobs within the specified time period.
 * The `limit` query parameter should be applied, and the default limit is 2.
 */
app.get('/admin/best-clients', async (req, res) => {
    const { start, end } = validateDateRange(req.query.start, req.query.end);
    const { limit } = req.query;
  
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

module.exports = app;
