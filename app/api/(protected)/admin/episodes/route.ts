import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/episodesController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  await requireAdminAuth(req);
  const episodes = await ctrl.listEpisodes();
  return NextResponse.json(episodes);
}

async function POSTHandler(req: NextRequest) {
  await requireAdminAuth(req);
  const data = await req.json();
  const created = await ctrl.createEpisode(data);
  return NextResponse.json(created, { status: 201 });
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
