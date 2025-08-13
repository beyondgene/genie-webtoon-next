// 모바일 퍼스트 프리패치 + 리셋 API
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseInfiniteScrollOptions {
  /** 교차 임계값 (기본 0.25) */
  threshold?: number;
  /** 옵저버 루트 (기본: viewport) */
  root?: Element | null;
  /** 루트 마진 */
  rootMargin?: string;
  /** 추가 로딩 중인지 외부에서 제어할 때 */
  loading?: boolean;
  /** 더 불러올 항목이 남아있는지 */
  hasMore?: boolean;
  /** 한 번 트리거 후 특정 ms 동안 무시 (기본 350ms) */
  throttleMs?: number;
  /** 관찰 시작/중지 플래그 */
  disabled?: boolean;
}

// “반응형 UX”와 “긴 리스트 최적화”를 고려해, 화면 하단 근접 시점에 미리 페이지 로딩이 일어나도록 기본 rootMargin을 설정하고, 호출 쓰로틀 리셋을 노출
export function useInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  {
    threshold = 0.25,
    root = null,
    rootMargin,
    loading,
    hasMore = true,
    throttleMs = 350,
    disabled = false,
  }: UseInfiniteScrollOptions = {}
) {
  // 모바일에서 조기 프리패치: 기본 rootMargin 지정
  if (!rootMargin) rootMargin = '15% 0px';

  const [isIntersecting, setIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastCallRef = useRef(0);

  const cleanup = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const observe = useCallback(
    (node: HTMLDivElement | null) => {
      sentinelRef.current = node;
      cleanup();
      if (!node || disabled) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setIntersecting(entry.isIntersecting);
          const now = Date.now();
          if (
            entry.isIntersecting &&
            !loading &&
            hasMore &&
            now - lastCallRef.current > throttleMs
          ) {
            lastCallRef.current = now;
            void onLoadMore();
          }
        },
        { threshold, root, rootMargin }
      );
      observerRef.current.observe(node);
    },
    [cleanup, disabled, hasMore, loading, onLoadMore, root, rootMargin, threshold, throttleMs]
  );

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    /** 이 ref를 “sentinel” div에 달면 됩니다. */
    setRef: observe,
    isIntersecting,
    /** 외부에서 쓰로틀/상태를 재활용할 때 */
    reset: () => {
      lastCallRef.current = 0;
    },
  };
}
