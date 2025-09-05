// app/(site)/layout.tsx — 사이트 공용(헤더/푸터 포함)
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// 사이트 길본 헤더와 푸터 설정(현재는 필요없어서 사용하지 않는중)
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
