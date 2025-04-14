const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

// Route mounting
app.use('/contracts', require('./routes/contracts'));
app.use('/jobs', require('./routes/jobs'));
app.use('/balances', require('./routes/balances'));
app.use('/admin', require('./routes/admin'));

module.exports = app;
