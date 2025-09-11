export const runtime = 'nodejs';
import { NextResponse, NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import {
  getViewStatsByAd,
  getViewStatsByMember,
} from '@/controllers/admin/advertisementViewLogsController';

// 광고 시청로그 불러오는 컨트롤러를 호출하는 GET 라우터
async function GETHandler(req: NextRequest) {
  await requireAdminAuth(req);
  const [byAd, byMember] = await Promise.all([getViewStatsByAd(), getViewStatsByMember()]);
  return NextResponse.json({ byAd, byMember });
}

export const GET = withErrorHandler(GETHandler);
