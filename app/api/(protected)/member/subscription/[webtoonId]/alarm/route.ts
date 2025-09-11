export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import db from '@/models';

//유효한 idx값인지 검증
function toValidId(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// 알람 설정 여부를 확인하고 이를 구독 여부에 반영하는 라우터
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ webtoonId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { webtoonId } = await ctx.params;
  const id = toValidId(webtoonId);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid webtoonId' }, { status: 400 });
  }

  const memberId = (authed as any).id as number;
  const body = await req.json().catch(() => ({}));
  const next = !!(body?.alarm_on ?? body?.alarmOn);

  const sub = await db.Subscription.findOne({
    where: { memberId, webtoonId: id },
  });
  if (!sub || sub.status !== 'ACTIVE') {
    return NextResponse.json({ message: '구독 상태가 아닙니다.' }, { status: 400 });
  }

  await sub.update({ alarm_on: next });
  return NextResponse.json({ ok: true, alarmOn: next });
}
