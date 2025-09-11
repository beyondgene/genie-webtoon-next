export const runtime = 'nodejs';
// app/api/(protected)/member/bookmarks/route.ts
import { withErrorHandler } from '@/lib/middlewares/errorHandler';
import { getBookmarks } from '@/controllers/member/bookmarksController';

// 구독(=북마크) 목록 조회
export const GET = withErrorHandler(getBookmarks);
