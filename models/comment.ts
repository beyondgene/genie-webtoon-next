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
  // 속성 선언
  declare idx: CreationOptional<number>;
  declare likes: number;
  declare dislikes: number;
  declare commentCol: string; // 댓글 본문 (DB 컬럼명 그대로)
  declare creationDate: CreationOptional<Date>;
  declare modifiedDate: CreationOptional<Date>;
  declare memberId: number;
  declare webtoonId: number;
  declare episodeId: number;
  declare adminId: number | null;
  // 속성의 타입, 초기값, 테이블이름
  static initModel(sequelize: Sequelize): typeof Comment {
    Comment.init(
      {
        idx: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        likes: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        dislikes: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        commentCol: {
          type: DataTypes.STRING(512),
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        modifiedDate: {
          type: DataTypes.DATE,
          allowNull: false,
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
          defaultValue: null,
        },
        // ✅ likedBy / dislikedBy / reportedBy / reportReasons 제거!
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
  // fk 설정
  static associate(models: any) {
    Comment.belongsTo(models.Member, { foreignKey: 'memberId' });
    Comment.belongsTo(models.Webtoon, { foreignKey: 'webtoonId' });
    Comment.belongsTo(models.Episode, { foreignKey: 'episodeId', targetKey: 'idx' });
    Comment.belongsTo(models.Admin, { foreignKey: 'adminId' });
    // 반응/신고는 별도 테이블
    if (models.CommentReaction) {
      Comment.hasMany(models.CommentReaction, { foreignKey: 'commentId' });
    }
    if (models.CommentReport) {
      Comment.hasMany(models.CommentReport, { foreignKey: 'commentId' });
    }
  }
}

export default Comment;
