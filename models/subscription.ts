import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Subscription extends Model<
  InferAttributes<Subscription>,
  InferCreationAttributes<Subscription>
> {
  declare idx: CreationOptional<number>;
  declare status: 'ACTIVE' | 'INACTIVE';
  declare alarm_on: boolean;
  declare memberId: number;
  declare webtoonId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof Subscription {
    Subscription.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        alarm_on: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        memberId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        webtoonId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Subscription',
        tableName: 'subscription',
        timestamps: true,
      }
    );
    return Subscription;
  }

  static associate(models: any) {
    Subscription.belongsTo(models.Member, { foreignKey: 'memberId' });
    Subscription.belongsTo(models.Webtoon, { foreignKey: 'webtoonId' });
  }
}
