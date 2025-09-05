import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/membersController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 전반적인 멤버의 정보를 불러오는 컨트롤러를 호출하는 get 핸들러 라우터
async function GETHandler(req: NextRequest) {
  await requireAdminAuth(req);
  const members = await ctrl.listMembers();
  return NextResponse.json(members);
}
export const GET = withErrorHandler(GETHandler);
