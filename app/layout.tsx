// app/layout.tsx
// next/font + 스킵링크
import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { montserrat } from '@/styles/font';
import '@/styles/global.css';
import Footer from '@/components/layout/Footer';
import Providers from './providers';
import OverlayCleaner from '@/app/components/OverlayCleaner';
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

const noto = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});
// 메타데이터 기본 정보
export const metadata: Metadata = {
  title: 'Genie Webtoon',
  description: '웹툰 감상 · 장르 탐색 · 랭킹 · 마이페이지',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Genie Webtoon',
    description: '웹툰 감상 · 장르 탐색 · 랭킹 · 마이페이지',
    url: '/',
    siteName: 'Genie Webtoon',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Genie Webtoon',
    description: '웹툰 감상 · 장르 탐색 · 랭킹 · 마이페이지',
  },
};
// 기본 루트 레이아웃설정
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={noto.variable}>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
        <Providers>
          {/* 접근성: 스킵링크 */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded"
          >
            본문으로 건너뛰기
          </a>
          <main id="main" className="flex-1">
            <OverlayCleaner />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
