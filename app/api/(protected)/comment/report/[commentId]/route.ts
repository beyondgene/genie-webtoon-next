import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { reportComment } from '@/controllers/comment/commentReportController';

// 컨트롤러에 작성된 신고 로직을 불러오는 post 라우터
async function POSTHandler(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;

  const { commentId } = await params;
  const { reason, detail } = (await req.json().catch(() => ({}))) as {
    reason?: string;
    detail?: string;
  };

  if (!reason) {
    return NextResponse.json({ message: '신고 사유를 선택해주세요.' }, { status: 400 });
  }

  const result = await reportComment(Number(commentId), userId, reason);
  return NextResponse.json(result, { status: 201 });
}

export const POST = withErrorHandler(POSTHandler);
