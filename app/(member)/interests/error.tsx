// app/(member)/my/interests/error.tsx
'use client';
import EmptyState from '@/components/feedback/EmptyState';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState variant="error" title="관심 목록 로드 실패" description={error.message}>
      <button
        onClick={reset}
        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        다시 시도
      </button>
    </EmptyState>
  );
}
