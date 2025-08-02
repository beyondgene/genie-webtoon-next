import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  try {
    const logs = await db.AdViewLog.findAll({
      where: { adId: params.id },
      order: [['viewed_at', 'DESC']]
    });
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
