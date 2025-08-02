'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      // 모델 파일에 'likes'로 되어있어 그대로 반영
      likes: {
        type: Sequelize.ENUM('LIKE', 'DISLIKE', 'NONE'),
        allowNull: false,
        defaultValue: 'NONE',
      },
      creationDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      modifiedDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      memberId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'members',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      episodeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'episodes',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      adminId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  },
};
