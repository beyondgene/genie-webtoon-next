import { withErrorHandler } from '@/lib/middlewares/errorHandler';
// app/api/(protected)/admin/artists/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { getArtistById, updateArtist, deleteArtist } from '@/controllers/admin/artistsController';

// 특정 작가 정보를 불러오는 컨트롤러를 호출하는 GET 라우터
async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const artist = await getArtistById(Number(params.id));
    return NextResponse.json(artist);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '해당 작가를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }
}
// 특정 작가 정보를 붙여넣는 컨트롤러를 호출하는 PUT 라우터
async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 본문이 유효한 JSON이 아닙니다.' }, { status: 400 });
  }

  try {
    const updated = await updateArtist(Number(params.id), body);
    return NextResponse.json(updated);
  } catch (err: any) {
    const notFound = err.message.includes('찾을 수 없습니다');
    return NextResponse.json(
      { error: err.message || '작가 수정에 실패했습니다.' },
      { status: notFound ? 404 : 400 }
    );
  }
}
// 특정 작가 정보를 삭제하는 컨트롤러를 호출하는 DELETE 라우터
async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await deleteArtist(Number(params.id));
    return NextResponse.json({ message: '작가가 삭제되었습니다.' });
  } catch (err: any) {
    const notFound = err.message.includes('찾을 수 없습니다');
    return NextResponse.json(
      { error: err.message || '작가 삭제에 실패했습니다.' },
      { status: notFound ? 404 : 500 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
export const PUT = withErrorHandler(PUTHandler);
export const DELETE = withErrorHandler(DELETEHandler);
