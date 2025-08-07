import bcrypt from 'bcrypt';
import db from '@/models';

export async function getMemberProfile(memberId: number) {
  const member = await db.MEMBER.findByPk(memberId, {
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
export async function updateMemberProfile(memberId: number, data: Partial<any>) {
  await db.MEMBER.update(data, { where: { idx: memberId } });
  return getMemberProfile(memberId);
}
export async function verifyMemberPassword(memberId: number, plain: string) {
  const member: any = await db.MEMBER.findByPk(memberId);
  if (!member) return false;
  return bcrypt.compare(plain, member.password);
}
export async function deactivateMember(memberId: number) {
  return db.MEMBER.update({ status: 'INACTIVE' }, { where: { idx: memberId } });
}
