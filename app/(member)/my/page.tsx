// app/(member)/my/page.tsx
// 버튼 허브 + 반응형 그리드 + 동적 메타.
import Link from 'next/link';
import { getProfile, getMySubscriptions, getMyInterests } from '@/services/member.service';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: '마이페이지 | Genie Webtoon' };
}

export default async function MyHomePage() {
  const [me, subs, interests] = await Promise.all([
    getProfile().catch(() => null),
    getMySubscriptions().catch(() => []),
    getMyInterests().catch(() => []),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl font-semibold md:text-3xl">
          마이페이지{me ? ` · ${me.nickname}` : ''}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">북마크, 관심 작가, 프로필을 관리하세요.</p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <li className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium">북마크</h2>
          <p className="mt-1 text-sm text-zinc-600">
            구독 중: <b>{subs.length}</b> 작품
          </p>
          <Link
            href="/my/bookmarks"
            className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            북마크 보기
          </Link>
        </li>

        <li className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium">관심 작가</h2>
          <p className="mt-1 text-sm text-zinc-600">
            등록: <b>{interests.length}</b> 명
          </p>
          <Link
            href="/my/interests"
            className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            관심 목록
          </Link>
        </li>

        <li className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium">프로필</h2>
          <p className="mt-1 text-sm text-zinc-600">내 정보 확인 및 수정</p>
          <Link
            href="/my/profile"
            className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            프로필 관리
          </Link>
        </li>
      </ul>
    </section>
  );
}
