import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import * as ctrl from '@/controllers/admin/episodesController';

export async function GET(req: NextRequest) {
  await requireAuth(req);
  const episodes = await ctrl.listEpisodes();
  return NextResponse.json(episodes);
}

export async function POST(req: NextRequest) {
  await requireAuth(req);
  const data = await req.json();
  const created = await ctrl.createEpisode(data);
  return NextResponse.json(created, { status: 201 });
}
