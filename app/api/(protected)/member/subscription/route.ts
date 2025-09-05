import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import db from '@/models';

// 구독 정보 db에 업데이트
export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { webtoonId } = await req.json();
  const wid = Number(webtoonId);
  const memberId = (authed as any).id as number;

  if (!Number.isFinite(wid) || !Number.isFinite(memberId)) {
    return NextResponse.json({ message: 'bad request' }, { status: 400 });
  }

  const [sub, created] = await db.Subscription.findOrCreate({
    where: { memberId, webtoonId: wid },
    defaults: { memberId, webtoonId, status: 'ACTIVE', alarm_on: false },
  });
  if (!created && sub.status !== 'ACTIVE') {
    await sub.update({ status: 'ACTIVE' });
  }
  return NextResponse.json({ ok: true });
}
