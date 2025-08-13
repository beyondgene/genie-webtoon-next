// app/(member)/my/interests/loading.tsx
'use client';
import EmptyState from '@/components/feedback/EmptyState';
export default function Loading() {
  return <EmptyState variant="loading" title="관심 작가 불러오는 중" />;
}
