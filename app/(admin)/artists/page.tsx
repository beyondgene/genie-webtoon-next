import { listArtists } from '@/services/admin/artists.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';
export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await listArtists();
  // 작가 정보에 이메일이 포함되어있는지 확인
  const byHasEmail = [
    { label: '이메일 有', value: items.filter((a) => !!a.artistEmail).length },
    { label: '이메일 無', value: items.filter((a) => !a.artistEmail).length },
  ];

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">작가 관리</h1>

      <SimpleBarChart title="이메일 등록 현황" unit="명" data={byHasEmail} />

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[780px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">필명</th>
              <th className="px-3 py-2 text-left">연락처</th>
              <th className="px-3 py-2 text-left">이메일</th>
              <th className="px-3 py-2 text-left">관리자</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.idx} className="border-t">
                <td className="px-3 py-2">{a.idx}</td>
                <td className="px-3 py-2">{a.artistName}</td>
                <td className="px-3 py-2">{a.artistPhone ?? '-'}</td>
                <td className="px-3 py-2">{a.artistEmail ?? '-'}</td>
                <td className="px-3 py-2">{a.adminId ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
