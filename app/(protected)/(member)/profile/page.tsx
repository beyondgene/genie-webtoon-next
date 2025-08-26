// app/(protected)/(member)/profile/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions'; // 경로 다르면 프로젝트 기준으로 수정
import db from '@/models';
import ProfileForm from './ProfileFormClient';

export const dynamic = 'force-dynamic';

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const memberId = Number((session.user as any)?.idx ?? (session.user as any)?.id);
  if (!memberId) redirect('/login');

  // ✅ 서버에서 DB 직조회 (API 우회)
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

  return (
    <div className="page-on-gray">
      <section className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <h1 className="mb-4 text-xl font-semibold md:text-2xl">프로필</h1>
        <div className="rounded-2xl border border-white bg-[#929292] p-5 shadow-sm">
          <ProfileForm initial={me} />
        </div>
      </section>
    </div>
  );
}
