import db from '@/models';

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

export async function deleteComment(id: number) {
  const comment = await db.Comment.findByPk(id);
  if (!comment) throw new Error('Not Found');
  await comment.destroy();
}
