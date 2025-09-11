export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/episodesController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 특정 멤버의 정보를 불러오는 컨트롤러를 호출하는 get 핸들러 라우터
async function GETHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  const episodes = await ctrl.listEpisodes();
  return NextResponse.json(episodes);
}

// 특정 멤버의 정보를 수정하는 컨트롤러를 호출하는 post 핸들러 라우터
async function POSTHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;
  const data = await req.json();
  const created = await ctrl.createEpisode(data);
  return NextResponse.json(created, { status: 201 });
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
