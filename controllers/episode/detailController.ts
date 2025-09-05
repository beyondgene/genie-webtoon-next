// controllers/episode/detailController.ts
import db from '@/models';
import { Op, type WhereOptions } from 'sequelize';
import { getAdById, type DetailAdDTO } from '@/controllers/advertisement/advertisementController';

/** 프로젝트별 모델 명칭 차이 흡수: Subscription | Subscriptions | MemberSubscription 등 */
function resolveSubscriptionModel() {
  const anyDb = db as unknown as Record<string, any>;
  return (
    anyDb.Subscription ??
    anyDb.Subscriptions ??
    anyDb.MemberSubscription ??
    anyDb.MemberSubscriptions ??
    null
  );
}

/** 멤버가 webtoonIds 중 어떤 걸 구독했는지 판별하는 함수(클로저)를 반환 */
async function getSubscriptionStatusForList(memberId: number | undefined, webtoonIds: number[]) {
  const SubscriptionModel = resolveSubscriptionModel();
  if (!SubscriptionModel || !memberId || webtoonIds.length === 0) {
    return (_webtoonId: number) => false;
  }
  // 웹툰 idx를 기반으로 구독모델을 발견
  const rows = (await SubscriptionModel.findAll({
    where: { memberId, webtoonId: { [Op.in]: webtoonIds } } as WhereOptions,
    attributes: ['webtoonId'],
    raw: true,
  })) as Array<{ webtoonId: number }>;

  const set = new Set<number>(rows.map((r) => Number(r.webtoonId)));
  return (webtoonId: number) => set.has(Number(webtoonId));
}

export type DetailAd = DetailAdDTO | null;

export async function getEpisodeDetailWithMeta(args: {
  webtoonId: number;
  episodeId: number;
  memberId?: number;
}) {
  const { webtoonId, episodeId, memberId } = args;

  // 에피소드 단건
  const episode = await db.Episode.findOne({
    where: { webtoonId, idx: episodeId },
  });
  if (!episode) return null;

  // 같은 웹툰의 전체 에피소드 목록(이전/다음용)
  const episodes = (await db.Episode.findAll({
    where: { webtoonId },
    order: [['uploadDate', 'ASC']],
    attributes: ['idx', 'title', 'epthumbnailUrl', 'uploadDate', 'webtoonId'],
    raw: true,
  })) as Array<{
    idx: number;
    title: string;
    epthumbnailUrl?: string | null;
    uploadDate?: Date | string | null;
    webtoonId: number;
  }>;
  const firstEpisode = episodes?.[0] ?? null;

  // 구독 여부(멤버 기준) → 응답 필드는 호환을 위해 isBookmarked로 유지
  const isSubscribedFn = await getSubscriptionStatusForList(memberId, [webtoonId]);
  const isBookmarked = isSubscribedFn(webtoonId);

  // 에피소드에 연결된 광고(adId가 있으면 조회)
  let ad: DetailAd = null;
  const adIdRaw = (episode as any).adId ?? (episode as any).adIdx ?? null;
  const adId = typeof adIdRaw === 'string' ? parseInt(adIdRaw, 10) : adIdRaw;

  if (typeof adId === 'number' && Number.isFinite(adId)) {
    try {
      ad = await getAdById(adId); // ✅ 숫자 하나만 전달
    } catch {
      ad = null;
    }
  }

  return {
    episode,
    episodes,
    firstEpisode,
    isBookmarked,
    ad,
  };
}
