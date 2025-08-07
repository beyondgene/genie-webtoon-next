import { NextRequest } from 'next/server';
import { getWebtoonList } from '@/controllers/webtoon/webtoonController';

export async function GET(req: NextRequest) {
  return getWebtoonList(req);
}
