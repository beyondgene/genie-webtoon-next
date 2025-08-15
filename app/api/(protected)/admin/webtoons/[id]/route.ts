import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/webtoonsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  const wt = await ctrl.getWebtoonById(+params.id);
  return NextResponse.json(wt);
}

async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  const data = await req.json();
  const updated = await ctrl.updateWebtoon(+params.id, data);
  return NextResponse.json(updated);
}

async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminAuth(req);
  await ctrl.deleteWebtoon(+params.id);
  return NextResponse.json(null, { status: 204 });
}
export const GET = withErrorHandler(GETHandler);
export const PUT = withErrorHandler(PUTHandler);
export const DELETE = withErrorHandler(DELETEHandler);
