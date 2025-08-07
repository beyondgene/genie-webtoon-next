// app/api/(protected)/admin/artists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { listArtists, createArtist } from '@/controllers/admin/artistsController';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const artists = await listArtists();
    return NextResponse.json(artists);
  } catch {
    return NextResponse.json(
      { error: '작가 목록 조회에 실패했습니다. 관리자에게 문의하세요.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  try {
    const artist = await createArtist(body);
    return NextResponse.json(artist, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '작가 생성 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}
