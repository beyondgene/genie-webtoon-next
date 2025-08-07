import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { Artist } from './artist';

export class Webtoon extends Model<InferAttributes<Webtoon>, InferCreationAttributes<Webtoon>> {
  declare idx: CreationOptional<number>;
  declare webtoonName: string;
  declare discription: string; // ERD에 따라 description 대신 discription으로 작성
  declare genre: 'DRAMA' | 'ROMANCE' | 'FANTASY' | 'ACTION' | 'ETC';
  declare views: number;
  declare recommend: number;
  declare Artist?: Artist;
  declare adminIdx: number;
  declare artistIdx: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof Webtoon {
    Webtoon.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        webtoonName: {
          type: DataTypes.STRING(45),
          allowNull: false,
          unique: true,
        },
        discription: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        genre: {
          type: DataTypes.ENUM(
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
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        recommend: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        adminIdx: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        artistIdx: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Webtoon',
        tableName: 'webtoons',
        timestamps: true,
      }
    );
    return Webtoon;
  }

  static associate(models: any) {
    Webtoon.belongsTo(models.Admin, { foreignKey: 'adminIdx' });
    Webtoon.belongsTo(models.Artist, { foreignKey: 'artistIdx' });
    Webtoon.hasMany(models.Episode, { foreignKey: 'webtoonId' });
    Webtoon.hasMany(models.Comment, { foreignKey: 'webtoonId' });
    Webtoon.hasMany(models.Subscription, { foreignKey: 'webtoonId' });
  }
}
