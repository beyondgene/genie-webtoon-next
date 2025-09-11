export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import {
  subscribeBookmark,
  toggleBookmarkAlarm,
  unsubscribeBookmark,
} from '@/controllers/member/bookmarksController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

// 멤버의 idx의 타당성 확인
function toValidId(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null; //유한 값인지를 확인
}

// 구독 생성/복구
async function POSTHandler(req: NextRequest, ctx: { params: Promise<{ webtoonId: string }> }) {
  const { webtoonId } = await ctx.params;
  const id = toValidId(webtoonId);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid webtoonId' }, { status: 400 });
  }
  // 컨트롤러는 string을 기대하므로 안전한 숫자 문자열로 전달
  return subscribeBookmark(req, { params: { webtoonId: String(id) } });
}

// 알림 토글
async function PATCHHandler(req: NextRequest, ctx: { params: Promise<{ webtoonId: string }> }) {
  const { webtoonId } = await ctx.params;
  const id = toValidId(webtoonId);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid webtoonId' }, { status: 400 });
  }
  return toggleBookmarkAlarm(req, { params: { webtoonId: String(id) } });
}

// 구독 해제
async function DELETEHandler(req: NextRequest, ctx: { params: Promise<{ webtoonId: string }> }) {
  const { webtoonId } = await ctx.params;
  const id = toValidId(webtoonId);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid webtoonId' }, { status: 400 });
  }
  return unsubscribeBookmark(req, { params: { webtoonId: String(id) } });
}

export const POST = withErrorHandler(POSTHandler);
export const PATCH = withErrorHandler(PATCHHandler);
export const DELETE = withErrorHandler(DELETEHandler);
