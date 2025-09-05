import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages, UIMessage, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 스트리밍 허용 시간 (초)
// 장르 타입 정의
const GENRES = [
  'DRAMA',
  'ROMANCE',
  'FANTASY',
  'ACTION',
  'LIFE',
  'GAG',
  'SPORTS',
  'THRILLER',
  'HISTORICAL',
] as const;
type Genre = (typeof GENRES)[number];

function extractTextFromMessage(m?: UIMessage) {
  if (!m) return '';
  const arr = (m as any).parts ?? (m as any).content ?? [];
  return arr
    .map((p: any) => (p?.type === 'text' ? p.text : ''))
    .join(' ')
    .trim();
}

// --- 장르 정규화 (대/소문자 + 한국어 동의어 허용)
const GENRE_MAP: Record<string, (typeof GENRES)[number]> = {
  DRAMA: 'DRAMA',
  ROMANCE: 'ROMANCE',
  FANTASY: 'FANTASY',
  ACTION: 'ACTION',
  LIFE: 'LIFE',
  SLICEOFLIFE: 'LIFE',
  SLICE_OF_LIFE: 'LIFE',
  GAG: 'GAG',
  COMEDY: 'GAG',
  SPORTS: 'SPORTS',
  SPORT: 'SPORTS',
  THRILLER: 'THRILLER',
  HISTORICAL: 'HISTORICAL',
  HISTORY: 'HISTORICAL',
  // 한글 동의어
  드라마: 'DRAMA',
  로맨스: 'ROMANCE',
  판타지: 'FANTASY',
  액션: 'ACTION',
  일상: 'LIFE',
  개그: 'GAG',
  스포츠: 'SPORTS',
  스릴러: 'THRILLER',
  사극: 'HISTORICAL',
};
// 장르 정규화
function normalizeGenre(input: string) {
  const key = (input ?? '').toString().trim().toUpperCase();
  return (
    GENRE_MAP[key] ?? (GENRES.includes(key as any) ? (key as (typeof GENRES)[number]) : undefined)
  );
}

// zod 파이프: 문자열 -> 정규화 -> enum 검증
const GenreInput = z.object({
  genre: z
    .string()
    .transform((s) => normalizeGenre(s) as (typeof GENRES)[number])
    .pipe(z.enum(GENRES)),
});

async function listByGenreTool({ genre }: { genre: (typeof GENRES)[number] }) {
  const items = await db.Webtoon.findAll({
    where: { genre },
    order: [['views', 'DESC']],
    attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl'],
    limit: 20,
  });
  return items.map((w: any, i: number) => ({
    rank: i + 1,
    id: w.idx,
    title: w.webtoonName,
    genre: w.genre,
    views: w.views,
    thumbnail: w.wbthumbnailUrl ?? null,
  }));
}

async function recommendByTasteTool({ memberId }: { memberId: number }) {
  const subs = await db.Subscription.findAll({
    where: { memberId, status: 'ACTIVE' },
    attributes: ['webtoonId'],
    include: [{ model: db.Webtoon, attributes: ['genre'], required: false }],
  });

  const subscribedIds = subs.map((s: any) => s.webtoonId);
  const likedGenres = Array.from(
    new Set(
      subs
        .map((s: any) => s.Webtoon?.genre)
        .filter((g: string | null | undefined): g is string => Boolean(g))
    )
  );

  if (likedGenres.length > 0) {
    const candidates = await db.Webtoon.findAll({
      where: {
        genre: { [Op.in]: likedGenres },
        ...(subscribedIds.length > 0 ? { idx: { [Op.notIn]: subscribedIds } } : {}),
      },
      order: [['views', 'DESC']],
      attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl', 'description'],
      limit: 10,
    });

    if (candidates.length > 0) {
      return candidates.map((w: any, i: number) => ({
        rank: i + 1,
        id: w.idx,
        title: w.webtoonName,
        genre: w.genre,
        views: w.views,
        thumbnail: w.wbthumbnailUrl ?? null,
        description: w.description,
        discription: w.description ?? '',
      }));
    }
  }

  // 구독이 없거나 동일장르 추천이 비어있다면 전체 Top 3
  const top = await db.Webtoon.findAll({
    order: [['views', 'DESC']],
    attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl', 'description'],
    limit: 3,
  });
  return top.map((w: any, i: number) => ({
    rank: i + 1,
    id: w.idx,
    title: w.webtoonName,
    genre: w.genre,
    views: w.views,
    thumbnail: w.wbthumbnailUrl ?? null,
    description: w.description,
    discription: w.description ?? '',
  }));
}
// ai 추천 컨트롤러 로직 호출하는 라우터
export async function POST(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof Response) return sessionOrRes;

  const body = await req.json().catch(() => ({}));
  const uiMessages = Array.isArray(body?.messages) ? body.messages : [];

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(uiMessages),

    // 툴 정의
    tools: {
      listByGenre: tool({
        description: '주어진 장르의 상위 웹툰을 반환한다',
        inputSchema: z.object({
          genre: z.enum([
            'DRAMA',
            'ROMANCE',
            'FANTASY',
            'ACTION',
            'LIFE',
            'GAG',
            'SPORTS',
            'THRILLER',
            'HISTORICAL',
          ]),
        }),
        // DB 조회
        execute: async ({ genre }: { genre: (typeof GENRES)[number] }) => {
          const rows = await db.Webtoon.findAll({
            where: { genre },
            order: [['views', 'DESC']],
            limit: 10,
            attributes: ['idx', 'webtoonName', 'genre', 'views', 'wbthumbnailUrl', 'description'],
          });
          return rows.map((r: any, i: number) => ({
            rank: i + 1,
            id: r.idx,
            title: r.webtoonName,
            genre: r.genre,
            views: r.views,
            thumbnail: r.wbthumbnailUrl ?? null,
            description: r.description,
            discription: r.description ?? '',
          }));
        },
      }),
    },

    // 핵심: 툴 호출 후 이어서 답변 생성까지 하도록 단계 2 이상 허용
    stopWhen: stepCountIs(2),
    // toolChoice: 'auto', // (기본값) 굳이 명시 안 해도 됨

    // 모델에게 확실히 지시
    system:
      '사용자가 장르를 고르면 listByGenre 도구를 호출하고, ' +
      '툴 결과를 근거로 사용자가 이해할 수 있는 assistant 메시지를 반드시 생성해라. ' +
      '툴 결과는 toolInvocations로도 포함시켜라.' +
      '썸네일 URL을 마크다운 링크로 출력하지 말고, 텍스트는 1~2문장으로만 간단히 안내해라.',
  });

  return result.toUIMessageStreamResponse(); // ✅ 반드시 이 형태
}
