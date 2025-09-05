// controllers/episode/navigation.ts
import db from '@/models';
import { Op } from 'sequelize';

/**
 * webtoonId, episodeId 기준으로
 * - 이전(prev)·다음(next) 회차 (idx, title)
 * - 전체 회차 수(totalCount)
 * 를 반환합니다.
 */
export async function getEpisodeNavigation(
  webtoonId: number,
  episodeId: number
): Promise<{
  prev: { idx: number; title: string } | null;
  next: { idx: number; title: string } | null;
  totalCount: number;
}> {
  const totalCount = await db.Episode.count({ where: { webtoonId } });
  // 에피소드 idx를 기반으로 이전 에피소드 제목과 idx를 받아옴
  const prev = await db.Episode.findOne({
    where: { webtoonId, idx: { [Op.lt]: episodeId } },
    order: [['idx', 'DESC']],
    attributes: ['idx', 'title'],
  });
  // 에피소드 idx를 기반으로 다음 에피소드 제목과 idx를 받아옴
  const next = await db.Episode.findOne({
    where: { webtoonId, idx: { [Op.gt]: episodeId } },
    order: [['idx', 'ASC']],
    attributes: ['idx', 'title'],
  });

  return {
    prev: prev ? { idx: prev.idx, title: prev.title } : null,
    next: next ? { idx: next.idx, title: next.title } : null,
    totalCount,
  };
}
