import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { deleteComment, updateComment } from '@/controllers/comment/commentController';

// 컨트롤러에 있는 댓글 업데이트 및 작성에 대한 컨트롤러를 호출하는 patch 핸들러 라우터
async function PATCHHandler(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const { commentId } = await params;

  const { content } = (await req.json().catch(() => ({}))) as { content?: string };
  if (!content?.trim()) {
    return NextResponse.json({ message: '내용을 입력해주세요.' }, { status: 400 });
  }

  const result = await updateComment(Number(commentId), content.trim());
  return NextResponse.json(result);
}

// 컨트롤러에 있는 댓글 삭제에 대한 컨트롤러를 호출하는 delete 핸들러 라우터
async function DELETEHandler(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const { commentId } = await params;

  const ok = await deleteComment(Number(commentId), userId);
  if (!ok) {
    return NextResponse.json(
      { error: '댓글은 본인이 작성한 것만 삭제할 수 있습니다' },
      { status: 403 }
    );
  }
  return NextResponse.json({ success: true });
}

export const PATCH = withErrorHandler(PATCHHandler);
export const DELETE = withErrorHandler(DELETEHandler);
