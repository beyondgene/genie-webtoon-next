// controllers/episode/list.ts
import db from '@/models';
import { getSubscriptionStatus } from '@/controllers/subscription';

/**
 * userId가 webtoonId에 대해
 * - 에피소드 목록
 * - 구독 상태(isSubscribed) 및 알림 설정(alarmOn)
 * 을 함께 반환합니다.
 */
export async function getEpisodeList(
  userId: number,
  webtoonId: number
): Promise<{
  episodes: Array<{
    idx: number;
    title: string;
    thumbnailUrl: string;
    uploadDate: Date;
  }>;
  subscription: { isSubscribed: boolean; alarmOn: boolean };
}> {
  // 1) 에피소드 목록 조회
  const rawEpisodes = await db.Episode.findAll({
    where: { webtoonId },
    order: [['uploadDate', 'ASC']],
    attributes: ['idx', 'title', 'thumbnailUrl', 'uploadDate'],
  });
  const episodes = rawEpisodes.map((ep) => ({
    idx: ep.idx,
    title: ep.title,
    thumbnailUrl: ep.thumbnailUrl,
    uploadDate: ep.uploadDate,
  }));

  // 2) 구독 상태 조회
  const { isSubscribed, alarmOn } = await getSubscriptionStatus(userId, webtoonId);

  return { episodes, subscription: { isSubscribed, alarmOn } };
}
