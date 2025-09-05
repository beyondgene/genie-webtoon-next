'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

/** 타입 */
export type ToastType = 'info' | 'success' | 'error';

export type ToastOptions = {
  type?: ToastType;
  duration?: number;
  icon?: ReactNode;
};

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  icon?: ReactNode;
  duration?: number;
}

type Ctx = {
  push: (message: string, opts?: ToastOptions) => void;
  info: (m: string, d?: number) => void;
  success: (m: string, d?: number) => void;
  error: (m: string, d?: number) => void;
  dismiss: (id: string) => void;
};

/** 컨텍스트 */
const ToastContext = createContext<Ctx | null>(null);

/** Provider */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  // 옵션 타입을 변경 시키고 item(ToastItem타입)을 보내 toast 전송
  const push = useCallback(
    (message: string, opts?: ToastOptions) => {
      // ✅ 옵션 타입 교체
      const id = crypto.randomUUID?.() ?? String(Date.now());
      const item: ToastItem = {
        id,
        type: opts?.type ?? 'info',
        message,
        icon: opts?.icon, // ✅ 이제 오류 없음
        duration: opts?.duration ?? 3000,
      };
      setToasts((prev) => [...prev, item]);

      if (item.duration) {
        window.setTimeout(() => dismiss(id), item.duration);
      }
    },
    [dismiss]
  );
  // 현 상태에 callback을 통해 현 상태 타입을 담아 push로 반영
  const info = useCallback(
    (m: string, d?: number) => push(m, { type: 'info', duration: d }),
    [push]
  );
  const success = useCallback(
    (m: string, d?: number) => push(m, { type: 'success', duration: d }),
    [push]
  );
  const error = useCallback(
    (m: string, d?: number) => push(m, { type: 'error', duration: d }),
    [push]
  );

  return (
    <ToastContext.Provider value={{ push, info, success, error, dismiss }}>
      {children}
      {/* 렌더링부에서 아이콘 표시 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-md bg-neutral-700/85 text-white px-3 py-2 shadow-lg"
          >
            {t.icon && <div className="shrink-0">{t.icon}</div>}
            <div className="text-sm">{t.message}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="ms-auto opacity-70 hover:opacity-100"
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** 훅 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
