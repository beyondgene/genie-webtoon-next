// controllers/episode/list.ts
import db from '@/models';
import { getBookmarkStatusForList } from '@/controllers/member/bookmarksController';

async function getSubscriptionStatus(
  memberId: number,
  webtoonId: number
): Promise<{ isSubscribed: boolean; alarmOn: boolean }> {
  const list = await getBookmarkStatusForList(memberId, [webtoonId]);
  const s = list?.[0];
  return { isSubscribed: !!s?.isSubscribed, alarmOn: !!s?.alarmOn };
}

export async function getEpisodeList(
  userId: number,
  webtoonId: number
): Promise<{
  episodes: Array<{
    idx: number;
    title: string;
    epthumbnailUrl: string;
    uploadDate: Date;
  }>;
  subscription: { isSubscribed: boolean; alarmOn: boolean };
}> {
  // 1) 에피소드 목록: 필요한 4개 컬럼만 조회
  const episodes = (await db.Episode.findAll({
    where: { webtoonId },
    attributes: [
      'idx',
      'title',
      // DB가 snake_case면 아래 한 줄로 alias:
      // ['thumbnail_url', 'thumbnailUrl'],
      'epthumbnailUrl',
      'uploadDate',
    ],
    order: [['uploadDate', 'DESC']],
    raw: true,
  })) as {
    idx: number;
    title: string;
    epthumbnailUrl: string; // snake_case면 위 attributes에서 alias 적용
    uploadDate: Date;
  }[];

  // 2) 구독 상태
  const { isSubscribed, alarmOn } = await getSubscriptionStatus(userId, webtoonId);

  // 선언된 반환 타입과 정확히 일치
  return { episodes, subscription: { isSubscribed, alarmOn } };
}
