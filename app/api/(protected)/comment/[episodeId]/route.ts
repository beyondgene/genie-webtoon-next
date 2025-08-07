import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getCommentsByEpisode, createComment } from '@/controllers/comment/commentController';

export async function GET(req: NextRequest, { params }: { params: { episodeId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const episodeId = parseInt(params.episodeId, 10);

  try {
    const comments = await getCommentsByEpisode(episodeId, userId);
    return NextResponse.json(comments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '댓글 목록 조회 중 오류' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { episodeId: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const episodeId = parseInt(params.episodeId, 10);
  const { content } = await req.json();

  try {
    const newComment = await createComment(userId, episodeId, content);
    return NextResponse.json(newComment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '댓글 생성 중 오류' }, { status: 400 });
  }
}
