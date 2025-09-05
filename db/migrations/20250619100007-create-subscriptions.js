// 구독 테이블 마이그레이션
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription', {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      alarm_on: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      memberId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'member',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      webtoonId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'webtoon',
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

    // memberId와 webtoonId 조합에 대한 복합 고유 키 설정 (한 명의 유저가 같은 웹툰을 여러 번 구독 방지)
    await queryInterface.addConstraint('subscription', {
      fields: ['memberId', 'webtoonId'],
      type: 'unique',
      name: 'unique_subscription_per_member_webtoon',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subscription');
  },
};
