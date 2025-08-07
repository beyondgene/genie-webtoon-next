import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { likeComment, unlikeComment } from '@/controllers/comment/commentLikeController';

export async function POST(req: NextRequest, { params }: { params: { commentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const commentId = parseInt(params.commentId, 10);

  try {
    await likeComment(userId, commentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '좋아요 추가 중 오류' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { commentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const commentId = parseInt(params.commentId, 10);

  try {
    await unlikeComment(userId, commentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '좋아요 취소 중 오류' }, { status: 400 });
  }
}
