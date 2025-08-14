// app/(admin)/advertisements/[id]/view-logs/page.tsx   ← 복수형(view-logs)에 맞춰 작성
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listAdViewLogs } from '@/services/admin/advertisements-view-logs.service';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const adId = Number(params.id);
  if (!Number.isFinite(adId)) notFound();

  const logs = await listAdViewLogs(adId);

  // 간단 통계
  const total = logs.length;
  const uniqueViewers = new Set(logs.map((l) => l.memberId ?? `guest-${l.idx}`)).size;

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">광고 View Logs</h1>
        <Link href="/advertisements" className="text-sm underline hover:opacity-80">
          ← 광고 목록으로
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-500">총 노출수</div>
          <div className="text-2xl font-semibold">{total.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-500">고유 시청자 수</div>
          <div className="text-2xl font-semibold">{uniqueViewers.toLocaleString()}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">회원 ID</th>
              <th className="px-3 py-2 text-left">Viewed At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.idx} className="border-t">
                <td className="px-3 py-2">{l.idx}</td>
                <td className="px-3 py-2">{l.memberId ?? '-'}</td>
                <td className="px-3 py-2">{l.viewedAt?.slice(0, 19).replace('T', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
