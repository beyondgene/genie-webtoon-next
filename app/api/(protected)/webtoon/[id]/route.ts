import { NextRequest } from 'next/server';
import { getWebtoonDetail } from '@/controllers/webtoon/webtoonController';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const webtoonId = parseInt(params.id, 10);
  return getWebtoonDetail(req, webtoonId);
}
