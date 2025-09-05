// app/api/(protected)/advertisement/[id]/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdminAuth } from '@/lib/middlewares/auth';
import { logAdView, getAdViewLogs } from '@/controllers/advertisement/advertisementViewController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

export const dynamic = 'force-dynamic';

// 광고 뷰 기록 생성 (회원 전용)
async function POSTHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrRes = await requireAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const { id } = await params; // ← 반드시 await
    const adId = Number(id);
    const memberId = sessionOrRes.id as number;

    const log = await logAdView(memberId, adId);
    return NextResponse.json(log, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? '광고 조회 기록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 광고 뷰 로그 조회 (관리자 전용)
async function GETHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrRes = await requireAdminAuth(req);
    if (sessionOrRes instanceof NextResponse) return sessionOrRes;

    const { id } = await params; // ← 반드시 await
    const adId = Number(id);

    const logs = await getAdViewLogs(adId);
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? '광고 조회 로그 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export const POST = withErrorHandler(POSTHandler);
export const GET = withErrorHandler(GETHandler);
