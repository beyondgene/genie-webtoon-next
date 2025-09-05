import { withErrorHandler } from '@/lib/middlewares/errorHandler';
// app/api/(protected)/admin/artists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { listArtists, createArtist } from '@/controllers/admin/artistsController';

// 작가 정보를 불러오는 컨트롤러를 호출하는 get 라우터
async function GETHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
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
// 작가 정보를 불러와서 붙여놓는 컨트롤러를 호출하는 POST 라우터
async function POSTHandler(req: NextRequest) {
  const auth = await requireAdminAuth(req);
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
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
