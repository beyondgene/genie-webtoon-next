// app/(admin)/advertisements/[id]/view-logs/page.tsx
import { notFound } from 'next/navigation';
import { listAdViewLogs, AdViewLogItem } from '@/services/admin/advertisements-view-logs.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';

export const dynamic = 'force-dynamic';

// 혼재된 타임스탬프 키를 안전하게 꺼내기
function pickViewedAt(l: AdViewLogItem | any): string | null {
  return l.viewedAt ?? l.viewed_at ?? l.viewAt ?? l.createdAt ?? l.created_at ?? null;
}

// 화면 표시용(KST) 포맷
function toKSTString(ts?: string | null): string {
  if (!ts) return '-';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '-';
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000); // UTC → KST(+9)
  return kst.toISOString().slice(0, 19).replace('T', ' ');
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adId = Number(id);
  if (!Number.isFinite(adId)) notFound();

  const logs: AdViewLogItem[] = await listAdViewLogs(adId);

  // 시간대(0~23) 분포 (KST 기준)
  const byHour = Array.from({ length: 24 }, (_, h) => {
    const value = logs.reduce((acc: number, l: AdViewLogItem) => {
      const ts = pickViewedAt(l);
      if (!ts) return acc;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return acc;
      const hourKST = (d.getUTCHours() + 9) % 24;
      return acc + (hourKST === h ? 1 : 0);
    }, 0);
    return { label: `${String(h).padStart(2, '0')}시`, value }; // <- name/value 조합
  });

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">광고 노출 로그 #{adId}</h1>

      {/* 만약 SimpleBarChart가 xKey를 받는다면: <SimpleBarChart title="시간대별 노출 수" unit="회" data={byHour} xKey="name" yKey="value" /> */}
      <SimpleBarChart title="시간대별 노출 수" unit="회" data={byHour} />

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">회원</th>
              <th className="px-3 py-2 text-left">시각(KST)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l: AdViewLogItem) => (
              <tr key={l.idx} className="border-t">
                <td className="px-3 py-2">{l.idx}</td>
                <td className="px-3 py-2">{(l as any).memberId ?? (l as any).member_id ?? '-'}</td>
                <td className="px-3 py-2">{toKSTString(pickViewedAt(l))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
