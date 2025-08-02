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
    const episodes = await db.Episode.findAll({
      include: [
        { model: db.Webtoon, attributes: ['idx','webtoonName'] },
        { model: db.Advertisement, attributes: ['idx','ad_name'] }
      ]
    });
    return NextResponse.json(episodes);
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
    const { uploadDate, webtoonId, adId } = await req.json();
    const ep = await db.Episode.create({
      uploadDate,
      webtoonId,
      adId,
      adminId: sessionOrRes.id
    });
    return NextResponse.json(ep, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
