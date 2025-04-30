const { sequelize } = require('../config/database');
const User = require('./user');

// Define relationships between models here if needed
// For example: User.hasMany(Posts)

const models = {
  User
};

module.exports = {
  sequelize,
  ...models
};
