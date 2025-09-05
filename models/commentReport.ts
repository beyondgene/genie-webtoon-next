// models/commentReport.ts
import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class CommentReport extends Model<
  InferAttributes<CommentReport>,
  InferCreationAttributes<CommentReport>
> {
  // 속성 선언
  declare idx: CreationOptional<number>;
  declare memberId: number;
  declare commentId: number;
  declare reason: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // 속성의 타입, 초기값, 테이블이름
  static initModel(sequelize: Sequelize): typeof CommentReport {
    return CommentReport.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        memberId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        commentId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        reason: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'comment_report',
        modelName: 'CommentReport',
        timestamps: true,
        underscored: false,
        indexes: [
          {
            name: 'uq_member_comment',
            unique: true,
            fields: ['memberId', 'commentId'],
          },
        ],
      }
    );
  }
  // fk 설정
  static associate(db: any) {
    if (db.Member) {
      CommentReport.belongsTo(db.Member, {
        foreignKey: 'memberId',
        targetKey: 'idx',
      });
    }
    if (db.Comment) {
      CommentReport.belongsTo(db.Comment, {
        foreignKey: 'commentId',
        targetKey: 'idx',
      });
    }
  }
}

export default CommentReport;
