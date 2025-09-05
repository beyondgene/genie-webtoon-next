import bcrypt from 'bcrypt';
import db from '@/models';
// db에서 멤버 테이블의 idx를 기반으로 아래 속성에 해당하는 정보들을 불러옴
export async function getMemberProfile(memberId: number) {
  const member = await db.Member.findByPk(memberId, {
    attributes: [
      'idx',
      'memberId',
      'nickname',
      'name',
      'age',
      'gender',
      'email',
      'phoneNumber',
      'address',
      'status',
      'createdAt',
      'updatedAt',
    ],
  });
  return member;
}
// 멤버 프로필을 업데이트 하는 함수(멤버 idx를 기반으로 여부 확인)
export async function updateMemberProfile(memberId: number, data: Partial<any>) {
  await db.Member.update(data, { where: { idx: memberId } });
  return getMemberProfile(memberId);
}
// 멤버 비밀번호를 변경하는 함수(멤버 idx를 기반으로 여부 확인)
export async function verifyMemberPassword(memberId: number, plain: string) {
  const member: any = await db.Member.findByPk(memberId);
  if (!member) return false;
  return bcrypt.compare(plain, member.memberPassword);
}
// 비활성화된 멤버를 업데이트 하는 함수(멤버 idx를 기반으로 여부 확인)
export async function deactivateMember(memberId: number) {
  return db.Member.update({ status: 'DELETED' }, { where: { idx: memberId } });
}
