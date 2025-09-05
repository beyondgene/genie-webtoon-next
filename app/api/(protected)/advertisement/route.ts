import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middlewares/auth';
import { getActiveAds, createAd } from '@/controllers/advertisement/advertisementController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 광고를 불러오는 컨트롤러에 있는 로직을 불러오는 get 핸들러 라우터
async function GETHandler(
  req: NextRequest,
  { params }: { params: Record<string, string> } // params는 비어있지만 시그니처 맞춤
) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const ads = await getActiveAds();
    return NextResponse.json(ads);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '광고 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 광고를 추가하는 컨트롤러에 있는 로직을 불러오는 post 핸들러 라우터
async function POSTHandler(req: NextRequest, { params }: { params: Record<string, string> }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const body = await req.json();
    if (!body.imageUrl || !body.linkUrl || !body.position || body.priority == null) {
      return NextResponse.json(
        { error: '필수 필드(imageUrl, linkUrl, position, priority)가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const ad = await createAd({
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl,
      position: body.position,
      priority: body.priority,
      adName: body.adName,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      totalExposureLimit: body.totalExposureLimit,
    });
    return NextResponse.json(ad, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '광고 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
