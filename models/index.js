const { sequelize } = require('../config/database');
const User = require('./user');
const Task = require('./task');
const RefreshToken = require('./refreshToken');

// Define relationships between models here
// Task and RefreshToken relationships are defined in their respective models

const models = {
  User,
  Task,
  RefreshToken
};

module.exports = {
  sequelize,
  ...models
};
