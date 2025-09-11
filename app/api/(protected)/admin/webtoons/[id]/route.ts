export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/webtoonsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 특정 웹툰 정보 불러오는 컨트롤러를 호출하는 get 라우터
async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  const wt = await ctrl.getWebtoonById(+params.id);
  return NextResponse.json(wt);
}
// 특정 웹툰 정보를 배치하는 컨트롤러를 호출하는 put 라우터
async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  const data = await req.json();
  const updated = await ctrl.updateWebtoon(+params.id, data);
  return NextResponse.json(updated);
}
// 특정 웹툰 정보를 삭제하는 컨트롤러를 호출하는 delete 라우터
async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  await ctrl.deleteWebtoon(+params.id);
  return NextResponse.json(null, { status: 204 });
}
export const GET = withErrorHandler(GETHandler);
export const PUT = withErrorHandler(PUTHandler);
export const DELETE = withErrorHandler(DELETEHandler);
