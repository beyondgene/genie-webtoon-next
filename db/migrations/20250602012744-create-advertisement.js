'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('advertisements', {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      adName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      adLocation: {
        type: Sequelize.ENUM('HOME', 'EPISODE_BOTTOM', 'SIDE_BANNER'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PAUSED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      totalExposureLimit: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      currentExposureCount: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      adImageUrl: {
        type: Sequelize.STRING(2048),
        allowNull: false,
      },
      targetUrl: {
        type: Sequelize.STRING(2048),
        allowNull: false,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('advertisements');
  },
};
