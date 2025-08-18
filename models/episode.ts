import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Episode extends Model<InferAttributes<Episode>, InferCreationAttributes<Episode>> {
  declare idx: CreationOptional<number>;
  declare title: string; // ERD에 없지만 필수적이므로 추가
  declare thumbnailUrl: string; // ERD에 없지만 필수적이므로 추가
  declare uploadDate: CreationOptional<Date>;
  declare webtoonId: number;
  declare adId: number | null;
  declare adminId: number;

  static initModel(sequelize: Sequelize): typeof Episode {
    Episode.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        thumbnailUrl: {
          type: DataTypes.STRING(2048),
          allowNull: false,
          comment: '회차 썸네일 이미지 주소',
        },
        uploadDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        webtoonId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        adId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        adminId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Episode',
        tableName: 'episodes',
        timestamps: false,
      }
    );
    return Episode;
  }

  static associate(models: any) {
    Episode.belongsTo(models.Webtoon, { foreignKey: 'webtoonId' });
    Episode.belongsTo(models.Advertisement, { foreignKey: 'adId' });
    Episode.belongsTo(models.Admin, { foreignKey: 'adminId' });
    Episode.hasMany(models.Comment, { foreignKey: 'episodeId' });
  }
}
