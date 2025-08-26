'use client';

import { useEffect, useState, useCallback } from 'react';
import { toNumericId } from '@/lib/toNumericId';

type Props = {
  webtoon: { idx?: number; id?: number } | number | string;
};

export default function SubscribeControls({ webtoon }: Props) {
  const wid = toNumericId(webtoon);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<{ subscribed: boolean; alarmOn: boolean }>({
    subscribed: false,
    alarmOn: false,
  });

  // 잘못된 id면 아무 호출도 하지 않음
  useEffect(() => {
    if (!wid) return;
    (async () => {
      const res = await fetch(`/api/member/subscription/${encodeURIComponent(String(wid))}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as { subscribed: boolean; alarmOn: boolean };
        setState(data);
      }
    })();
  }, [wid]);

  const subscribe = useCallback(async () => {
    if (!wid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/member/bookmarks/${encodeURIComponent(String(wid))}`, {
        method: 'POST',
      });
      if (res.ok) setState((s) => ({ ...s, subscribed: true }));
    } finally {
      setLoading(false);
    }
  }, [wid]);

  const unsubscribe = useCallback(async () => {
    if (!wid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/member/bookmarks/${encodeURIComponent(String(wid))}`, {
        method: 'DELETE',
      });
      if (res.ok) setState({ subscribed: false, alarmOn: false });
    } finally {
      setLoading(false);
    }
  }, [wid]);

  const toggleAlarm = useCallback(async () => {
    if (!wid) return;
    const next = !state.alarmOn;
    setLoading(true);
    try {
      const res = await fetch(`/api/member/subscription/${encodeURIComponent(String(wid))}/alarm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarm_on: next, alarmOn: next }),
      });
      if (res.ok) setState((s) => ({ ...s, alarmOn: next }));
    } finally {
      setLoading(false);
    }
  }, [wid, state.alarmOn]);

  const btnCls =
    'inline-flex items-center justify-center h-9 px-3 rounded-[4px] text-sm font-semibold shadow-sm disabled:opacity-60 whitespace-nowrap';
  const btnStyle = {
    background: 'white',
    color: '#2148C0',
    boxShadow: '0px 2px 3px rgba(0,0,0,0.25)',
  } as const;

  return (
    // 더 촘촘하게: 고정 너비 제거, 래핑 허용
    <div className="flex items-center gap-2 flex-wrap">
      {/* 알림 토글 */}
      <button
        disabled={!wid || !state.subscribed || loading}
        onClick={toggleAlarm}
        className={btnCls}
        style={btnStyle}
        aria-label={state.alarmOn ? '알림 끄기' : '알림 켜기'}
      >
        {state.alarmOn ? '알림 끄기' : '알림 켜기'}
      </button>

      {/* 구독/해제 */}
      {state.subscribed ? (
        <button
          disabled={!wid || loading}
          onClick={unsubscribe}
          className={btnCls}
          style={btnStyle}
          aria-label="구독 해제"
        >
          구독 해제
        </button>
      ) : (
        <button
          disabled={!wid || loading}
          onClick={subscribe}
          className={btnCls}
          style={btnStyle}
          aria-label="구독"
        >
          구독
        </button>
      )}
    </div>
  );
}
