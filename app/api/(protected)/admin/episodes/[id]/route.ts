import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/episodesController';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const ep = await ctrl.getEpisodeById(+params.id);
  return NextResponse.json(ep);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  const data = await req.json();
  const updated = await ctrl.updateEpisode(+params.id, data);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(req);
  await ctrl.deleteEpisode(+params.id);
  return NextResponse.json(null, { status: 204 });
}
