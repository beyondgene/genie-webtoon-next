// (선호에 따라 Zustand 등)
// 간단 UI 전역 상태 (Zustand)
// 설치: yarn add zustand
import { create } from 'zustand';
const persistKey = 'ui.store.v1';

// 테마 타입 사전 정의
type Theme = 'light' | 'dark' | 'system';

// ui 상태 인터페이스 사전 정의
interface UIState {
  mobileNavOpen: boolean;
  theme: Theme;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  setTheme: (t: Theme) => void;
}

// ui store 호출 변수,함수
export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  theme: 'system',
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  setTheme: (t) => set({ theme: t }),
}));

// persist
if (typeof window !== 'undefined') {
  const saved = window.localStorage.getItem(persistKey);
  if (saved) {
    try {
      useUIStore.setState(JSON.parse(saved));
    } catch {}
  }
  useUIStore.subscribe((s) => window.localStorage.setItem(persistKey, JSON.stringify(s)));
  // 시스템 테마 추적
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.onchange = () => {
    const st = useUIStore.getState();
    if (st.theme === 'system') document.documentElement.classList.toggle('dark', mq.matches);
  };
}
