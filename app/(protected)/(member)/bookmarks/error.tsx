// app/(member)/my/bookmarks/error.tsx
//에러 발생시 에러 메세지와 함께 다시 시도 버튼을 출력
'use client';
import EmptyState from '@/components/feedback/EmptyState';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState variant="error" title="구독작품 로드 실패" description={error.message}>
      <button
        onClick={reset}
        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        다시 시도
      </button>
    </EmptyState>
  );
}
