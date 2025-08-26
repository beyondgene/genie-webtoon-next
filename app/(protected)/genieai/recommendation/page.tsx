'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import Link from 'next/link';

type Mode = 'idle' | 'choose' | 'genre' | 'taste';
type GenreSlug =
  | 'DRAMA'
  | 'ROMANCE'
  | 'FANTASY'
  | 'ACTION'
  | 'LIFE'
  | 'GAG'
  | 'SPORTS'
  | 'THRILLER'
  | 'HISTORICAL';

const GENRES: GenreSlug[] = [
  'DRAMA',
  'ROMANCE',
  'FANTASY',
  'ACTION',
  'LIFE',
  'GAG',
  'SPORTS',
  'THRILLER',
  'HISTORICAL',
];

type WebtoonItem = {
  id: number | string;
  title: string;
  genre: string;
  views?: number;
  thumbnail?: string;
  description?: string;
};

const genreKo: Record<string, string> = {
  FANTASY: '판타지',
  ROMANCE: '로맨스',
  ACTION: '액션',
  DRAMA: '드라마',
  LIFE: '일상',
  GAG: '개그',
  SPORTS: '스포츠',
  THRILLER: '스릴러',
  HISTORICAL: '사극',
};

const detailUrlFor = (it: WebtoonItem) => `/webtoon/${it.id}`;

const makeAssistant = (text: string): UIMessage => ({
  id: crypto.randomUUID(),
  role: 'assistant',
  parts: [{ type: 'text', text }],
});
const makeUser = (text: string): UIMessage => ({
  id: crypto.randomUUID(),
  role: 'user',
  parts: [{ type: 'text', text }],
});
function getMessageText(m: UIMessage): string {
  const parts: any[] = (m as any)?.content ?? (m as any)?.parts ?? [];
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p: any) => (p?.type === 'text' ? p.text : typeof p === 'string' ? p : ''))
    .join(' ')
    .trim();
}
const truncate = (s = '', n = 120) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

const btnStyle: React.CSSProperties = {
  background: 'white',
  color: '#2148C0',
  boxShadow: '0px 4px 4px rgba(0,0,0,0.30)',
  borderRadius: 4,
};

