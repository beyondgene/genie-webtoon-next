import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class AdViewLog extends Model<
  InferAttributes<AdViewLog>,
  InferCreationAttributes<AdViewLog>
> {
  // 속성 선언
  declare idx: CreationOptional<number>;
  declare viewedAt: CreationOptional<Date>;
  declare memberId: number | null;
  declare adId: number;
  // 속성의 타입, 초기값, 테이블이름
  static initModel(sequelize: Sequelize): typeof AdViewLog {
    AdViewLog.init(
      {
        idx: {
          type: DataTypes.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        viewedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        memberId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true, // 비회원도 볼 수 있으므로 NULL 허용
        },
        adId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'AdViewLog',
        tableName: 'ad_view_log',
        timestamps: false,
      }
    );
    return AdViewLog;
  }
  // fk 설정
  static associate(models: any) {
    AdViewLog.belongsTo(models.Advertisement, { foreignKey: 'adId' });
    AdViewLog.belongsTo(models.Member, { foreignKey: 'memberId' });
  }
}
