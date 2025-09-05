// models/commentReaction.ts
import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class CommentReaction extends Model<
  InferAttributes<CommentReaction>,
  InferCreationAttributes<CommentReaction>
> {
  // 속성 선언
  declare idx: CreationOptional<number>;
  declare memberId: number;
  declare commentId: number;
  declare type: 'LIKE' | 'DISLIKE';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // 속성의 타입, 초기값, 테이블이름
  static initModel(sequelize: Sequelize): typeof CommentReaction {
    return CommentReaction.init(
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
        type: {
          type: DataTypes.ENUM('LIKE', 'DISLIKE'),
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
        tableName: 'comment_reaction',
        modelName: 'CommentReaction',
        timestamps: true, // createdAt / updatedAt 사용
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
      CommentReaction.belongsTo(db.Member, {
        foreignKey: 'memberId',
        targetKey: 'idx',
      });
    }
    if (db.Comment) {
      CommentReaction.belongsTo(db.Comment, {
        foreignKey: 'commentId',
        targetKey: 'idx',
      });
    }
  }
}

export default CommentReaction;
