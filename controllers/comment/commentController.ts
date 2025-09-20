// controllers/comment/commentController.ts
import db from '@/models';
import { buildCommentAttributes } from './_commentColumns';
// (dis)likedBy가 테이블에 실제 존재하지 않기 때문에 선택 속성으로 정의
type LegacyReactions = { likedBy?: unknown; dislikedBy?: unknown };

// comment 테이블의 속성들을 프런트에서 사용할 수 있도록 확장성을 부여한 타입 인터페이스
export interface CommentDTO {
  id: number;
  content: string;
  memberId: number;
  memberNickname: string;
  likeCount: number;
  isLiked: boolean;
  creationDate: string;
  modifiedDate: string;
}

// adminId 기본값(요청사항: 2). 필요 시 .env.local에 DEFAULT_COMMENT_ADMIN_ID로 오버라이드.
const DEFAULT_COMMENT_ADMIN_ID = Number(process.env.DEFAULT_COMMENT_ADMIN_ID ?? 2);

function decodeParent(raw: unknown): { parentId: number | null; text: string } {
  const s = typeof raw === 'string' ? raw : '';
  const m = /^::p\[(\d+)\]\s*/.exec(s);
  if (!m) return { parentId: null, text: s };
  const pid = Number(m[1]);
  return { parentId: Number.isFinite(pid) ? pid : null, text: s.slice(m[0].length) };
}
const toInt = (n: any, fallback = 0) => (Number.isFinite(Number(n)) ? Number(n) : fallback);

// TEXT(JSON) → number[] 파싱 헬퍼
function parseIds(content: unknown): number[] {
  if (!content) return [];
  try {
    if (typeof content === 'string') {
      const s = content.trim();
      if (!s) return [];
      const v = JSON.parse(s);
      if (Array.isArray(v)) return v.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    }
  } catch {
    /* ignore */
  }
  return [];
}

