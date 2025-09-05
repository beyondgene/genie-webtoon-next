// controllers/episode/listController.ts
import db from '@/models';
import { Op, type WhereOptions } from 'sequelize';

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

  const rows = (await SubscriptionModel.findAll({
    where: { memberId, webtoonId: { [Op.in]: webtoonIds } } as WhereOptions,
    attributes: ['webtoonId'],
    raw: true,
  })) as Array<{ webtoonId: number }>;

  const set = new Set<number>(rows.map((r) => Number(r.webtoonId)));
  return (webtoonId: number) => set.has(Number(webtoonId));
}

/** 웹툰의 에피소드 목록 + (멤버 기준) 구독 여부 플래그
 *  응답 필드 isBookmarked 는 기존 호환 목적
 */
export async function getEpisodeList(args: {
  webtoonId: number;
  memberId?: number;
  limit?: number;
}) {
  const { webtoonId, memberId, limit } = args;
  // 에피소드 테이블에서 업로드된 날짜를 순서로 리스트를 db에서 받아오는 과정
  const items = (await db.Episode.findAll({
    where: { webtoonId },
    order: [['uploadDate', 'ASC']],
    ...(limit ? { limit } : {}),
    attributes: ['idx', 'title', 'epthumbnailUrl', 'uploadDate', 'webtoonId'],
    raw: true,
  })) as Array<{
    idx: number;
    title: string;
    epthumbnailUrl?: string | null;
    uploadDate?: Date | string | null;
    webtoonId: number;
  }>;

  const isSubscribedFn = await getSubscriptionStatusForList(memberId, [webtoonId]);
  const isBookmarked = isSubscribedFn(webtoonId);

  return {
    items,
    isBookmarked, // ← 구독 기반
  };
}

/** 과거 코드 호환용 별칭 */
export const getEpisodeListWithMeta = getEpisodeList;
