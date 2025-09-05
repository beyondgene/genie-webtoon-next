import { listComments } from '@/services/admin/comments.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';
export const dynamic = 'force-dynamic';
// 관리자 페이지 댓글 대쉬보드
export default async function Page() {
  const items = await listComments();
  // 좋아요수 많은 댓글
  const topLiked = items
    .map((c) => ({ label: `#${c.idx}`, value: c.likes ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  // 어떤 웹툰 에피소드에서 온건지 찾는 로직
  const byWebtoon = Object.entries(
    items.reduce<Record<string, number>>((acc, c) => {
      const key = String(c.webtoonId);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label: `웹툰#${label}`, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">댓글 관리</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <SimpleBarChart title="좋아요 Top 10 댓글" unit="개" data={topLiked} />
        <SimpleBarChart title="웹툰별 댓글 수 (Top 10)" unit="개" data={byWebtoon} />
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[780px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">회원</th>
              <th className="px-3 py-2 text-left">웹툰</th>
              <th className="px-3 py-2 text-left">회차</th>
              <th className="px-3 py-2 text-left">좋아요</th>
              <th className="px-3 py-2 text-left">작성일</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.idx} className="border-t">
                <td className="px-3 py-2">{c.idx}</td>
                <td className="px-3 py-2">{c.memberId}</td>
                <td className="px-3 py-2">{c.webtoonId}</td>
                <td className="px-3 py-2">{c.episodeId}</td>
                <td className="px-3 py-2">{c.likes}</td>
                <td className="px-3 py-2">{c.creationDate?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
