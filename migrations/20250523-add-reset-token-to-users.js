'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'resetToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'resetTokenExpiry', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'resetToken');
    await queryInterface.removeColumn('Users', 'resetTokenExpiry');
  }
};
