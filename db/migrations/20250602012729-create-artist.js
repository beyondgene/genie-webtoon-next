'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('artists', {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      realName: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      artistName: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      artistPhone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      artistEmail: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
      },
      webtoonList: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      debutDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      adminId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'admins', // 참조할 테이블
          key: 'idx', // 참조할 컬럼
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      modifiedDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('artists');
  },
};
