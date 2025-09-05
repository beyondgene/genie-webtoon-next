import { NextRequest } from 'next/server';
import { getWebtoonList } from '@/controllers/webtoon/webtoonController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
//컨트롤러에 정의된 웹툰 리스트 갖고오는 라우터
async function GETHandler(req: NextRequest) {
  return getWebtoonList(req);
}
export const GET = withErrorHandler(GETHandler);
