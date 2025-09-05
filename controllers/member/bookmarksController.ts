import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';

export async function getBookmarkStatusForList(
  memberId: number,
  webtoonIds: number[]
): Promise<Record<number, { isSubscribed: boolean; alarmOn: boolean }>> {
  const result: Record<number, { isSubscribed: boolean; alarmOn: boolean }> = {};
  for (const id of webtoonIds ?? []) result[id] = { isSubscribed: false, alarmOn: false };
  if (!webtoonIds?.length) return result;

  // 컬럼명(camel/snake) 혼용 대응: raw로 받아서 안전하게 매핑
  const subs = await db.Subscription.findAll({
    where: { memberId, webtoonId: webtoonIds },
    raw: true,
  });

  for (const s of subs as any[]) {
    const wid = s.webtoonId ?? s.webtoon_id;
    if (!wid) continue;
    result[wid] = {
      isSubscribed: (s.status ?? 'INACTIVE') === 'ACTIVE',
      alarmOn: !!(s.alarm_on ?? s.alarmOn),
    };
  }
  return result;
}

type MaybePromise<T> = T | Promise<T>;
type BookmarkStatus = {
  webtoonId: number;
  isSubscribed: boolean;
  alarmOn: boolean;
};

// util
async function findSub(memberId: number, webtoonId: number) {
  return db.Subscription.findOne({ where: { memberId, webtoonId } });
}

// 목록 맵핑
export function toBookmarkMap(marks: BookmarkStatus[]) {
  return new Map<number, { isSubscribed: boolean; alarmOn: boolean }>(
    marks.map((m) => [m.webtoonId, { isSubscribed: m.isSubscribed, alarmOn: m.alarmOn }])
  );
}

/**
 * GET /api/(protected)/member/bookmarks
 * 활성 구독 목록 조회
 */
export async function getBookmarks(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  //db의 구독 테이블에서 'webtoonId', 'alarm_on', 'status', 'createdAt', 'updatedAt'속성을 기준으로 검색하여 웹툰 테이블에 속한 속성까지 포함해서 데이터셋 설정
  const subs = await db.Subscription.findAll({
    where: { memberId, status: 'ACTIVE' },
    attributes: ['webtoonId', 'alarm_on', 'status', 'createdAt', 'updatedAt'],
    include: [
      {
        model: db.Webtoon,
        attributes: ['idx', 'webtoonName', 'wbthumbnailUrl', 'genre'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const subscriptions = subs.map((s: any) => ({
    webtoonId: s.webtoonId,
    webtoonName: s.Webtoon?.webtoonName ?? '',
    wbthumbnailUrl: s.Webtoon?.wbthumbnailUrl ?? '',
    alarmOn: !!s.alarm_on,
    status: s.status,
    subscribedAt: s.createdAt?.toISOString?.() ?? '',
    updatedAt: s.updatedAt?.toISOString?.() ?? '',
  }));

  // 카드가 바로 쓸 수 있는 납작한 형태 병행 제공
  const items = subs.map((s: any) => ({
    idx: s.webtoonId,
    webtoonName: s.Webtoon?.webtoonName ?? '',
    wbthumbnailUrl: s.Webtoon?.wbthumbnailUrl ?? '',
    genre: s.Webtoon?.genre ?? null,
    alarmOn: !!s.alarm_on,
  }));

  return NextResponse.json({ subscriptions, items }, { status: 200 });
}

/**
 * POST /api/(protected)/member/bookmarks/[webtoonId]
 * 구독 생성 또는 복구
 */
export async function subscribeBookmark(
  req: NextRequest,
  { params }: { params: MaybePromise<{ webtoonId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  const { webtoonId: webtoonIdStr } = await params; // Promise | object 모두 허용
  const webtoonId = Number.parseInt(webtoonIdStr, 10);
  // 멤버와 웹툰 idx를 기반으로 구독 여부를 확인하고 이에 해당하는 응답과 액션 반응
  try {
    const existing = await findSub(memberId, webtoonId);
    if (existing) {
      if (existing.status !== 'ACTIVE') {
        await existing.update({ status: 'ACTIVE', alarm_on: false });
        return NextResponse.json(
          { message: '구독이 복구되었습니다.', alarmOn: false },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { message: '이미 구독 중인 웹툰입니다.', alarmOn: !!existing.alarm_on },
        { status: 200 }
      );
    }

    await db.Subscription.create({
      memberId,
      webtoonId,
      alarm_on: false,
      status: 'ACTIVE',
    });

    return NextResponse.json({ message: '구독되었습니다.', alarmOn: false }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/(protected)/member/bookmarks/[webtoonId]
 * 알림 on/off 토글
 */
export async function toggleBookmarkAlarm(
  req: NextRequest,
  { params }: { params: MaybePromise<{ webtoonId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  const { webtoonId: webtoonIdStr } = await params;
  const webtoonId = Number.parseInt(webtoonIdStr, 10);
  const { alarmOn } = (await req.json()) as { alarmOn: boolean };
  // 멤버와 웹툰 idx를 기반으로 구독 여부를 확인후 구독중이라면 알림 on/off 여부 설정
  try {
    const sub = await findSub(memberId, webtoonId);
    if (!sub || sub.status !== 'ACTIVE') {
      return NextResponse.json({ message: '구독 상태가 아닙니다.' }, { status: 400 });
    }
    await sub.update({ alarm_on: !!alarmOn });
    return NextResponse.json(
      { message: '알림 설정이 변경되었습니다.', alarmOn: !!alarmOn },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '알림 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/(protected)/member/bookmarks/[webtoonId]
 * 구독 해제
 */
export async function unsubscribeBookmark(
  req: NextRequest,
  { params }: { params: MaybePromise<{ webtoonId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  const { webtoonId: webtoonIdStr } = await params;
  const webtoonId = Number.parseInt(webtoonIdStr, 10);
  // 멤버와 웹툰 idx를 기반으로 구독 취소와 관련된 로직 수행
  try {
    const sub = await findSub(memberId, webtoonId);
    if (!sub || sub.status === 'INACTIVE') {
      return NextResponse.json(
        { message: '구독 정보가 없거나 이미 해제된 상태입니다.' },
        { status: 200 }
      );
    }
    sub.status = 'INACTIVE';
    sub.alarm_on = false;
    await sub.save();

    return NextResponse.json({ message: '구독이 해제되었습니다.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 해제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
