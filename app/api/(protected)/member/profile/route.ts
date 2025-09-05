import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getMemberProfile } from '@/controllers/member/profileController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 컨트롤러에 정의된 멤버 프로필 갖고오는 로직을 호출하는 라우터
async function GETHandler(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  return NextResponse.json(await getMemberProfile(memberId));
}
export const GET = withErrorHandler(GETHandler);
