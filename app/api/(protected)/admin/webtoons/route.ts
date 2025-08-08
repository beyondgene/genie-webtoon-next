import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/webtoonsController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  await requireAuth(req);
  const list = await ctrl.listWebtoons();
  return NextResponse.json(list);
}

async function POSTHandler(req: NextRequest) {
  await requireAuth(req);
  const data = await req.json();
  const created = await ctrl.createWebtoon(data);
  return NextResponse.json(created, { status: 201 });
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
