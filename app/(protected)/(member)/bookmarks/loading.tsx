// app/(member)/my/bookmarks/loading.tsx
'use client';
// 빈 정보에 대해서 에러메시지와 함께 로딩 화면 제공
import EmptyState from '@/components/feedback/EmptyState';
export default function Loading() {
  return <EmptyState variant="loading" title="북마크 불러오는 중" />;
}
