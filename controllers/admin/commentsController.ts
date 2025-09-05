import db from '@/models';
// 댓글 리스트 db 테이블에서 뽑아오기
export async function listComments() {
  return await db.Comment.findAll({
    include: [
      { model: db.Member, attributes: ['idx', 'memberId', 'nickname'] },
      { model: db.Webtoon, attributes: ['idx', 'webtoonName'] },
      { model: db.Episode, attributes: ['idx', 'uploadDate'] },
    ],
    order: [['creationDate', 'DESC']],
  });
}
// 댓글 삭제
export async function deleteComment(id: number) {
  const comment = await db.Comment.findByPk(id);
  if (!comment) throw new Error('Not Found');
  await comment.destroy();
}
