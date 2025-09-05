import { listEpisodes } from '@/services/admin/episodes.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';
export const dynamic = 'force-dynamic';
// 관리자 페이지 에피소드 대쉬보드
export default async function Page() {
  const items = await listEpisodes();
  // 에피소드 불러오는 로직
  const byWebtoon = Object.entries(
    items.reduce<Record<string, number>>((acc, e) => {
      const key = String(e.webtoonId);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label: `웹툰#${label}`, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">회차 관리</h1>

      <SimpleBarChart title="웹툰별 회차 수 (Top 10)" unit="화" data={byWebtoon} />

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[820px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">제목</th>
              <th className="px-3 py-2 text-left">업로드일</th>
              <th className="px-3 py-2 text-left">웹툰</th>
              <th className="px-3 py-2 text-left">광고</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.idx} className="border-t">
                <td className="px-3 py-2">{e.idx}</td>
                <td className="px-3 py-2">{e.title}</td>
                <td className="px-3 py-2">{e.uploadDate?.slice(0, 10)}</td>
                <td className="px-3 py-2">{e.webtoonId}</td>
                <td className="px-3 py-2">{e.adId ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
