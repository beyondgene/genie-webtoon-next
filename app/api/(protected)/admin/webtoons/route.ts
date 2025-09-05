import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/webtoonsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 컨트롤러에 정의된 웹툰 정보 갖고오는 컨트롤러 호출하는 get 라우터
async function GETHandler(req: NextRequest) {
  await requireAdminAuth(req);
  const list = await ctrl.listWebtoons();
  return NextResponse.json(list);
}
// 웹툰 정보 post하는 컨트롤러 호출하는 post 라우터
async function POSTHandler(req: NextRequest) {
  await requireAdminAuth(req);
  const data = await req.json();
  const created = await ctrl.createWebtoon(data);
  return NextResponse.json(created, { status: 201 });
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
