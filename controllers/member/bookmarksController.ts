import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';
import { Op } from 'sequelize';

interface SubscriptionDTO {
  webtoonId: number;
  webtoonName: string;
  alarmOn: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  wbthumbnailUrl: string;
  subscribedAt: string;
  updatedAt: string;
}

// ---- 새로 추가: 라우터에서 사용할 상태 타입 ----
export type BookmarkStatus = {
  webtoonId: number;
  isSubscribed: boolean;
  alarmOn: boolean;
};

// 공통 구독 조회 헬퍼
async function findSub(memberId: number, webtoonId: number) {
  return db.Subscription.findOne({ where: { memberId, webtoonId } });
}

// ---- 새로 추가: 라우터용 북마크 상태 조회 함수 ----
/**
 * 북마크(=구독) 상태를 webtoonIds 기준으로 묶어서 반환
 * - ACTIVE 상태만 구독으로 인정
 * - alarm_on을 boolean으로 변환
 */
export async function getBookmarkStatusForList(
  memberId: number,
  webtoonIds: number[]
): Promise<BookmarkStatus[]> {
  if (!memberId || !Array.isArray(webtoonIds) || webtoonIds.length === 0) {
    return [];
  }

  const rows: Array<{ webtoonId: number; alarm_on?: any; status?: string }> =
    await db.Subscription.findAll({
      attributes: ['webtoonId', 'alarm_on', 'status'],
      where: {
        memberId,
        webtoonId: { [Op.in]: webtoonIds },
        status: 'ACTIVE',
      },
      raw: true,
    });

  // ACTIVE인 것만 isSubscribed = true로 반환
  return rows.map((r) => ({
    webtoonId: Number(r.webtoonId),
    isSubscribed: true,
    alarmOn: !!r.alarm_on,
  }));
}

// (선택) 배열을 즉시 Map으로 변환해서 has/get 쓰고 싶을 때
export function toBookmarkMap(marks: BookmarkStatus[]) {
  return new Map<number, { isSubscribed: boolean; alarmOn: boolean }>(
    marks.map((m) => [m.webtoonId, { isSubscribed: m.isSubscribed, alarmOn: m.alarmOn }])
  );
}

/**
 * GET /api/(protected)/member/bookmarks
 * 유저가 활성화된 구독(북마크) 목록 조회
 */
export async function getBookmarks(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  try {
    const subs = await db.Subscription.findAll({
      where: { memberId, status: 'ACTIVE' },
      attributes: ['webtoonId', 'alarm_on', 'status', 'createdAt', 'updatedAt'],
      include: [
        {
          model: db.Webtoon,
          attributes: ['idx', 'webtoonName', 'wbthumbnailUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result: SubscriptionDTO[] = subs.map((s: any) => ({
      webtoonId: s.webtoonId,
      webtoonName: s.Webtoon.webtoonName,
      wbthumbnailUrl: s.Webtoon.wbthumbnailUrl,
      alarmOn: s.alarm_on,
      status: s.status,
      subscribedAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({ subscriptions: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/(protected)/member/bookmarks/[webtoonId]
 * 새로운 구독 또는 복구
 */
export async function subscribeBookmark(
  req: NextRequest,
  { params }: { params: { webtoonId: string } }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  const webtoonId = parseInt(params.webtoonId, 10);

  try {
    const existing = await findSub(memberId, webtoonId);
    if (existing) {
      if (existing.status === 'INACTIVE') {
        existing.status = 'ACTIVE';
        existing.alarm_on = false;
        await existing.save();
        return NextResponse.json(
          { message: '구독이 복구되었습니다.', alarmOn: existing.alarm_on },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { message: '이미 구독 중인 웹툰입니다.', alarmOn: existing.alarm_on },
        { status: 200 }
      );
    }

    const sub = await db.Subscription.create({
      memberId,
      webtoonId,
      alarm_on: false,
      status: 'ACTIVE',
    });
    return NextResponse.json(
      { message: '구독이 추가되었습니다.', alarmOn: sub.alarm_on },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/(protected)/member/bookmarks/[webtoonId]
 * 알림 설정 토글
 */
export async function toggleBookmarkAlarm(
  req: NextRequest,
  { params }: { params: { webtoonId: string } }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  const webtoonId = parseInt(params.webtoonId, 10);
  const { alarmOn } = (await req.json()) as { alarmOn: boolean };

  try {
    const sub = await findSub(memberId, webtoonId);
    if (!sub || sub.status === 'INACTIVE') {
      return NextResponse.json({ error: '구독 정보가 없거나 비활성 상태입니다.' }, { status: 404 });
    }
    sub.alarm_on = alarmOn;
    await sub.save();
    return NextResponse.json(
      { message: '알림 설정이 변경되었습니다.', alarmOn: sub.alarm_on },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '알림 토글 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/(protected)/member/bookmarks/[webtoonId]
 * 구독 해제(soft-delete)
 */
export async function unsubscribeBookmark(
  req: NextRequest,
  { params }: { params: { webtoonId: string } }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  const webtoonId = parseInt(params.webtoonId, 10);

  try {
    const sub = await findSub(memberId, webtoonId);
    if (!sub || sub.status === 'INACTIVE') {
      return NextResponse.json(
        { message: '구독 정보가 없거나 이미 해제된 상태입니다.' },
        { status: 200 }
      );
    }
    sub.status = 'INACTIVE';
    await sub.save();
    return NextResponse.json({ message: '구독이 해제되었습니다.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 해제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
