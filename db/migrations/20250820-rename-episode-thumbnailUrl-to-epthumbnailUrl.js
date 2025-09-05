'use strict';
// 에피소드 섬네일 속성 이름 변경
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('episode');
    if (table.thumbnailUrl && !table.epthumbnailUrl) {
      await queryInterface.renameColumn('episode', 'thumbnailUrl', 'epthumbnailUrl');
    }
  },
  async down(queryInterface) {
    const table = await queryInterface.describeTable('episode');
    if (!table.thumbnailUrl && table.epthumbnailUrl) {
      await queryInterface.renameColumn('episode', 'epthumbnailUrl', 'thumbnailUrl');
    }
  },
};
