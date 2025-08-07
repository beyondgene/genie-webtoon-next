// controllers/comment/commentController.ts
import db from '@/models';
import { Op } from 'sequelize';

export interface CommentDTO {
  id: number;
  content: string;
  memberId: number;
  memberNickname: string;
  likeCount: number;
  isLiked: boolean;
  creationDate: string;
  modifiedDate: string;
}

/**
 * episodeId 의 최상위 댓글 목록을 조회
 */
export async function getCommentsByEpisode(
  episodeId: number,
  userId: number
): Promise<CommentDTO[]> {
  const comments = await db.Comment.findAll({
    where: { episodeId, parentCommentId: null },
    include: [{ model: db.Member, attributes: ['idx', 'nickname'] }],
    order: [['creationDate', 'ASC']],
  });

  return Promise.all(
    comments.map(async (c) => {
      const likeCount = await db.CommentLike.count({
        where: { commentId: c.idx },
      });
      const isLiked =
        (await db.CommentLike.count({
          where: { commentId: c.idx, memberId: userId },
        })) > 0;
      return {
        id: c.idx,
        content: c.content,
        memberId: c.memberId,
        memberNickname: c.Member.nickname,
        likeCount,
        isLiked,
        creationDate: c.creationDate.toISOString(),
        modifiedDate: c.modifiedDate.toISOString(),
      };
    })
  );
}

/**
 * 새로운 댓글 생성
 */
export async function createComment(
  userId: number,
  episodeId: number,
  content: string
): Promise<CommentDTO> {
  const newComment = await db.Comment.create({ content, episodeId, memberId: userId });
  await newComment.reload({ include: [{ model: db.Member, attributes: ['idx', 'nickname'] }] });

  return {
    id: newComment.idx,
    content: newComment.content,
    memberId: newComment.memberId,
    memberNickname: newComment.Member.nickname,
    likeCount: 0,
    isLiked: false,
    creationDate: newComment.creationDate.toISOString(),
    modifiedDate: newComment.modifiedDate.toISOString(),
  };
}

/**
 * 단일 댓글 조회 (수정/삭제 전 검증 용)
 */
export async function getCommentById(commentId: number) {
  const comment = await db.Comment.findByPk(commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');
  return comment;
}

/**
 * 댓글 내용 수정
 */
export async function updateComment(commentId: number, content: string) {
  const comment = await getCommentById(commentId);
  comment.content = content;
  await comment.save();
  return comment;
}

/**
 * 댓글 삭제
 */
export async function deleteComment(commentId: number) {
  const deleted = await db.Comment.destroy({ where: { idx: commentId } });
  if (deleted === 0) throw new Error('삭제할 댓글이 없습니다.');
}
