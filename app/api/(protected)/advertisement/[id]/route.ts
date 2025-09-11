export const runtime = 'nodejs';
// 코드를 만들긴 했지만 현지 광고를 관리자가 db에서 직접하기 때문에 의미 없는 코드
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { updateAd, deleteAd } from '@/controllers/advertisement/advertisementController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function PATCHHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const id = Number(params.id);
    const data = await req.json();
    const updated = await updateAd(id, data);
    return NextResponse.json(updated);
  } catch (err: any) {
    const msg = err.message.includes('찾을 수 없습니다')
      ? err.message
      : '광고 수정 중 오류가 발생했습니다.';
    const status = err.message.includes('찾을 수 없습니다') ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const id = Number(params.id);
    await deleteAd(id);
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (err: any) {
    const msg = err.message.includes('찾을 수 없습니다')
      ? err.message
      : '광고 삭제 중 오류가 발생했습니다.';
    const status = err.message.includes('찾을 수 없습니다') ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
export const PATCH = withErrorHandler(PATCHHandler);
export const DELETE = withErrorHandler(DELETEHandler);
