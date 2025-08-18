import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Member extends Model<InferAttributes<Member>, InferCreationAttributes<Member>> {
  declare idx: CreationOptional<number>;
  declare memberId: string;
  declare memberPassword: string;
  declare nickname: string;
  declare name: string;
  declare age: number;
  declare gender: 'MALE' | 'FEMALE' | 'OTHER';
  declare email: string;
  declare phoneNumber: string;
  declare address: string;
  declare status: 'ACTIVE' | 'DELETED';
  declare adminId: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof Member {
    Member.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        memberId: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        memberPassword: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        nickname: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        age: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        gender: {
          type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(45),
          allowNull: false,
          unique: true,
        },
        phoneNumber: {
          type: DataTypes.STRING(15),
          allowNull: false,
          unique: true,
        },
        address: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'DELETED'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        adminId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true, // 관리자에 의해 관리될 수 있지만, 필수항목은 아님
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Member',
        tableName: 'member',
        timestamps: true,
      }
    );
    return Member;
  }

  static associate(models: any) {
    // Member는 여러 Comment를 작성할 수 있다 (1:N)
    Member.hasMany(models.Comment, { foreignKey: 'memberId' });
    // Member는 여러 Webtoon을 구독(Subscription)할 수 있다 (1:N)
    Member.hasMany(models.Subscription, { foreignKey: 'memberId' });
    // Member는 여러 광고 조회 기록을 가질 수 있다 (1:N)
    Member.hasMany(models.AdViewLog, { foreignKey: 'memberId' });
    // Member는 Admin에 의해 관리될 수 있다 (N:1)
    Member.belongsTo(models.Admin, { foreignKey: 'adminId' });
    Member.hasMany(models.Interest, { foreignKey: 'memberId', as: 'interests' });
  }
}
