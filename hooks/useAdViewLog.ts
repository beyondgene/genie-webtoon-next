// *AD_VIEW_LOG(memberId, adId, viewed_at)**가 있으므로, 가능하면 세션에서 memberId(또는 user id)를 같이 보내고, 페이지 이탈 시 sendBeacon으로 유실을 줄입니다
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/fetcher';

/**
 * 광고 배너 노출/클릭 로깅 훅
 * - 현재 백엔드는 /api/(protected)/advertisement/[id]/view (POST)만 지원
 *   → 클릭도 동일 엔드포인트로 전송(서버가 추후 구분 지원 시 Body 확장 가능)
 * - 화면 50% 이상 1초 관찰 시 ‘view’ 1회 기록 (페이지당 1회)
 */
export function useAdViewLog(adId: number, opts?: { placement?: string }) {
  const viewedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timerRef = useRef<number | null>(null);

  const sendView = useCallback(
    async (extra?: Record<string, any>) => {
      try {
        await api.post(`/api/(protected)/advertisement/${adId}/view`, { ...(extra ?? {}) });
      } catch {
        // 무시 (네트워크 불안정 시 재시도는 다음 노출에서)
      }
    },
    [adId]
  );

  const bindImpression = useCallback(
    (el: HTMLElement | null) => {
      // 정리
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!el || viewedRef.current) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            // 1초 이상 노출되면 1회 기록
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(async () => {
              if (!viewedRef.current) {
                viewedRef.current = true;
                await sendView({ event: 'view', placement: opts?.placement });
              }
            }, 1000);
          } else if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        },
        { threshold: [0, 0.5, 1] }
      );
      observerRef.current.observe(el);
    },
    [sendView]
  );

  const onClick = useCallback(async () => {
    // 클릭도 동일 엔드포인트로 보내되, 중복 방지를 위해 최초 1회만
    if (!viewedRef.current) {
      viewedRef.current = true;
      await sendView({ event: 'click', placement: opts?.placement });
    }
  }, [sendView]);

  // 이탈 시 안전 전송 (유실 방지)
  useEffect(() => {
    const onHide = () => {
      if (!viewedRef.current && typeof navigator?.sendBeacon === 'function') {
        viewedRef.current = true;
        const body = JSON.stringify({ event: 'view', placement: opts?.placement });
        navigator.sendBeacon(`/api/(protected)/advertisement/${adId}/view`, body);
      }
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, [adId, opts?.placement]);

  return { bindImpression, onClick };
}
