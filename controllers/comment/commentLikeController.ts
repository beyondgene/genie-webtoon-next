// controllers/comment/commentLikeController.ts
import db from '@/models';

type Tx = any;
// 무한 여부 확인
function nn(n: unknown) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}
// 댓글 idx를 기반으로 댓글 찾아오기
async function loadCommentForUpdate(commentId: number, t: Tx) {
  const c = await db.Comment.findByPk(commentId, { transaction: t, lock: t.LOCK.UPDATE });
  if (!c) {
    const e: any = new Error('댓글을 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }
  return c;
}
// 결과값 변환 배출 함수
function out(c: any, current: 'LIKE' | 'DISLIKE' | null) {
  return {
    likeCount: nn(c.likes),
    dislikeCount: nn(c.dislikes),
    isLiked: current === 'LIKE',
    isDisliked: current === 'DISLIKE',
  };
}

/** POST /comment/like/:commentId → 토글 */
export async function likeComment(commentId: number, memberId: number) {
  const { sequelize } = db as any;

  return sequelize.transaction(async (t: Tx) => {
    const [reaction] = await Promise.all([
      db.CommentReaction.findOne({
        where: { memberId, commentId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      }),
    ]);
    const c = await loadCommentForUpdate(commentId, t);

    if (reaction?.type === 'LIKE') {
      // 이미 좋아요 → 취소
      await reaction.destroy({ transaction: t });
      c.set('likes', Math.max(0, nn(c.likes) - 1));
      await c.save({ transaction: t });
      return out(c, null);
    }

    if (reaction?.type === 'DISLIKE') {
      // 싫어요 → 좋아요로 전환
      reaction.set('type', 'LIKE');
      await reaction.save({ transaction: t });
      c.set('dislikes', Math.max(0, nn(c.dislikes) - 1));
      c.set('likes', nn(c.likes) + 1);
      await c.save({ transaction: t });
      return out(c, 'LIKE');
    }

    // 반응 없음 → 좋아요 생성
    await db.CommentReaction.create({ memberId, commentId, type: 'LIKE' }, { transaction: t });
    c.set('likes', nn(c.likes) + 1);
    await c.save({ transaction: t });
    return out(c, 'LIKE');
  });
}

/** DELETE /comment/like/:commentId → 좋아요만 취소 */
export async function unlikeComment(commentId: number, memberId: number) {
  const { sequelize } = db as any;

  return sequelize.transaction(async (t: Tx) => {
    const reaction = await db.CommentReaction.findOne({
      where: { memberId, commentId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    const c = await loadCommentForUpdate(commentId, t);

    if (reaction?.type === 'LIKE') {
      await reaction.destroy({ transaction: t });
      c.set('likes', Math.max(0, nn(c.likes) - 1));
      await c.save({ transaction: t });
      return out(c, null);
    }

    // LIKE가 아니면 상태 변화 없음
    return out(c, reaction?.type ?? null);
  });
}

/** POST /comment/dislike/:commentId → 토글 */
export async function dislikeComment(commentId: number, memberId: number) {
  const { sequelize } = db as any;

  return sequelize.transaction(async (t: Tx) => {
    const reaction = await db.CommentReaction.findOne({
      where: { memberId, commentId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    const c = await loadCommentForUpdate(commentId, t);

    if (reaction?.type === 'DISLIKE') {
      // 이미 싫어요 → 취소
      await reaction.destroy({ transaction: t });
      c.set('dislikes', Math.max(0, nn(c.dislikes) - 1));
      await c.save({ transaction: t });
      return out(c, null);
    }

    if (reaction?.type === 'LIKE') {
      // 좋아요 → 싫어요로 전환
      reaction.set('type', 'DISLIKE');
      await reaction.save({ transaction: t });
      c.set('likes', Math.max(0, nn(c.likes) - 1));
      c.set('dislikes', nn(c.dislikes) + 1);
      await c.save({ transaction: t });
      return out(c, 'DISLIKE');
    }

    // 반응 없음 → 싫어요 생성
    await db.CommentReaction.create({ memberId, commentId, type: 'DISLIKE' }, { transaction: t });
    c.set('dislikes', nn(c.dislikes) + 1);
    await c.save({ transaction: t });
    return out(c, 'DISLIKE');
  });
}

/** DELETE /comment/dislike/:commentId → 싫어요만 취소 */
export async function undislikeComment(commentId: number, memberId: number) {
  const { sequelize } = db as any;

  return sequelize.transaction(async (t: Tx) => {
    const reaction = await db.CommentReaction.findOne({
      where: { memberId, commentId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    const c = await loadCommentForUpdate(commentId, t);

    if (reaction?.type === 'DISLIKE') {
      await reaction.destroy({ transaction: t });
      c.set('dislikes', Math.max(0, nn(c.dislikes) - 1));
      await c.save({ transaction: t });
      return out(c, null);
    }

    // DISLIKE가 아니면 상태 변화 없음
    return out(c, reaction?.type ?? null);
  });
}
