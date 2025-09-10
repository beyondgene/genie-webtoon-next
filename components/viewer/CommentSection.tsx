'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  getComments,
  createComment,
  likeComment,
  unlikeComment,
  dislikeComment,
  undislikeComment,
  replyToComment,
  deleteComment,
  reportComment,
  type CommentItem,
  type ReactionResult,
} from '@/services/comment.service';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleBottomCenterTextIcon,
  TrashIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
// 사용할 변수들 사전 타입 정의
type Props = {
  webtoonId: number | string;
  episodeId: number | string;
  pageSize?: number;
};
// 댓글 영역 컴포넌트 정의
export default function CommentSection({ webtoonId, episodeId, pageSize = 20 }: Props) {
  const { data: session } = useSession();
  const myId = Number(session?.user?.id) || null;
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'LATEST' | 'OLDEST' | 'BEST'>('LATEST');
  const [newText, setNewText] = useState('');
  const [rev, setRev] = useState(0);
  const inFlight = useRef<Set<number>>(new Set());
  const fmt = (d?: string | Date) =>
    d ? new Date(d).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  // 댓글들 불러오는 로직(useEffect)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const wid = Number(webtoonId);
        const eid = Number(episodeId);
        const list = await getComments(wid, eid, { page, pageSize, sort });
        if (alive) setItems(list ?? []);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? '댓글을 불러오지 못했습니다.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [webtoonId, episodeId, page, pageSize, sort, rev]);

  const toId = (c: CommentItem) => Number(c.id ?? 0);

  // 트리 구조(부모/자식)
  const threaded = useMemo(() => {
    const parents: CommentItem[] = [];
    const children = new Map<number, CommentItem[]>();
    for (const c of items) {
      const id = toId(c);
      const pid = c.parentId;
      if (pid) {
        const arr = children.get(pid) ?? [];
        arr.push(c);
        children.set(pid, arr);
      } else {
        parents.push(c);
      }
    }
    return { parents, children };
  }, [items]);
  // 좋아요 버튼
  async function onToggleLike(c: CommentItem) {
    const id = toId(c);
    if (!Number.isFinite(id) || inFlight.current.has(id)) return;
    inFlight.current.add(id);
    try {
      const res: ReactionResult = c.isLiked ? await unlikeComment(id) : await likeComment(id);
      setItems((prev) => prev.map((x) => (toId(x) === id ? { ...x, ...res } : x)));
    } catch (e: any) {
      alert(e?.message ?? '처리 실패');
    } finally {
      inFlight.current.delete(id);
    }
  }
  // 싫어요 버튼
  async function onToggleDisLike(c: CommentItem) {
    const id = toId(c);
    if (!Number.isFinite(id) || inFlight.current.has(id)) return;
    inFlight.current.add(id);
    try {
      const res: ReactionResult = c.isDisliked
        ? await undislikeComment(id)
        : await dislikeComment(id);
      setItems((prev) => prev.map((x) => (toId(x) === id ? { ...x, ...res } : x)));
    } catch (e: any) {
      alert(e?.message ?? '처리 실패');
    } finally {
      inFlight.current.delete(id);
    }
  }
  // 새 댓글 작성
  async function onCreate() {
    try {
      const text = newText.trim();
      if (!text) return;
      await createComment({
        webtoonId: Number(webtoonId),
        episodeId: Number(episodeId),
        content: text,
      });
      setNewText('');
      setPage(1); // 새로고침
      setRev((r) => r + 1);
    } catch (e: any) {
      alert(e?.message ?? '댓글 작성 실패');
    }
  }
  // 대댓글 작성
  async function onReply(parentId: number, v: string) {
    try {
      await replyToComment(parentId, {
        content: v,
        webtoonId: Number(webtoonId),
        episodeId: Number(episodeId),
      });
      setPage(1);
      setRev((r) => r + 1);
    } catch (e: any) {
      alert(e?.message ?? '대댓글 작성 실패');
    }
  }
  // 삭제
  async function onRemove(c: CommentItem) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteComment(toId(c));
      setItems((prev) => prev.filter((x) => toId(x) !== toId(c)));
    } catch (e: any) {
      alert(e?.message ?? '삭제 실패');
    }
  }
  // 신고
  async function onReport(c: CommentItem) {
    const reason = prompt(
      '신고 사유를 입력하세요 (SPAM/ABUSE/SPOILER/ETC 중 하나, 기타 내용은 자유 입력)'
    );
    if (!reason) return;
    try {
      await reportComment(toId(c), { reason: (reason as any) || 'ETC', detail: reason });
      alert('신고가 접수되었습니다.');
    } catch (e: any) {
      alert(e?.message ?? '신고 실패');
    }
  }
  // 댓글 영역 전반 html
  return (
    <div className="relative">
      {/* 기존 bg-[#929292] */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-2 left-1/2 -translate-x-1/2 w-screen -z-10 bg-white"
      />
      {/* 댓글 영역 전체도 흰색 + 기본 글자색 #4f4f4f */}
      <section className="space-y-4 rounded-xl p-4 bg-white text-[#4f4f4f]">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">댓글</h2>
        </header>

        <div className="flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCreate()}
            placeholder="댓글을 입력하세요"
            className="flex-1 rounded-md border border-[#4f4f4f] bg-white px-3 py-2 text-[#4f4f4f] placeholder-[#4f4f4f]/50 caret-[#4f4f4f] focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30"
          />
          <button
            onClick={onCreate}
            className="rounded-md border border-[#4f4f4f] px-3 py-2 font-medium text-[#4f4f4f] hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30"
            aria-label="댓글 작성"
          >
            등록
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">불러오는 중…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
        {/* 부모 댓글 리스트: 모든 아이템 사이 경계선 */}
        <ul className="divide-y divide-[#e5e7eb] rounded-xl border border-[#e5e7eb]">
          {threaded.parents.map((c) => {
            const id = toId(c);
            const replies = threaded.children.get(id) ?? [];
            return (
              <li key={id} className="relative rounded-md bg-white p-3 text-[#4f4f4f]">
                <time className="absolute right-2 top-2 text-[10px] text-[#6b7280]">
                  {fmt(c.creationDate)}
                </time>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{c.memberNickname}</div>
                    <p className="whitespace-pre-wrap text-sm">{c.content}</p>
                    <div className="mt-2 flex items-center gap-x-2 text-xs text-[#6b7280] max-[400px]:flex-nowrap max-[400px]:overflow-x-auto max-[400px]:gap-x-1">
                      <button
                        onClick={() => onToggleLike(c)}
                        className="flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 text-[#4f4f4f] hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30 max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                        aria-label="좋아요"
                      >
                        <HandThumbUpIcon className="h-4 w-4 text-[#4f4f4f]" aria-hidden="true" />
                        <span>{c.likeCount}</span>
                      </button>
                      <button
                        onClick={() => onToggleDisLike(c)}
                        className="flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 text-[#4f4f4f] hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30 max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                        aria-label="싫어요"
                      >
                        <HandThumbDownIcon className="h-4 w-4 text-[#4f4f4f]" aria-hidden="true" />
                        <span>{c.dislikeCount}</span>
                      </button>
                      <button
                        onClick={() => {
                          const v = prompt('답글을 입력하세요');
                          if (v && v.trim()) onReply(id, v.trim());
                        }}
                        className="flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 break-keep whitespace-nowrap text-[#4f4f4f] hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30 max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                      >
                        <ChatBubbleBottomCenterTextIcon
                          className="h-4 w-4 text-[#4f4f4f] max-[400px]:h-4 max-[400px]:w-4"
                          aria-hidden="true"
                        />
                        <span>답글</span>
                      </button>
                      <button
                        onClick={() => onReport(c)}
                        className="flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 break-keep whitespace-nowrap text-[#4f4f4f] hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30 max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                        aria-label="신고"
                      >
                        <FlagIcon
                          className="h-4 w-4 text-[#4f4f4f] max-[400px]:h-4 max-[400px]:w-4"
                          aria-hidden="true"
                        />
                        <span>신고</span>
                      </button>
                      {myId && Number(c.memberId) === myId && (
                        <button
                          onClick={() => onRemove(c)}
                          className="ml-2 flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 break-keep whitespace-nowrap text-red-600 max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                          aria-label="삭제"
                        >
                          <TrashIcon className="h-4 w-4 max-[400px]:h-4 max-[400px]:w-4" />
                          <span>삭제</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {replies.length > 0 && (
                  /* 대댓글 리스트에도 경계선 적용 + 들여쓰기 표시용 왼쪽 보더 */
                  <ul className="mt-2 pl-6 divide-y divide-[#e5e7eb] border-l border-[#e5e7eb]">
                    {replies.map((r) => (
                      <li key={toId(r)} className="relative bg-white p-2 text-[#4f4f4f]">
                        {/* 작성 시간: 우상단 */}
                        <time className="absolute right-2 top-2 text-[10px] text-[#6b7280]">
                          {fmt(r.creationDate)}
                        </time>

                        <div className="text-xs font-semibold">{r.memberNickname}</div>
                        <div className="text-sm whitespace-pre-wrap">{r.content}</div>

                        {/* 대댓글 액션 버튼: 좋아요/싫어요/신고 */}
                        <div
                          className="mt-2 flex items-center gap-x-2 text-xs text-[#6b7280]
                                     max-[400px]:flex-nowrap max-[400px]:overflow-x-auto max-[400px]:gap-x-1"
                        >
                          <button
                            onClick={() => onToggleLike(r)}
                            className="flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 text-[#4f4f4f]
                                       hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30
                                       break-keep whitespace-nowrap max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                            aria-label="좋아요"
                          >
                            <HandThumbUpIcon
                              className="h-4 w-4 text-[#4f4f4f] max-[400px]:h-4 max-[400px]:w-4"
                              aria-hidden="true"
                            />
                            <span>{r.likeCount}</span>
                          </button>
                          <button
                            onClick={() => onToggleDisLike(r)}
                            className="flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 text-[#4f4f4f]
                                       hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30
                                       break-keep whitespace-nowrap max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                            aria-label="싫어요"
                          >
                            <HandThumbDownIcon
                              className="h-4 w-4 text-[#4f4f4f] max-[400px]:h-4 max-[400px]:w-4"
                              aria-hidden="true"
                            />
                            <span>{r.dislikeCount}</span>
                          </button>
                          <button
                            onClick={() => onReport(r)}
                            className="flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 text-[#4f4f4f]
                                       hover:bg-[#4f4f4f]/5 focus:outline-none focus:ring-2 focus:ring-[#4f4f4f]/30
                                       break-keep whitespace-nowrap max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                            aria-label="신고"
                          >
                            <FlagIcon
                              className="h-4 w-4 text-[#4f4f4f] max-[400px]:h-4 max-[400px]:w-4"
                              aria-hidden="true"
                            />
                            <span>신고</span>
                          </button>
                          {/* 대댓글 삭제 */}
                          {myId && Number(r.memberId) === myId && (
                            <button
                              onClick={() => onRemove(r)}
                              className="ml-2 flex items-center gap-1 rounded-md border border-[#4f4f4f] px-2 py-1 text-red-600
                                         break-keep whitespace-nowrap max-[400px]:px-1 max-[400px]:gap-0.5 max-[400px]:shrink-0"
                              aria-label="삭제"
                            >
                              <TrashIcon className="h-4 w-4 max-[400px]:h-4 max-[400px]:w-4" />
                              <span>삭제</span>
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border px-3 py-1 disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">{page} 페이지</span>
          <button onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1">
            다음
          </button>
        </div>
      </section>
    </div>
  );
}
