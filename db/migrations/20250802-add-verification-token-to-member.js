'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Members', 'verificationToken', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '이메일 검증용 토큰(UUID)',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Members', 'verificationToken');
  }
};