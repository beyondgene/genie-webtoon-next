// app/(member)/my/loading.tsx
'use client';
import EmptyState from '@/components/feedback/EmptyState';
export default function Loading() {
  return <EmptyState variant="loading" title="마이페이지 불러오는 중" />;
}
