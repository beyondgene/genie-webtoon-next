import { listMembers } from '@/services/admin/members.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';
export const dynamic = 'force-dynamic';
// 관리자 페이지 멤버 대쉬보드
export default async function Page() {
  const items = await listMembers();
  // 멤버 테이블의 status갖고 오는 로직
  const byStatus = Object.entries(
    items.reduce<Record<string, number>>((acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));
  // 멤버 테이블 나이대 갖고 오는 로직(나이를 나이대로 변환계산, band)
  const byAgeBand = Object.entries(
    items.reduce<Record<string, number>>((acc, m: any) => {
      const age = Number(m.age ?? 0);
      const band = isFinite(age) && age > 0 ? `${Math.floor(age / 10) * 10}대` : '기타';
      acc[band] = (acc[band] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">회원 관리</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <SimpleBarChart title="회원 상태 분포" unit="명" data={byStatus} />
        <SimpleBarChart title="연령대 분포" unit="명" data={byAgeBand} />
      </div>

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
