import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/webtoonsController';

export async function GET(req: NextRequest) {
  await requireAuth(req);
  const list = await ctrl.listWebtoons();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  await requireAuth(req);
  const data = await req.json();
  const created = await ctrl.createWebtoon(data);
  return NextResponse.json(created, { status: 201 });
}
