import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Artist extends Model<InferAttributes<Artist>, InferCreationAttributes<Artist>> {
  // 속성 선언
  declare idx: CreationOptional<number>;
  declare realName: string;
  declare artistName: string;
  declare artistPhone: string | null;
  declare artistEmail: string;
  declare webtoonList: string | null;
  declare debutDate: Date | null;
  declare adminId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // 속성의 타입, 초기값, 테이블이름
  static initModel(sequelize: Sequelize): typeof Artist {
    Artist.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        realName: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        artistName: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        artistPhone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        artistEmail: {
          type: DataTypes.STRING(45),
          allowNull: false,
          unique: true,
        },
        webtoonList: {
          type: DataTypes.STRING(1024),
          allowNull: true,
        },
        debutDate: {
          type: DataTypes.DATE,
          allowNull: true,
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
        modelName: 'Artist',
        tableName: 'artist',
        timestamps: true,
        updatedAt: 'modifiedDate', // ERD의 modifiedDate를 updatedAt으로 매핑
      }
    );
    return Artist;
  }
  // fk 설정
  static associate(models: any) {
    // 작가는 여러 웹툰을 가질 수 있다 (1:N)
    Artist.hasMany(models.Webtoon, { foreignKey: 'artistId' });
    // 작가는 관리자에 의해 관리된다 (N:1)
    Artist.belongsTo(models.Admin, { foreignKey: 'adminId' });
    Artist.hasMany(models.Interest, { foreignKey: 'artistId', as: 'interests' });
  }
}
