import db from '@/models';

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

export interface MemberUpdateInput {
  nickname?: string;
  name?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phoneNumber?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export async function getMemberById(id: number) {
  const member = await db.Member.findByPk(id);
  if (!member) throw new Error('Not Found');
  return member;
}

export async function updateMember(id: number, data: MemberUpdateInput) {
  const member = await db.Member.findByPk(id);
  if (!member) throw new Error('Not Found');
  return await member.update(data);
}

export async function deleteMember(id: number) {
  const member = await db.Member.findByPk(id);
  if (!member) throw new Error('Not Found');
  await member.destroy();
}
