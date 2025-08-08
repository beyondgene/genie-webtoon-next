import { NextRequest } from 'next/server';
import { getWebtoonDetail } from '@/controllers/webtoon/webtoonController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const webtoonId = parseInt(params.id, 10);
  return getWebtoonDetail(req, webtoonId);
}
export const GET = withErrorHandler(GETHandler);
