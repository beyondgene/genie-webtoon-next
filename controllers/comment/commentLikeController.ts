// controllers/comment/commentLikeController.ts
import db from '@/models';

/**
 * 댓글 좋아요 추가
 */
export async function likeComment(userId: number, commentId: number) {
  await db.CommentLike.findOrCreate({
    where: { commentId, memberId: userId },
  });
}

/**
 * 댓글 좋아요 취소
 */
export async function unlikeComment(userId: number, commentId: number) {
  const count = await db.CommentLike.destroy({
    where: { commentId, memberId: userId },
  });
  if (count === 0) throw new Error('좋아요가 존재하지 않습니다.');
}

/**
 * 댓글 싫어요 추가
 */
export async function dislikeComment(userId: number, commentId: number) {
  await db.CommentDislike.findOrCreate({
    where: { commentId, memberId: userId },
  });
}

/**
 * 댓글 싫어요 취소
 */
export async function undislikeComment(userId: number, commentId: number) {
  const count = await db.CommentDislike.destroy({
    where: { commentId, memberId: userId },
  });
  if (count === 0) throw new Error('싫어요가 존재하지 않습니다.');
}
