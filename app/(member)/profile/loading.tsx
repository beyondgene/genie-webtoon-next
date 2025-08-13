// app/(member)/my/profile/loading.tsx
'use client';
import EmptyState from '@/components/feedback/EmptyState';
export default function Loading() {
  return <EmptyState variant="loading" title="프로필 불러오는 중" />;
}
