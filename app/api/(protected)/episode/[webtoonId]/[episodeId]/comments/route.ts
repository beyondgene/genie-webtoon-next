export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { buildCommentAttributes } from '@/controllers/comment/_commentColumns';
import db from '@/models';
import type { Order } from 'sequelize';

type Sort = 'LATEST' | 'OLDEST' | 'BEST';
export const dynamic = 'force-dynamic';
// 대댓글 부모 idx 정규화
const PARENT_RE = /^::p\[(\d+)\]\s*/i;
function parseParentPrefix(raw: string | null | undefined) {
  const s = String(raw ?? '');
  const m = s.match(PARENT_RE);
  if (m) {
    const pid = Number(m[1]);
    const text = s.replace(PARENT_RE, '');
    return { parentId: Number.isFinite(pid) ? pid : null, text };
  }
  return { parentId: null, text: s };
}
const nn = (n: unknown) => (Number.isFinite(Number(n)) ? Number(n) : 0);

// 댓글 작성 컨트롤러를 호출하는 get 라우터
async function GETHandler(
  req: NextRequest,
  { params }: { params: Promise<{ webtoonId: string; episodeId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;
  const { episodeId } = await params;

  const eid = Number(episodeId);
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? 20);
  const sort = (searchParams.get('sort') ?? 'LATEST') as Sort;

  const attrs = await buildCommentAttributes();
  // 댓글 작성 필드 생성
  const CREATED_FIELD = 'creationDate' as const;
  let order: Order;
  switch (sort) {
    case 'BEST':
      order = [
        ['likes', 'DESC'],
        [CREATED_FIELD, 'DESC'],
      ];
      break;
    case 'OLDEST':
      order = [[CREATED_FIELD, 'ASC']];
      break;
    default:
      order = [[CREATED_FIELD, 'DESC']];
      break;
  }
  // 현재 행과 idx 확인후 댓글 전체 갯수 확인
  const { rows, count } = await db.Comment.findAndCountAll({
    attributes: attrs,
    include: [{ model: db.Member, attributes: ['idx', 'nickname'] }],
    where: { episodeId: eid },
    order,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  // 현재 페이지의 댓글 id 모아서, 로그인 유저의 반응 한번에 조회
  const commentIds: number[] = rows
    .map((r: any) => Number(r.get('idx') ?? r.get('id')))
    .filter(Boolean);
  const reactions = commentIds.length
    ? await db.CommentReaction.findAll({
        attributes: ['commentId', 'type'],
        where: { memberId: userId, commentId: commentIds },
      })
    : [];
  // 좋아요 싫어요 반응수 확인 로직
  const reactionMap = new Map<number, 'LIKE' | 'DISLIKE'>();
  for (const r of reactions as any[]) {
    reactionMap.set(Number(r.commentId), r.type);
  }
  // 아이템 타입과 속성 정의
  const items = rows.map((row: any) => {
    const plain = row.get({ plain: true });
    const member = plain.Member ?? {};
    const raw = plain.content ?? plain.commentCol ?? '';
    const parsed = parseParentPrefix(raw);
    const id = Number(plain.idx ?? plain.id);
    const my = reactionMap.get(id) ?? null;

    return {
      id,
      content: raw,
      parentId: parsed.parentId,
      likeCount: nn(plain.likes),
      dislikeCount: nn(plain.dislikes),
      isLiked: my === 'LIKE',
      isDisliked: my === 'DISLIKE',
      memberId: member.idx ?? plain.memberId,
      memberNickname: member.nickname ?? '',
      creationDate: plain.creationDate ?? plain.createdAt,
      modifiedDate: plain.modifiedDate ?? plain.updatedAt,
    };
  });

  return NextResponse.json({
    items,
    meta: { page, pageSize, totalItems: count, totalPages: Math.ceil(count / pageSize) },
  });
}

// 댓글 내용 db에 적용시키는 post 라우터
async function POSTHandler(
  req: NextRequest,
  { params }: { params: Promise<{ webtoonId: string; episodeId: string }> }
) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const userId = sessionOrRes.id as number;

  const { webtoonId, episodeId } = await params;
  const { content } = (await req.json().catch(() => ({}))) as { content?: string };
  // 댓글 내용이 비었을때
  if (!content?.trim()) {
    return NextResponse.json({ message: '내용을 입력해주세요.' }, { status: 400 });
  }
  // comment 테이블에 새로운 정보 추가
  const c = await db.Comment.create({
    webtoonId: Number(webtoonId),
    episodeId: Number(episodeId),
    memberId: userId,
    adminId: Number(process.env.DEFAULT_COMMENT_ADMIN_ID ?? 2),
    likes: 0,
    dislikes: 0,
    commentCol: content,
    creationDate: new Date(),
    modifiedDate: new Date(),
  });
  // 이를 json으로 내보냄
  return NextResponse.json(
    {
      data: {
        id: c.get('idx'),
        parentId: null,
        likeCount: 0,
        dislikeCount: 0,
        isLiked: false,
        isDisliked: false,
        content,
        memberId: userId,
        memberNickname: sessionOrRes.nickname,
        creationDate: c.get('creationDate'),
        modifiedDate: c.get('modifiedDate'),
      },
    },
    { status: 201 }
  );
}

export const GET = withErrorHandler(GETHandler);
export const POST = withErrorHandler(POSTHandler);
