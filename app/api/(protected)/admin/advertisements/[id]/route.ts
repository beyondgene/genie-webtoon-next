import { withErrorHandler } from '@/lib/middlewares/errorHandler';
// app/api/(protected)/admin/advertisements/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import {
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
} from '@/controllers/admin/advertisementsController';
// 특정 광고를 IDX로 불러오는 컨트롤러를 호출하는 GET 라우터
async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = Number(params.id);
  try {
    const ad = await getAdvertisementById(id);
    return NextResponse.json(ad);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '해당 광고를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }
}
// 특정 광고를 IDX로 붙여넣는 컨트롤러를 호출하는 PUT 라우터
async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = Number(params.id);
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다. JSON 바디를 확인해 주세요.' },
      { status: 400 }
    );
  }

  try {
    const updated = await updateAdvertisement(id, data);
    return NextResponse.json(updated);
  } catch (err: any) {
    const msg = err.message.includes('찾을 수 없습니다')
      ? err.message
      : '광고 수정에 실패했습니다.';
    const status = err.message.includes('찾을 수 없습니다') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
// 특정 광고를 IDX로 삭제하는 컨트롤러를 호출하는 DELETE 라우터
async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = Number(params.id);
  try {
    await deleteAdvertisement(id);
    return NextResponse.json({ message: '광고가 성공적으로 삭제되었습니다.' });
  } catch (err: any) {
    const msg = err.message.includes('찾을 수 없습니다')
      ? err.message
      : '광고 삭제에 실패했습니다.';
    const status = err.message.includes('찾을 수 없습니다') ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
export const GET = withErrorHandler(GETHandler);
export const PUT = withErrorHandler(PUTHandler);
export const DELETE = withErrorHandler(DELETEHandler);
