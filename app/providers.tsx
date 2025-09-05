// app/providers.tsx
'use client';

import { ToastProvider } from '@/hooks/useToast';
import { SessionProvider } from 'next-auth/react';
// 세션과 닫기 버튼 제공
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
