import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { dislikeComment, undislikeComment } from '@/controllers/comment/commentLikeController';

export async function POST(req: NextRequest, { params }: { params: { commentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const commentId = parseInt(params.commentId, 10);

  try {
    await dislikeComment(userId, commentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '싫어요 추가 중 오류' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { commentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const commentId = parseInt(params.commentId, 10);

  try {
    await undislikeComment(userId, commentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '싫어요 취소 중 오류' }, { status: 400 });
  }
}
