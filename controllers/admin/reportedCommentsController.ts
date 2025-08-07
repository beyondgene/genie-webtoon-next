import db from '@/models';

/**
 * 신고된 댓글 목록 조회
 */
export async function listReportedComments() {
  return await db.CommentReport.findAll({
    include: [
      {
        model: db.Comment,
        include: [
          { model: db.Member, attributes: ['idx', 'nickname'] },
          { model: db.Webtoon, attributes: ['idx', 'webtoonName'] },
          { model: db.Episode, attributes: ['idx', 'uploadDate'] },
        ],
      },
      { model: db.Member, as: 'Reporter', attributes: ['idx', 'nickname'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * 특정 신고 내역 삭제
 */
export async function deleteReportedCommentReport(id: number) {
  const report = await db.CommentReport.findByPk(id);
  if (!report) throw new Error('신고 내역이 존재하지 않습니다.');
  await report.destroy();
}
