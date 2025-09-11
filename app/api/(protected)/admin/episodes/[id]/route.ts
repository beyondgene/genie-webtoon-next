export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/episodesController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 특정 에피소드 정보를 불러오는 컨트롤러를 호출하는 get 핸들러 라우터
async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  const ep = await ctrl.getEpisodeById(+params.id);
  return NextResponse.json(ep);
}
// 특정 에피소드 정보를 붙여넣는 컨트롤러를 호출하는 put 핸들러 라우터
async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  const data = await req.json();
  const updated = await ctrl.updateEpisode(+params.id, data);
  return NextResponse.json(updated);
}
// 특정 에피소드를 삭제하는 컨트롤러를 호출하는 delete 핸들러 라우터
async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  await ctrl.deleteEpisode(+params.id);
  return NextResponse.json(null, { status: 204 });
}
export const GET = withErrorHandler(GETHandler);
export const PUT = withErrorHandler(PUTHandler);
export const DELETE = withErrorHandler(DELETEHandler);
