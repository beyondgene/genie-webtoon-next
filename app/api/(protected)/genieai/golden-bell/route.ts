export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { GOLDEN_BELL_QUESTION_SET_META } from '@/data/goldenBell/questions';

async function GETHandler(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({ sets: GOLDEN_BELL_QUESTION_SET_META }, { status: 200 });
}

export const GET = withErrorHandler(GETHandler);
