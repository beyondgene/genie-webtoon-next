import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import db from '@/models';

function toValidId(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// 구독 상태 조회
export async function GET(req: NextRequest, ctx: { params: Promise<{ webtoonId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { webtoonId } = await ctx.params;
  const id = toValidId(webtoonId);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid webtoonId' }, { status: 400 });
  }

  const memberId = (authed as any).id as number;

  const sub = await db.Subscription.findOne({
    where: { memberId, webtoonId: id },
  });

  return NextResponse.json({
    subscribed: !!sub && sub.status === 'ACTIVE',
    alarmOn: !!sub?.alarm_on,
  });
}

// 구독 해제
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ webtoonId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { webtoonId } = await ctx.params;
  const id = toValidId(webtoonId);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid webtoonId' }, { status: 400 });
  }

  const memberId = (authed as any).id as number;
  const sub = await db.Subscription.findOne({ where: { memberId, webtoonId: id } });
  if (!sub) return NextResponse.json({ ok: true });

  await sub.update({ status: 'INACTIVE', alarm_on: false });
  return NextResponse.json({ ok: true });
}
