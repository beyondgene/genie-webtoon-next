import { withErrorHandler } from '@/lib/middlewares/errorHandler';
// app/api/(protected)/admin/advertisements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import {
  listAdvertisements,
  createAdvertisement,
} from '@/controllers/admin/advertisementsController';

async function GETHandler(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const ads = await listAdvertisements();
    return NextResponse.json(ads);
  } catch (err) {
    return NextResponse.json(
      { error: '광고 목록 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}

async function POSTHandler(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

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
    const newAd = await createAdvertisement(data);
    return NextResponse.json(newAd, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '광고 생성에 실패했습니다.' },
      { status: 400 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
