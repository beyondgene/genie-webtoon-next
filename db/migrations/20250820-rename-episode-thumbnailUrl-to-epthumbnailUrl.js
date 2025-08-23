'use strict';
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
