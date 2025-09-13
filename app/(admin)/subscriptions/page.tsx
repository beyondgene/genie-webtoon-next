// app/(admin)/subscriptions/page.tsx
import { listSubscriptions } from '@/services/admin/subscriptions.service';
import SimpleBarChart from '@/components/admin/SimpleBarChart';

// 짧은 ISR + 리전 고정으로 TTFB 절감
export const revalidate = 60; // 1분 캐시
export const runtime = 'nodejs';
export const preferredRegion = ['icn1', 'hnd1']; // Vercel 한국/일본

// 관리자 페이지 구독 대쉬보드
export default async function Page() {
  const items = await listSubscriptions();
  // 구독 상태 status 정보 db에서 갖고오는 로직
  const byStatus = Object.entries(
    items.reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  // 알람여부 확인
  const byAlarm = [
    { label: '알림 ON', value: items.filter((s) => s.alarm_on === 1).length },
    { label: '알림 OFF', value: items.filter((s) => s.alarm_on !== 1).length },
  ];

  return (
    <section className="max-w-screen-xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">구독 관리</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <SimpleBarChart title="구독 상태 분포" unit="건" data={byStatus} />
        <SimpleBarChart title="알림 설정 분포" unit="건" data={byAlarm} />
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">상태</th>
              <th className="px-3 py-2 text-left">알림</th>
              <th className="px-3 py-2 text-left">회원</th>
              <th className="px-3 py-2 text-left">웹툰</th>
              <th className="px-3 py-2 text-left">생성일</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.idx} className="border-t">
                <td className="px-3 py-2">{s.idx}</td>
                <td className="px-3 py-2">{s.status}</td>
                <td className="px-3 py-2">{s.alarm_on ? 'ON' : 'OFF'}</td>
                <td className="px-3 py-2">{s.memberId}</td>
                <td className="px-3 py-2">{s.webtoonId}</td>
                <td className="px-3 py-2">{s.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
