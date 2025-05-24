'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'emailVerificationToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'emailVerificationToken');
    await queryInterface.removeColumn('Users', 'emailVerified');
  }
};
