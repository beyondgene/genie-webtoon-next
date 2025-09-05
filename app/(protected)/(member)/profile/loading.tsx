// app/(member)/my/profile/loading.tsx
'use client';
// 프로필 로딩중에 발생하는 문구
import EmptyState from '@/components/feedback/EmptyState';
export default function Loading() {
  return <EmptyState variant="loading" title="프로필 불러오는 중" />;
}
