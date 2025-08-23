'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 존재 여부 확인 후 추가 (운영 DB에 이미 있으면 스킵)
    const table = await queryInterface.describeTable('webtoon');
    if (!table.wbthumbnailUrl) {
      await queryInterface.addColumn('webtoon', 'wbthumbnailUrl', {
        type: Sequelize.STRING(2048),
        allowNull: false,
        defaultValue: '', // 운영 DB가 이미 채워져 있으면 이후에 defaultValue 제거 가능
      });
    }
  },
  async down(queryInterface) {
    const table = await queryInterface.describeTable('webtoon');
    if (table.wbthumbnailUrl) {
      await queryInterface.removeColumn('webtoon', 'wbthumbnailUrl');
    }
  },
};
