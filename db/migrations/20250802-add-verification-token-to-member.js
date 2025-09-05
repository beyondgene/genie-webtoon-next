'use strict';
// 멤버 토큰 인증 마이그레이션
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('member', 'verificationToken', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '이메일 검증용 토큰(UUID)',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('member', 'verificationToken');
  },
};
