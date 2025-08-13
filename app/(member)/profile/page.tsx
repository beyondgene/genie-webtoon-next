// app/(member)/my/profile/page.tsx
import { getProfile } from '@/services/member.service';
import ProfileForm from './profile.form';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  return { title: '프로필 | 마이페이지' };
}

export default async function MyProfilePage() {
  const me = await getProfile();
  return (
    <section className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-semibold md:text-2xl">프로필</h1>
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <ProfileForm initial={me} />
      </div>
    </section>
  );
}
