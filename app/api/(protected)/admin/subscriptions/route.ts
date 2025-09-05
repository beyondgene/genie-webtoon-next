import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { listSubscriptions } from '@/controllers/admin/subscriptionsController';

// 구독 여부를 db에서 불러오는 컨트롤러를 호출하는 get 핸들러 라우터
async function GETHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  const subs = await listSubscriptions();
  return NextResponse.json(subs);
}

export const GET = withErrorHandler(GETHandler);
