import { NextRequest } from 'next/server';
import {
  subscribeBookmark,
  toggleBookmarkAlarm,
  unsubscribeBookmark,
} from '@/controllers/member/bookmarksController';
import { withErrorHandler } from '@/lib/middlewares/errorHandler';

async function POSTHandler(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  return subscribeBookmark(req, { params });
}

async function PATCHHandler(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  return toggleBookmarkAlarm(req, { params });
}

async function DELETEHandler(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  return unsubscribeBookmark(req, { params });
}
export const POST = withErrorHandler(POSTHandler);
export const PATCH = withErrorHandler(PATCHHandler);
export const DELETE = withErrorHandler(DELETEHandler);
