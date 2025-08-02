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
    const artists = await db.Artist.findAll({
      attributes: [
        'idx',
        'realName',
        'artistName',
        'artistPhone',
        'artistEmail',
        'webtoonList',
        'debutDate',
        'modifiedDate',
        'createdAt',
        'updatedAt',
        'adminId'
      ]
    });
    return NextResponse.json(artists);
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
      realName,
      artistName,
      artistPhone,
      artistEmail,
      webtoonList,
      debutDate
    } = await req.json();
    const artist = await db.Artist.create({
      realName,
      artistName,
      artistPhone,
      artistEmail,
      webtoonList,
      debutDate,
      modifiedDate: new Date(),
      adminId: sessionOrRes.id
    });
    return NextResponse.json(artist, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
