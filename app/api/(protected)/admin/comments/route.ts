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
    const comments = await db.Comment.findAll({
      include: [
        { model: db.User, attributes: ['idx','memberId','nickname'] },
        { model: db.Webtoon, attributes: ['idx','webtoonName'] },
        { model: db.Episode, attributes: ['idx','uploadDate'] }
      ],
      order: [['creationDate','DESC']]
    });
    return NextResponse.json(comments);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
