const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Define association with User model
RefreshToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });

module.exports = RefreshToken;
