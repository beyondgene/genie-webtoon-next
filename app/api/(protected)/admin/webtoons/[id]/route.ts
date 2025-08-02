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
    const wt = await db.Webtoon.findByPk(params.id, {
      include: [{ model: db.Artist, attributes: ['idx','artistName'] }]
    });
    if (!wt) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
    return NextResponse.json(wt);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  try {
    const payload = await req.json();
    const [count] = await db.Webtoon.update(
      { ...payload, adminIdx: sessionOrRes.id },
      { where: { idx: params.id } }
    );
    if (!count) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
    const updated = await db.Webtoon.findByPk(params.id);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  try {
    const wt = await db.Webtoon.findByPk(params.id);
    if (!wt) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
    await wt.destroy();
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
