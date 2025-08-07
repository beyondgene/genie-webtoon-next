import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/webtoonsController';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const wt = await ctrl.getWebtoonById(+params.id);
  return NextResponse.json(wt);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const data = await req.json();
  const updated = await ctrl.updateWebtoon(+params.id, data);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  await ctrl.deleteWebtoon(+params.id);
  return NextResponse.json(null, { status: 204 });
}
