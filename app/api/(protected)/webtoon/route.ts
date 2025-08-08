import { NextRequest } from 'next/server';
import { getWebtoonList } from '@/controllers/webtoon/webtoonController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function GETHandler(req: NextRequest) {
  return getWebtoonList(req);
}
export const GET = withErrorHandler(GETHandler);
