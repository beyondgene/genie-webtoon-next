export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/reportedCommentsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 신고된 댓글들을 불러오는 컨트롤러를 호출하는 get 라우터
async function GETHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  const reports = await ctrl.listReportedComments();
  return NextResponse.json(reports);
}
// 신고된 댓글들을 삭제하는 컨트롤러를 호출하는 delete 라우터
async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  await ctrl.deleteReportedCommentReport(+params.id);
  return NextResponse.json(null, { status: 204 });
}
export const GET = withErrorHandler(GETHandler);
export const DELETE = withErrorHandler(DELETEHandler);
