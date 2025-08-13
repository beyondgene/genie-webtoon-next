// app/(member)/my/bookmarks/loading.tsx
'use client';
import EmptyState from '@/components/feedback/EmptyState';
export default function Loading() {
  return <EmptyState variant="loading" title="북마크 불러오는 중" />;
}
