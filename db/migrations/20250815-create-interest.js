'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Interests', {
      idx: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      memberId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Members', key: 'idx' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      artistId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Artists', key: 'idx' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addConstraint('Interests', {
      fields: ['memberId', 'artistId'],
      type: 'unique',
      name: 'uniq_member_artist_interest',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Interests');
  },
};
