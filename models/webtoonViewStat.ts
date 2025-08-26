// models/webtoonViewStat.ts
import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class WebtoonViewStat extends Model<
  InferAttributes<WebtoonViewStat>,
  InferCreationAttributes<WebtoonViewStat>
> {
  declare idx: CreationOptional<number>;
  declare webtoonId: number;
  declare date: string; // YYYY-MM-DD (KST 기준 일자 스냅샷)
  declare views: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Webtoon과 동일한 패턴의 초기화 메서드
  static initModel(sequelize: Sequelize): typeof WebtoonViewStat {
    WebtoonViewStat.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        webtoonId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          comment: 'KST 기준 YYYY-MM-DD',
        },
        views: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'webtoon_view_stat',
        modelName: 'WebtoonViewStat',
        timestamps: true,
        indexes: [
          { fields: ['date'] },
          { unique: true, fields: ['webtoonId', 'date'], name: 'uniq_webtoonId_date' },
        ],
      }
    );
    return WebtoonViewStat;
  }

  // 관계 정의(웹툰 쪽 스타일과 동일한 위치/형식)
  static associate(models: any) {
    WebtoonViewStat.belongsTo(models.Webtoon, {
      foreignKey: 'webtoonId',
      as: 'webtoon',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

export default WebtoonViewStat;
