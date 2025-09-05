// 싫어요/싫어요 취소
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { dislikeComment, undislikeComment } from '@/controllers/comment/commentLikeController';

// 싫어요 클릭에 대한 숫자 증가와 반응을 담당하는 컨트롤러를 호출하는 post 핸들러 라우터
async function POSTHandler(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;

  const { commentId } = await params;
  const id = Number(commentId);
  const result = await dislikeComment(id, userId);
  return NextResponse.json(result);
}

// 싫어요 취소에 대한 숫자 감소와 반응을 담당하는 컨트롤러를 호출하는 delete 핸들러 라우터
async function DELETEHandler(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;

  const { commentId } = await params;
  const id = Number(commentId);
  const result = await undislikeComment(id, userId);
  return NextResponse.json(result);
}

export const POST = withErrorHandler(POSTHandler);
export const DELETE = withErrorHandler(DELETEHandler);
