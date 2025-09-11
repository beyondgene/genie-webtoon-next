export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/commentsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 댓글 정보를 불러오는 컨트롤러를 호출하는 get 라우터
async function GETHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  const list = await ctrl.listComments();
  return NextResponse.json(list);
}
// 댓글을 삭제하는 컨트롤러를 호출하는 delete 라우터
async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  await ctrl.deleteComment(+params.id);
  return NextResponse.json(null, { status: 204 });
}
export const GET = withErrorHandler(GETHandler);
export const DELETE = withErrorHandler(DELETEHandler);