export default function RecommendationChatPage() {
  const [mode, setMode] = useState<Mode>('idle');
  const [linkItems, setLinkItems] = useState<WebtoonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const currentGenreRef = useRef<GenreSlug | null>(null);

  const { messages, sendMessage, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/genieai/recommendation' }),
  });

  const sendUserText = (text: string) =>
    sendMessage({ role: 'user', parts: [{ type: 'text', text }] });

  useEffect(() => {
    setMode('choose');
    setMessages((prev) => [
      ...prev,
      makeAssistant(`안녕하세요! 어떤 방식으로 추천해드릴까요?

1) 장르로 추천받기
2) 내 취향에 맞는 웹툰 추천받기

아래 버튼을 눌러 선택해주세요.`),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickChoose = (choice: 'genre' | 'taste') => {
    setMode(choice);
    setLinkItems([]);
    setApiError(null);

    if (choice === 'genre') {
      setMessages((prev) => [
        ...prev,
        makeAssistant(`원하는 장르를 선택해주세요:
${GENRES.join(', ')}`),
      ]);
    } else {
      setMessages((prev) => [...prev, makeAssistant('구독 내역을 분석해 추천을 생성할게요.')]);
      void loadTasteRecommendations();
    }
  };

  async function fetchDescriptionById(id: number | string) {
    try {
      const r1 = await fetch(`/api/webtoon/${id}`, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (r1.ok) {
        const j = await r1.json();
        return (
          j?.description ?? j?.discription ?? j?.data?.description ?? j?.data?.discription ?? ''
        );
      }
    } catch {}

    try {
      const r2 = await fetch(`/api/webtoons/${id}`, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (r2.ok) {
        const j = await r2.json();
        return (
          j?.description ?? j?.discription ?? j?.data?.description ?? j?.data?.discription ?? ''
        );
      }
    } catch {}

    return '';
  }

  async function loadTasteRecommendations() {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch('/api/genieai/recommendation/for-me', {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) {
        setApiError('추천 목록을 불러오지 못했습니다.');
        setLoading(false);
        return;
      }

      const rows = await res.json();
      const baseItems: WebtoonItem[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: r.id ?? r.idx,
        title: r.title ?? r.webtoonName ?? '',
        genre: String(r.genre ?? '').toUpperCase(),
        views: r.views ? Number(r.views) : undefined,
        thumbnail: r.thumbnail ?? '',
        description: r.description ?? r.discription ?? '',
      }));

      const withDesc: WebtoonItem[] = await Promise.all(
        baseItems.map(async (it) => ({ ...it, description: await fetchDescriptionById(it.id) }))
      );

      const bullets = withDesc
        .map(
          (it, i) =>
            `${i + 1}. **${it.title}** — ${truncate(
              it.description || '상세 설명을 불러오지 못했습니다.'
            )}`
        )
        .join('\n');

      setMessages((prev) => [
        ...prev,
        makeAssistant('아래 작품들을 추천드려요 (구독 내역/장르/조회수 기반):'),
        makeAssistant(bullets),
      ]);

      setLinkItems(withDesc);
    } catch (e) {
      console.error('[client] for-me fetch error:', e);
      setApiError('네트워크 오류로 추천 목록을 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const onClickGenre = async (g: GenreSlug) => {
    setMode('genre');
    setApiError(null);
    setLinkItems([]);
    currentGenreRef.current = g;

    setMessages((prev) => [...prev, makeUser(`장르: ${genreKo[g] ?? g}`)]);

    setLoading(true);
    try {
      const res = await fetch(`/api/genieai/recommendation/list-by-genre?genre=${g}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        setApiError('추천 목록을 불러오지 못했습니다.');
        setLoading(false);
        return;
      }
      const rows = await res.json();

      const baseItems: WebtoonItem[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: r.id ?? r.idx,
        title: r.title ?? r.webtoonName ?? '',
        genre: String(r.genre ?? '').toUpperCase(),
        views: r.views ? Number(r.views) : undefined,
        thumbnail: r.thumbnail ?? '',
        description: r.description ?? r.discription ?? '',
      }));

      const withDesc: WebtoonItem[] = await Promise.all(
        baseItems.map(async (it) => ({ ...it, description: await fetchDescriptionById(it.id) }))
      );

      const bullets = withDesc
        .map(
          (it, i) =>
            `${i + 1}. **${it.title}** — ${truncate(
              it.description || '상세 설명을 불러오지 못했습니다.'
            )}`
        )
        .join('\n');

      setMessages((prev) => [
        ...prev,
        makeAssistant(
          `${genreKo[g] ?? g} 장르의 추천 웹툰을 소개합니다:\n\n${bullets}\n\n아래 ‘바로가기’에서 상세페이지로 이동해 보세요!`
        ),
      ]);

      setTimeout(() => {
        if (currentGenreRef.current === g) setLinkItems(withDesc);
        setLoading(false);
      }, 180);
    } catch (e) {
      console.error('[client] list-by-genre fetch error:', e);
      setApiError('네트워크 오류로 추천 목록을 가져오지 못했습니다.');
      setLoading(false);
    }
  };

  const GenreButtons = useMemo(
    () => (
      <div className="my-2 flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => onClickGenre(g)}
            className="px-4 py-2 uppercase font-semibold text-[16px] shadow-md"
            style={btnStyle}
          >
            {g}
          </button>
        ))}
      </div>
    ),
    []
  );

  return (
    <>
      {/* 전체 화면 배경(양옆 포함) */}
      <div className="fixed inset-0 bg-[#929292]" aria-hidden />
      <main className="relative z-10 mx-auto min-h-screen max-w-3xl p-4 text-white">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">지니AI · 작품 추천</h1>
          <Link
            href="/home"
            className="px-3 py-1.5 uppercase font-semibold text-[16px] shadow-md"
            style={btnStyle}
          >
            홈으로
          </Link>
        </header>

        {mode === 'choose' && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => onClickChoose('genre')}
              className="px-4 py-2 uppercase font-semibold text-[16px] shadow-md"
              style={btnStyle}
            >
              1) 장르로 추천받기
            </button>
            <button
              onClick={() => onClickChoose('taste')}
              className="px-4 py-2 uppercase font-semibold text-[16px] shadow-md"
              style={btnStyle}
            >
              2) 내 취향에 맞는 추천
            </button>
          </div>
        )}

        {mode === 'genre' && (
          <section className="mb-4">
            <p className="text-sm text-white/80">* 아래 장르 버튼 중 하나를 선택하세요.</p>
            {GenreButtons}
          </section>
        )}

        {/* 채팅 메시지 */}
        <ul className="space-y-3">
          {messages.map((m) => {
            const text = getMessageText(m);
            if (!text) return null;
            return (
              <li key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className="inline-block max-w-[90%] whitespace-pre-wrap rounded-2xl border border-white bg-transparent px-3 py-2 text-white shadow">
                  {text}
                </div>
              </li>
            );
          })}
        </ul>

        {/* 추천 링크 패널 */}
        <div className="mt-6">
          {loading && <div className="text-sm">추천 목록을 불러오는 중...</div>}
          {apiError && <div className="text-sm">{apiError}</div>}

          {linkItems.length > 0 && (
            <div className="rounded-2xl border border-white/70 bg-transparent p-4">
              <div className="text-sm font-semibold">추천 웹툰 바로가기</div>
              <ul className="mt-3 space-y-3">
                {linkItems.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-white/70 bg-transparent p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-base font-medium">{it.title}</div>
                      <div className="mt-0.5 text-sm text-white/80">
                        {(genreKo[it.genre] ?? it.genre) + ' · '} {truncate(it.description, 80)}
                      </div>
                    </div>
                    <Link
                      href={detailUrlFor(it)}
                      prefetch={false}
                      className="shrink-0 px-3 py-1.5 uppercase font-semibold text-[16px] shadow-md"
                      style={btnStyle}
                    >
                      바로가기
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={stop}
            className="px-3 py-2 uppercase font-semibold text-[16px] shadow-md"
            style={btnStyle}
          >
            정지
          </button>
        </div>
      </main>
    </>
  );
}
