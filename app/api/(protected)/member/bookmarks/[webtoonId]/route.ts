import { NextRequest } from 'next/server';
import {
  subscribeBookmark,
  toggleBookmarkAlarm,
  unsubscribeBookmark,
} from '@/controllers/member/bookmarksController';

export async function POST(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  return subscribeBookmark(req, { params });
}

export async function PATCH(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  return toggleBookmarkAlarm(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: { webtoonId: string } }) {
  return unsubscribeBookmark(req, { params });
}
