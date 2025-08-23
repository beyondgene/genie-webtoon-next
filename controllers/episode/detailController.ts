// controllers/episode/detail.ts
import db from '@/models';
import { getBookmarkStatusForList } from '@/controllers/member/bookmarksController';
import { getAdById, type DetailAdDTO } from '@/controllers/advertisement/advertisementController';

/**
 * userId가 webtoonId, episodeId에 대해
 * - 에피소드 상세(EPISODE 테이블 주요 컬럼)
 * - 구독 상태(isSubscribed) 및 알림 설정(alarmOn)
 * - 광고 정보(advertisement; adId가 있을 때만)
 * 을 함께 반환합니다.
 */

async function getSubscriptionStatus(
  memberId: number,
  webtoonId: number
): Promise<{ isSubscribed: boolean; alarmOn: boolean }> {
  const list = await getBookmarkStatusForList(memberId, [webtoonId]);
  const s = list?.[0];
  return { isSubscribed: !!s?.isSubscribed, alarmOn: !!s?.alarmOn };
}

export async function getEpisodeDetailWithMeta(
  userId: number,
  webtoonId: number,
  episodeId: number
): Promise<{
  episode: {
    idx: number;
    title: string;
    epthumbnailUrl: string;
    contentUrl: string;
    uploadDate: Date;
    webtoonId: number;
    adId: number | null;
    adminId: number;
  };
  subscription: { isSubscribed: boolean; alarmOn: boolean };
  advertisement: null | {
    idx: number;
    ad_name: string;
    target_url: string;
  };
}> {
  // 1) 에피소드 기본 정보 조회
  const episode = await db.Episode.findOne({
    where: { webtoonId, idx: episodeId },
    attributes: [
      'idx',
      'title',
      'epthumbnailUrl',
      'contentUrl',
      'uploadDate',
      'webtoonId',
      'adId',
      'adminId',
    ],
  });
  if (!episode) {
    throw new Error('해당 에피소드를 찾을 수 없습니다.');
  }

  // 2) 구독 상태 조회
  const { isSubscribed, alarmOn } = await getSubscriptionStatus(userId, webtoonId);

  // 3) 광고 정보 조회 (adId가 있을 때만)

  const adRaw: DetailAdDTO | null = episode?.adId ? await getAdById(episode.adId) : null;
  const advertisement = adRaw
    ? {
        idx: adRaw.idx,
        ad_name: adRaw.adName ?? '',
        target_url: adRaw.targetUrl ?? '',
        // 필요하면 ad_image_url도 추가 가능:
        // ad_image_url: adRaw.adImageUrl ?? null,
      }
    : null;

  return {
    episode: {
      idx: episode.idx,
      title: episode.title,
      epthumbnailUrl: episode.epthumbnailUrl,
      contentUrl: episode.contentUrl,
      uploadDate: episode.uploadDate,
      webtoonId: episode.webtoonId,
      adId: episode.adId,
      adminId: episode.adminId,
    },
    subscription: { isSubscribed, alarmOn },
    advertisement,
  };
}
