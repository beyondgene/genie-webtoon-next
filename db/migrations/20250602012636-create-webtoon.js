'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webtoon', {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      webtoonName: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
      },
      // 모델 파일에 'discription'으로 되어있어 그대로 반영
      discription: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      genre: {
        type: Sequelize.ENUM(
          'DRAMA',
          'ROMANCE',
          'FANTASY',
          'ACTION',
          'LIFE',
          'GAG',
          'SPORTS',
          'THRILLER',
          'HISTORICAL'
        ),
        allowNull: false,
      },
      views: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      recommend: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      adminId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'admin',
          key: 'idx',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      artistId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'artist',
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
    await queryInterface.dropTable('webtoon');
  },
};
