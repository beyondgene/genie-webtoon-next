// app/(admin)/members/page.tsx
import { listMembers } from '@/services/admin/members.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await listMembers();

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">회원 관리</h1>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">아이디</th>
              <th className="px-3 py-2 text-left">닉네임</th>
              <th className="px-3 py-2 text-left">이메일</th>
              <th className="px-3 py-2 text-left">상태</th>
              <th className="px-3 py-2 text-left">가입일</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.idx} className="border-t">
                <td className="px-3 py-2">{m.idx}</td>
                <td className="px-3 py-2">{m.memberId}</td>
                <td className="px-3 py-2">{m.nickname}</td>
                <td className="px-3 py-2">{m.email ?? '-'}</td>
                <td className="px-3 py-2">{m.status}</td>
                <td className="px-3 py-2">{m.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
