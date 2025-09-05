// components/layout/Footer.tsx
import Link from 'next/link';
// 푸터 설정
export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Genie Webtoon</p>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">
              소개
            </Link>
            <Link href="/terms" className="hover:underline">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="hover:underline">
              문의
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
