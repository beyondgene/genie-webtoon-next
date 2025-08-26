import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('webtoon_view_stat', {
      idx: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      webtoonId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'webtoon', key: 'idx' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      date: {
        // KST 기준 일자 스냅샷
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      views: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
    await queryInterface.addConstraint('webtoon_view_stat', {
      fields: ['webtoonId', 'date'],
      type: 'unique',
      name: 'uniq_webtoon_view_stat_webtoonId_date',
    });
    await queryInterface.addIndex('webtoon_view_stat', ['date']);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('webtoon_view_stat');
  },
};