// Date | string → ISO 문자열 보정(날짜 문자열을 iso로 변환)
function toISO(d: any) {
  try {
    if (d instanceof Date) return d.toISOString();
    return new Date(d).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function getIncludedMember(row: any): { idx: number; nickname: string } | undefined {
  // Sequelize 모델 인스턴스는 get('AssociationName')로 포함된 연관을 안전하게 조회 가능
  if (row && typeof row.get === 'function') {
    return row.get('Member') as any; // 기본 alias: 'Member'
  }
  // 혹시 alias를 'member'로 정의한 경우 대비
  return (row?.Member ?? row?.member) as any;
}

/**
 * episodeId 의 최상위 댓글 목록을 조회
 */
export async function getCommentsByEpisode(
  episodeId: number,
  userId: number
): Promise<CommentDTO[]> {
  const comments = await db.Comment.findAll({
    where: { episodeId },
    attributes: await buildCommentAttributes(),
    include: [{ model: db.Member, attributes: ['idx', 'nickname'] }],
    order: [['creationDate', 'ASC']],
  });

  return comments.map((c: any) => {
    // JSON 기반 반응 배열(있을 때만 사용)
    // JSON 기반 반응 배열(있을 때만 사용) — DB엔 없는 필드이므로 선택 접근
    const likedIds = parseIds((c as LegacyReactions)?.likedBy);
    const dislikedIds = parseIds((c as LegacyReactions)?.dislikedBy);

    // 정수 카운트 우선, 없으면 배열 길이
    const likeCount = toInt(c.likes, likedIds.length);
    const dislikeCount = toInt(c.dislikes, dislikedIds.length);

    const isLiked = likedIds.includes(Number(userId));
    const isDisliked = dislikedIds.includes(Number(userId));

    // content/commentCol 둘 다 호환 + parentId 디코딩
    const raw =
      typeof c.content === 'string' && c.content
        ? c.content
        : typeof c.commentCol === 'string'
          ? c.commentCol
          : '';
    const { parentId, text } = decodeParent(raw);

    return {
      id: c.idx,
      content: text,
      parentId, // ✅ 대댓글 스레딩용
      memberId: c.memberId,
      memberNickname: c.Member?.nickname ?? '',
      likeCount,
      dislikeCount, // ✅ 추가
      isLiked,
      isDisliked, // ✅ 추가
      creationDate: toISO(c.creationDate),
      modifiedDate: toISO(c.modifiedDate),
    };
  });
}

/**
 * 새로운 댓글 생성
 * - FK(adminId) 문제 방지 위해 adminId 명시(=2)
 * - likes enum('likes'|'dislikes') 사용 → 기본 'likes'로 설정
 */

export async function createComment(
  userId: number,
  episodeId: number,
  content: string
): Promise<CommentDTO> {
  const payload: any = {
    content,
    episodeId,
    memberId: userId,
    adminId: DEFAULT_COMMENT_ADMIN_ID, // ★ FK 방지
    creationDate: new Date(),
    modifiedDate: new Date(),
  };

  payload.likes = 0;
  payload.dislikes = 0;

  // commentCol을 쓰는 스키마 호환(둘 다 있으면 content 우선)
  if (!('content' in db.Comment.getAttributes())) {
    delete payload.content;
    payload.commentCol = content;
  }

  // likedBy 컬럼이 있다면 초기값 세팅(없어도 에러 없이 건너뜀)
  try {
    payload.likedBy = JSON.stringify([]);
  } catch {}
  try {
    payload.dislikedBy = JSON.stringify([]);
  } catch {}

  const newComment = await db.Comment.create(payload);

  await newComment.reload({
    attributes: await buildCommentAttributes(),
    include: [{ model: db.Member, attributes: ['idx', 'nickname'] }],
  });
  // 새로운 댓글의 대댓글 여부 가능성 확장
  const likedIds = parseIds((newComment as LegacyReactions)?.likedBy);
  const dtoContent =
    typeof newComment.commentCol === 'string' && newComment.commentCol
      ? newComment.commentCol
      : typeof newComment.commentCol === 'string'
        ? newComment.commentCol
        : '';

  const member = getIncludedMember(newComment);
  const memberNickname = member?.nickname ?? '';

  return {
    id: newComment.idx,
    content: dtoContent,
    memberId: newComment.memberId,
    memberNickname,
    likeCount: likedIds.length, // 초기 0
    isLiked: false,
    creationDate: toISO(newComment.creationDate),
    modifiedDate: toISO(newComment.modifiedDate),
  };
}

/**
 * 단일 댓글 조회 (수정/삭제 전 검증 용)
 */
export async function getCommentById(commentId: number) {
  const comment = await db.Comment.findByPk(commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');
  return comment;
}

/**
 * 댓글 내용 수정
 * - modifiedDate 갱신
 * - content/commentCol 양쪽 호환
 */
export async function updateComment(commentId: number, content: string) {
  const comment: any = await getCommentById(commentId);

  if ('content' in comment) {
    comment.content = content;
  } else {
    comment.commentCol = content;
  }
  comment.modifiedDate = new Date();

  await comment.save();
  return comment;
}

/**
 * 댓글 삭제
 */
export async function deleteComment(commentId: number, memberId: number) {
  // 작성자 본인만 삭제되도록 comment가 실제 본인 것인지 먼저 확인
  const comment = await db.Comment.findOne({ where: { idx: commentId, memberId } });
  if (!comment) {
    return false;
  }

  // 댓글에 달린 반응을 먼저 삭제하여 FK 제약 조건을 피한다
  await db.CommentReaction.destroy({ where: { commentId } });

  // 작성자 본인만 삭제되도록 memberId 조건을 함께 건다
  const deleted = await db.Comment.destroy({ where: { idx: commentId, memberId } });
  // true/false를 반환하여 라우트에서 상태코드를 제어
  return deleted > 0;
}
