'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'info' | 'success' | 'error';
export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

type Ctx = {
  push: (message: string, opts?: { type?: ToastType; duration?: number }) => void;
  info: (m: string, d?: number) => void;
  success: (m: string, d?: number) => void;
  error: (m: string, d?: number) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, opts?: { type?: ToastType; duration?: number }) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const next: ToastItem = {
        id,
        type: opts?.type ?? 'info',
        message,
        duration: opts?.duration ?? 2500,
      };
      setToasts((prev) => [...prev, next]);
      window.setTimeout(() => dismiss(id), next.duration);
    },
    [dismiss]
  );

  const api = useMemo<Ctx>(
    () => ({
      push,
      info: (m, d) => push(m, { type: 'info', duration: d }),
      success: (m, d) => push(m, { type: 'success', duration: d }),
      error: (m, d) => push(m, { type: 'error', duration: d }),
      dismiss,
    }),
    [dismiss, push]
  );

  // 포털 대상
  React.useEffect(() => {
    const el =
      document.getElementById('toast-root') ||
      (() => {
        const n = document.createElement('div');
        n.id = 'toast-root';
        document.body.appendChild(n);
        return n;
      })();
    containerRef.current = el;
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {containerRef.current &&
        createPortal(
          // 반응형/안전영역: 상단 여백을 iOS 안전영역까지 고려.
          <div
            className="pointer-events-none fixed inset-x-0 z-[100] mx-auto
                 top-[calc(env(safe-area-inset-top,0px)+12px)]
                 flex w-full max-w-sm sm:max-w-md lg:max-w-lg flex-col gap-2 px-3"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                className={[
                  'pointer-events-auto rounded-xl px-4 py-3 text-sm shadow',
                  t.type === 'success' && 'bg-emerald-600 text-white',
                  t.type === 'error' && 'bg-rose-600 text-white',
                  t.type === 'info' && 'bg-zinc-900 text-white',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="status"
                aria-live="polite"
              >
                {t.message}
              </div>
            ))}
          </div>,
          containerRef.current
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
