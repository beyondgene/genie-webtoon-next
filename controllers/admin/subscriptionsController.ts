import db from '@/models';
// 구독 리스트 db에서 불러오기
export async function listSubscriptions() {
  return db.Subscription.findAll({
    attributes: ['idx', 'status', 'alarm_on', 'memberId', 'webtoonId', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });
}
