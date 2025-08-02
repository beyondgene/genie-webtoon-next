import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { requireAuth } from '@/lib/middlewares/auth'
import { updateMemberProfile, verifyMemberPassword } from '@/controllers/member'

interface UpdateBody {
  nickname?: string
  name?: string
  age?: number
  gender?: 'MALE' | 'FEMALE'
  email?: string
  phoneNumber?: string
  address?: string
  currentPassword?: string
  newPassword?: string
}

export async function PATCH(req: NextRequest) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes

  const memberId = sessionOrRes.id as number
  const body = (await req.json()) as UpdateBody

  try {
    // 비밀번호 변경 요청이 있으면 먼저 검증
    if (body.currentPassword || body.newPassword) {
      if (!body.currentPassword || !body.newPassword) {
        return NextResponse.json(
          { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
          { status: 400 }
        )
      }
      // 기존 비밀번호 검증
      const isValid = await verifyMemberPassword(
        memberId,
        body.currentPassword
      )
      if (!isValid) {
        return NextResponse.json(
          { error: '현재 비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        )
      }
      // 새 비밀번호 해싱
      const hashed = await bcrypt.hash(body.newPassword, 12)
      body.newPassword = hashed as any
    }

    // 프로필/비밀번호 업데이트
    const updated = await updateMemberProfile(memberId, body)
    // updated: 변경된 회원 정보 객체
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '회원 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
