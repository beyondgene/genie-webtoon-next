// app/api/ranking/weekly/[genre]/route.ts
import { NextResponse } from 'next/server';
import { getRanking } from '../../_lib';
import type { GenreSlug } from '../../_lib';

export async function GET(_req: Request, { params }: { params: { genre: GenreSlug } }) {
  const data = await getRanking('monthly', params.genre);
  return NextResponse.json({ items: data }, { status: 200 });
}
