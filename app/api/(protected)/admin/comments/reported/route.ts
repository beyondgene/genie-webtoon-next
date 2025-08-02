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
    const reports = await db.CommentReport.findAll({
      include: [
        {
          model: db.Comment,
          include: [
            { model: db.User, attributes: ['idx','nickname'] },
            { model: db.Webtoon, attributes: ['idx','webtoonName'] },
            { model: db.Episode, attributes: ['idx','uploadDate'] }
          ]
        },
        { model: db.User, as: 'Reporter', attributes: ['idx','nickname'] }
      ],
      order: [['createdAt','DESC']]
    });
    return NextResponse.json(reports);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
