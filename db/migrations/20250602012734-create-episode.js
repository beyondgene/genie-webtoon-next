'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('episodes', {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      thumbnailUrl: {
        type: Sequelize.STRING(2048),
        allowNull: false,
        comment: '회차 썸네일 이미지 주소',
      },
      uploadDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      webtoonId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'webtoons',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      adId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'advertisements',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      adminId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('episodes');
  },
};
