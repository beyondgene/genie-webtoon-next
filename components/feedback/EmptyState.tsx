'use client';

import * as React from 'react';

type Props = {
  title?: string;
  description?: string;
  /** 'empty' | 'error' | 'loading' */
  variant?: 'empty' | 'error' | 'loading';
  className?: string;
  children?: React.ReactNode;
};
// 빈 내용에 대한 반응 처리 컴포넌트
export default function EmptyState({
  title = '내용이 없습니다',
  description,
  variant = 'empty',
  className = '',
  children,
}: Props) {
  // 로딩중 처리 로직
  if (variant === 'loading') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-zinc-200" />
      </div>
    );
  }
  // 에러 발생시 처리 로직
  if (variant === 'error') {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-6 ${className}`}>
        <div className="text-base font-medium text-red-700">{title}</div>
        {description && <div className="mt-1 text-sm text-red-600">{description}</div>}
        {children}
      </div>
    );
  }
  // 그 이외 상황 처리 로직
  return (
    <div className={`rounded-2xl border border-dashed p-8 text-center ${className}`}>
      <div className="text-base font-medium text-zinc-800">{title}</div>
      {description && <div className="mt-1 text-sm text-zinc-500">{description}</div>}
      {children}
    </div>
  );
}
