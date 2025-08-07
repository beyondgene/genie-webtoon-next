import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdminAuth } from '@/lib/middlewares/auth';
import { logAdView, getAdViewLogs } from '@/controllers/advertisement/advertisementViewController';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const memberId = sessionOrRes.id as number;
    const adId = Number(params.id);
    const log = await logAdView(memberId, adId);
    return NextResponse.json(log, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '광고 조회 로그 기록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const adId = Number(params.id);
    const logs = await getAdViewLogs(adId);
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '광고 조회 로그 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
