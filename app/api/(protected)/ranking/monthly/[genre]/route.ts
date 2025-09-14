export const runtime = 'nodejs';
// app/api/ranking/weekly/[genre]/route.ts
import { NextResponse } from 'next/server';
import { getRanking } from '../../_lib';
import type { GenreSlug } from '../../_lib';

// lib.ts에서 정의한 로직을 그대로 갖고와 월간 랭킹으로 적용
export async function GET(_req: Request, { params }: { params: Promise<{ genre: GenreSlug }> }) {
  const data = await getRanking('monthly', (await params).genre);
  return NextResponse.json({ items: data }, { status: 200 });
}
