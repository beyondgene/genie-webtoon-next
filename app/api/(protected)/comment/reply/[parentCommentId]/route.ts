import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { replyToComment } from '@/controllers/comment/commentReplyController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function POSTHandler(req: NextRequest, { params }: { params: { parentcommentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const parentCommentId = parseInt(params.parentcommentId, 10);
  const { content } = await req.json();

  try {
    const reply = await replyToComment(userId, parentCommentId, content);
    return NextResponse.json(reply, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '답글 생성 중 오류' }, { status: 400 });
  }
}
export const POST = withErrorHandler(POSTHandler);
