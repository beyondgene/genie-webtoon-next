export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/webtoonsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 컨트롤러에 정의된 웹툰 정보 갖고오는 컨트롤러 호출하는 get 라우터
async function GETHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  const list = await ctrl.listWebtoons();
  return NextResponse.json(list);
}
// 웹툰 정보 post하는 컨트롤러 호출하는 post 라우터
async function POSTHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  const data = await req.json();
  const created = await ctrl.createWebtoon(data);
  return NextResponse.json(created, { status: 201 });
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
