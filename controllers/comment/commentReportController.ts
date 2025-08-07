// controllers/comment/commentReportController.ts
import db from '@/models';

/**
 * 댓글 신고 내역 생성
 */
export async function reportComment(userId: number, commentId: number, reason: string) {
  const comment = await db.Comment.findByPk(commentId);
  if (!comment) throw new Error('신고할 댓글이 존재하지 않습니다.');

  await db.CommentReport.create({
    commentId,
    memberId: userId,
    reason,
  });
}
