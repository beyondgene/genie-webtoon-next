import { NextRequest } from 'next/server';
import { getBookmarks } from '@/controllers/member/bookmarksController';

export async function GET(req: NextRequest) {
  return getBookmarks(req);
}
