// app/(member)/my/profile/error.tsx
'use client';
// 로딩중 에러 발생시 에러문구와 함께 다시시도 버튼 제공
import EmptyState from '@/components/feedback/EmptyState';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState variant="error" title="프로필 로드 실패" description={error.message}>
      <button
        onClick={reset}
        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        다시 시도
      </button>
    </EmptyState>
  );
}
