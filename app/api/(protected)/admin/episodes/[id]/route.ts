import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/episodesController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const ep = await ctrl.getEpisodeById(+params.id);
  return NextResponse.json(ep);
}

async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const data = await req.json();
  const updated = await ctrl.updateEpisode(+params.id, data);
  return NextResponse.json(updated);
}

async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  await ctrl.deleteEpisode(+params.id);
  return NextResponse.json(null, { status: 204 });
}
export const GET = withErrorHandler(GETHandler);
export const PUT = withErrorHandler(PUTHandler);
export const DELETE = withErrorHandler(DELETEHandler);
