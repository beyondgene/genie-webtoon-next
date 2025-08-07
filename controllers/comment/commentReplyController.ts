// controllers/comment/commentReplyController.ts
import db from '@/models';

/**
 * 부모 댓글(parentCommentId)에 대한 답글 생성
 */
export async function replyToComment(userId: number, parentCommentId: number, content: string) {
  const parent = await db.Comment.findByPk(parentCommentId);
  if (!parent) throw new Error('부모 댓글이 존재하지 않습니다.');

  const reply = await db.CommentReply.create({
    content,
    parentCommentId,
    episodeId: parent.episodeId,
    memberId: userId,
  });
  await reply.reload({ include: [{ model: db.Member, attributes: ['idx', 'nickname'] }] });

  return {
    id: reply.idx,
    content: reply.content,
    memberId: reply.memberId,
    memberNickname: reply.Member.nickname,
    creationDate: reply.creationDate.toISOString(),
    modifiedDate: reply.modifiedDate.toISOString(),
    parentCommentId,
  };
}
