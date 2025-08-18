import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Advertisement extends Model<
  InferAttributes<Advertisement>,
  InferCreationAttributes<Advertisement>
> {
  declare idx: CreationOptional<number>;
  declare adName: string;
  declare adLocation: 'HOME' | 'EPISODE_BOTTOM' | 'SIDE_BANNER';
  declare status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  declare startDate: Date;
  declare endDate: Date | null;
  declare totalExposureLimit: number | null;
  declare currentExposureCount: number;
  declare adImageUrl: string;
  declare targetUrl: string;
  declare adminId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof Advertisement {
    Advertisement.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        adName: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        adLocation: {
          type: DataTypes.ENUM('HOME', 'EPISODE_BOTTOM', 'SIDE_BANNER'),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'EXPIRED'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        totalExposureLimit: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        currentExposureCount: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        adImageUrl: {
          type: DataTypes.STRING(2048),
          allowNull: false,
        },
        targetUrl: {
          type: DataTypes.STRING(2048),
          allowNull: false,
        },
        adminId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Advertisement',
        tableName: 'advertisement',
        timestamps: true,
      }
    );
    return Advertisement;
  }

  static associate(models: any) {
    Advertisement.belongsTo(models.Admin, { foreignKey: 'adminId' });
    Advertisement.hasMany(models.AdViewLog, { foreignKey: 'adId' });
    Advertisement.hasMany(models.Episode, { foreignKey: 'adId' });
  }
}
