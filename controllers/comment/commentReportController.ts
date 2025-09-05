// controllers/comment/commentReportController.ts
import db from '@/models';

export async function reportComment(
  commentId: number,
  memberId: number,
  reason: string,
  detail?: string
) {
  // 중복 신고 방지: upsert 유사(있으면 업데이트)
  const existing = await db.CommentReport.findOne({ where: { commentId, memberId } });
  if (existing) {
    existing.set('reason', reason);
    await existing.save();
    return { success: true, updated: true };
  }
  await db.CommentReport.create({ commentId, memberId, reason });
  return { success: true, created: true };
}
