// app/api/(protected)/admin/advertisements/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import {
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
} from '@/controllers/admin/advertisementsController';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req);
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req);
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req);
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
