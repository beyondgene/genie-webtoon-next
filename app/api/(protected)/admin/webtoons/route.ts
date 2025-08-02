import { NextRequest, NextResponse } from 'next/server';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  try {
    const webtoons = await db.Webtoon.findAll({
      include: [
        { model: db.Artist, attributes: ['idx','artistName'] }
      ]
    });
    return NextResponse.json(webtoons);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  if (!sessionOrRes.isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  try {
    const {
      webtoonName,
      description,
      genre,
      artistIdx
    } = await req.json();
    const wt = await db.Webtoon.create({
      webtoonName,
      description,
      genre,
      views: 0,
      recommend: 0,
      adminIdx: sessionOrRes.id,
      artistIdx
    });
    return NextResponse.json(wt, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
