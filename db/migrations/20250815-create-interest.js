'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interest', {
      idx: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      memberId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'member', key: 'idx' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      artistId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'artist', key: 'idx' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addConstraint('interest', {
      fields: ['memberId', 'artistId'],
      type: 'unique',
      name: 'uniq_member_artist_interest',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('interest');
  },
};
