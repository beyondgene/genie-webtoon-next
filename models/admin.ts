import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Admin extends Model<InferAttributes<Admin>, InferCreationAttributes<Admin>> {
  // 속성 선언
  declare idx: CreationOptional<number>;
  declare adminId: string;
  declare adminPassword: string;
  declare lastLogin: Date | null;
  declare isActive: boolean;
  declare role: 'SUPER' | 'MANAGER';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // 속성의 타입, 초기값, 테이블이름
  static initModel(sequelize: Sequelize): typeof Admin {
    Admin.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        adminId: {
          type: DataTypes.STRING(45),
          allowNull: false,
          unique: true,
        },
        adminPassword: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        role: {
          type: DataTypes.ENUM('SUPER', 'MANAGER'),
          allowNull: false,
          defaultValue: 'MANAGER',
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Admin',
        tableName: 'admin',
        timestamps: true,
      }
    );
    return Admin;
  }
  // fk 설정
  static associate(models: any) {
    Admin.hasMany(models.Artist, { foreignKey: 'adminId' });
    Admin.hasMany(models.Member, { foreignKey: 'adminId' });
    Admin.hasMany(models.Advertisement, { foreignKey: 'adminId' });
    Admin.hasMany(models.Webtoon, { foreignKey: 'adminId' });
    Admin.hasMany(models.Episode, { foreignKey: 'adminId' });
    Admin.hasMany(models.Comment, { foreignKey: 'adminId' });
  }
}
