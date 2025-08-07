import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { reportComment } from '@/controllers/comment/commentReportController';

export async function POST(req: NextRequest, { params }: { params: { commentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const commentId = parseInt(params.commentId, 10);
  const { reason } = await req.json();

  try {
    await reportComment(userId, commentId, reason);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '신고 생성 중 오류' }, { status: 400 });
  }
}
