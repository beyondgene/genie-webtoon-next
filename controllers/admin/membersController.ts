import db from '@/models';
// 멤버 리스트 db로부터 불러오기
export async function listMembers() {
  return await db.Member.findAll({
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
}
// 프런트에서 멤버 정보 수정을 위한 속성 확장 인터페이스
export interface MemberUpdateInput {
  nickname?: string;
  name?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phoneNumber?: string;
  address?: string;
  status?: 'ACTIVE' | 'PENDING' | 'DELETED' | 'SUSPENDED';
}
// 멤버 idx로 정보 불러오기
export async function getMemberById(id: number) {
  const member = await db.Member.findByPk(id);
  if (!member) throw new Error('Not Found');
  return member;
}
// 멤버 정보 업데이트하기
export async function updateMember(id: number, data: MemberUpdateInput) {
  const member = await db.Member.findByPk(id);
  if (!member) throw new Error('Not Found');
  return await member.update(data);
}
// 멤버 삭제하기
export async function deleteMember(id: number) {
  const member = await db.Member.findByPk(id);
  if (!member) throw new Error('Not Found');
  await member.destroy();
}
