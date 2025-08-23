// models/comment.ts
import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
  declare idx: CreationOptional<number>;
  declare likes: 'LIKE' | 'DISLIKE' | 'NONE'; // '좋아요 수'가 아닌 상태값으로 ERD에 명시됨
  declare commentCol: string; // 실제 댓글 내용 컬럼
  declare creationDate: CreationOptional<Date>;
  declare modifiedDate: CreationOptional<Date>;
  declare memberId: number;
  declare webtoonId: number;
  declare episodeId: number;
  declare adminId: number | null;

  static initModel(sequelize: Sequelize): typeof Comment {
    Comment.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        likes: {
          type: DataTypes.ENUM('LIKE', 'DISLIKE', 'NONE'),
          allowNull: false,
          defaultValue: 'NONE',
        },
        commentCol: {
          type: DataTypes.STRING(512),
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        modifiedDate: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        memberId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        webtoonId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        episodeId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        adminId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Comment',
        tableName: 'comment',
        timestamps: false, // creationDate, modifiedDate를 직접 관리
      }
    );
    return Comment;
  }

  static associate(models: any) {
    Comment.belongsTo(models.Member, { foreignKey: 'memberId' });
    Comment.belongsTo(models.Webtoon, { foreignKey: 'webtoonId' });
    Comment.belongsTo(models.Episode, { foreignKey: 'episodeId' });
    Comment.belongsTo(models.Admin, { foreignKey: 'adminId' });
  }
}
