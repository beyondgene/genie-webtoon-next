export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { getGoldenBellQuestionSet } from '@/data/goldenBell/questions';
import { Subscription } from '@/models/subscription';

async function GETHandler(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rawId = params.webtoonId;
  const webtoonId = Number(rawId);
  if (!Number.isInteger(webtoonId)) {
    return NextResponse.json({ error: '유효하지 않은 작품입니다.' }, { status: 400 });
  }

  const questionSet = getGoldenBellQuestionSet(webtoonId);
  if (!questionSet) {
    return NextResponse.json({ error: '퀴즈가 준비되지 않은 작품입니다.' }, { status: 404 });
  }

  const subscription = await Subscription.findOne({
    where: { memberId: auth.id, webtoonId, status: 'ACTIVE' },
    attributes: ['idx'],
    raw: true,
  });

  if (!subscription) {
    return NextResponse.json({ error: '구독 후 이용해주세요.' }, { status: 403 });
  }

  return NextResponse.json(questionSet, { status: 200 });
}

export const GET = withErrorHandler(GETHandler);
