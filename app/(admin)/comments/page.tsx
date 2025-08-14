// app/(admin)/comments/page.tsx
import { listComments } from '@/services/admin/comments.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await listComments();

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">댓글 관리</h1>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[780px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">회원 ID</th>
              <th className="px-3 py-2 text-left">웹툰 ID</th>
              <th className="px-3 py-2 text-left">회차 ID</th>
              <th className="px-3 py-2 text-left">상태</th>
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
