export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { createReply } from '@/controllers/comment/commentReplyController';

// 대댓글 작성을 위해 생성되어있는 컨트롤러 로직을 불러오는 post 핸들러 라우터
async function POSTHandler(
  req: NextRequest,
  { params }: { params: Promise<{ parentCommentId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const userId = sessionOrRes.id as number;
  const { parentCommentId } = await params;
  const { content, webtoonId, episodeId } = (await req.json().catch(() => ({}))) as {
    content?: string;
    webtoonId?: number;
    episodeId?: number;
  };

  if (!content || !content.trim()) {
    return NextResponse.json({ message: '내용을 입력해주세요.' }, { status: 400 });
  }

  const result = await createReply({
    parentCommentId: Number(parentCommentId),
    webtoonId: Number(webtoonId),
    episodeId: Number(episodeId),
    memberId: userId,
    text: content,
  });

  return NextResponse.json(result, { status: 201 });
}

export const POST = withErrorHandler(POSTHandler);
