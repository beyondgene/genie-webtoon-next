// app/(protected)/(member)/profile/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions'; // 경로 다르면 프로젝트 기준으로 수정
import db from '@/models';
import BackNavigator from '@/components/ui/BackNavigator';
import ProfileForm from './ProfileFormClient';

export const dynamic = 'force-dynamic';
// 회원가입시 기입했던 정보와 비밀번호 수정 기능 로직ㄴ
export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const memberId = Number((session.user as any)?.idx ?? (session.user as any)?.id);
  if (!memberId) redirect('/login');

  // 서버에서 DB 직조회 (API 우회)
  const member = await db.Member.findByPk(memberId, {
    attributes: [
      'idx',
      'memberId',
      'nickname',
      'name',
      'age',
      'email',
      'phoneNumber',
      'address',
      'gender',
      'status',
    ],
    raw: true,
  });

  // 세션은 있지만 멤버 레코드가 없을 때의 안전 처리
  const me = member ?? {};
  // 맨위 div "page-on-gray" 프로필폼 위 클래스 929292가 기존
  return (
    <div className="min-h-[100svh] w-screen bg-[#4f4f4f]">
      <BackNavigator />
      <section className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <h1 className="mb-4 text-xl font-semibold md:text-2xl text-[#ffffff]">프로필</h1>
        <div className="rounded-2xl border border-white bg-[#4f4f4f] p-5 shadow-sm">
          <ProfileForm initial={me} />
        </div>
      </section>
    </div>
  );
}
