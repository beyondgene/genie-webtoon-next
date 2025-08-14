'use client';

import { useEffect, useState } from 'react';
import {
  getComments,
  createComment,
  likeComment,
  unlikeComment,
  replyToComment,
  deleteComment,
} from '@/services/comment.service';
import { HandThumbUpIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline'; // (C)

export default function CommentSection({ episodeId }: { episodeId: number | string }) {
  const [items, setItems] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    getComments({ episodeId, page: 1, pageSize: 20, sort: 'LATEST' })
      .then((res) => alive && setItems(res.items ?? (res as any).data ?? []))
      .catch((e) => alive && setErr(e.message || '댓글을 불러오지 못했습니다.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [episodeId]);

  const onSubmit = async () => {
    if (!content.trim()) return; // (B) 클라이언트 검증
    try {
      const created = await createComment({ episodeId, content });
      setItems((prev) => [created, ...prev]);
      setContent('');
    } catch (e: any) {
      alert(e.message || '댓글 작성 실패');
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">댓글</h3>

      {/* (B) HTML 유효성 검증 + 반응형 */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          required
          minLength={2}
          maxLength={1000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="응원과 감상을 남겨보세요"
          className="min-h-16 w-full resize-y rounded-xl border p-3 text-sm sm:text-base"
          aria-label="댓글 입력"
        />
        <button
          onClick={onSubmit}
          disabled={!content.trim()}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-40 sm:self-end"
          aria-disabled={!content.trim()}
          aria-label="댓글 등록"
        >
          등록
        </button>
      </div>

      {/* (G) 쉼머 스켈레톤 */}
      {loading ? (
        <div className="space-y-2" aria-live="polite">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border" />
          ))}
        </div>
      ) : null}

      {/* (H) 오류 메시지 접근성 */}
      {err ? (
        <p className="text-sm text-red-600" aria-live="polite" role="status">
          {err}
        </p>
      ) : null}

      <ul className="divide-y rounded-xl border">
        {items.map((c) => (
          <li key={c.id ?? c.idx} className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-1 text-sm text-neutral-500">{c.memberNickname ?? '익명'}</div>
              <p className="whitespace-pre-wrap text-sm sm:text-base">{c.content}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-600">
                <button
                  onClick={async () => {
                    try {
                      if (c.isLiked) {
                        await unlikeComment(c.id ?? c.idx);
                      } else {
                        await likeComment(c.id ?? c.idx);
                      }
                      setItems((prev) =>
                        prev.map((x) =>
                          (x.id ?? x.idx) === (c.id ?? c.idx)
                            ? {
                                ...x,
                                isLiked: !x.isLiked,
                                likeCount: (x.likeCount ?? 0) + (x.isLiked ? -1 : 1),
                              }
                            : x
                        )
                      );
                    } catch (e: any) {
                      alert(e.message || '처리 실패');
                    }
                  }}
                  className="flex items-center gap-1 rounded-md border px-2 py-1"
                  aria-label="좋아요"
                >
                  <HandThumbUpIcon className="h-4 w-4" aria-hidden="true" />
                  <span>{c.likeCount ?? 0}</span>
                </button>
                <button
                  onClick={async () => {
                    const v = prompt('대댓글 내용');
                    if (!v?.trim()) return;
                    try {
                      await replyToComment(c.id ?? c.idx, { content: v });
                      alert('대댓글을 등록했습니다.');
                    } catch (e: any) {
                      alert(e.message || '대댓글 작성 실패');
                    }
                  }}
                  className="flex items-center gap-1 rounded-md border px-2 py-1"
                  aria-label="답글"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" aria-hidden="true" />
                  <span>답글</span>
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('댓글을 삭제할까요?')) return;
                    try {
                      await deleteComment(c.id ?? c.idx);
                      setItems((prev) => prev.filter((x) => (x.id ?? x.idx) !== (c.id ?? c.idx)));
                    } catch (e: any) {
                      alert(e.message || '삭제 실패');
                    }
                  }}
                  className="flex items-center gap-1 rounded-md border px-2 py-1"
                  aria-label="삭제"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  <span>삭제</span>
                </button>
              </div>
            </div>
            <time
              className="text-right text-xs text-neutral-400"
              dateTime={new Date(c.createdAt ?? Date.now()).toISOString()}
            >
              {new Date(c.createdAt ?? c.creationDate ?? Date.now()).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
