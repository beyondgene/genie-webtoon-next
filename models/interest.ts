// models/Interest.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface InterestAttributes {
  idx: number;
  memberId: number;
  artistId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InterestCreationAttributes = Optional<
  InterestAttributes,
  'idx' | 'createdAt' | 'updatedAt'
>;

export class Interest
  extends Model<InterestAttributes, InterestCreationAttributes>
  implements InterestAttributes
{
  public idx!: number;
  public memberId!: number;
  public artistId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    Interest.init(
      {
        idx: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        memberId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        artistId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      {
        sequelize,
        tableName: 'interests',
        modelName: 'Interest',
        timestamps: true,
      }
    );
    return Interest;
  }
}
