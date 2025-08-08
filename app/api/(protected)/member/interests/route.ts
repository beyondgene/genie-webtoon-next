import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { listAuthorInterests } from '@/controllers/member/interestsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  try {
    const interests = await listAuthorInterests(memberId);
    // [{ artistIdx, artistName, webtoonList, interestedAt }]
    return NextResponse.json(interests);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export const GET = withErrorHandler(GETHandler);
