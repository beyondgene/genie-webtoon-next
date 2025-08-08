import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getMemberProfile } from '@/controllers/member/profileController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
async function GETHandler(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  return NextResponse.json(await getMemberProfile(memberId));
}
export const GET = withErrorHandler(GETHandler);
