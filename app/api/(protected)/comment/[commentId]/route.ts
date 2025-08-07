import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import {
  updateComment,
  deleteComment as removeComment,
} from '@/controllers/comment/commentController';

export async function PATCH(req: NextRequest, { params }: { params: { commentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const commentId = parseInt(params.commentId, 10);
  const { content } = await req.json();

  try {
    const updated = await updateComment(commentId, content);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '댓글 수정 중 오류' },
      { status: err.message === '댓글을 찾을 수 없습니다.' ? 404 : 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { commentId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const commentId = parseInt(params.commentId, 10);

  try {
    await removeComment(commentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '댓글 삭제 중 오류' },
      { status: err.message === '삭제할 댓글이 없습니다.' ? 404 : 403 }
    );
  }
}
