import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { requireAuth } from '@/lib/middlewares/auth'
import {
  getMemberProfile,
  updateMemberProfile,
  deactivateMember,
  verifyMemberPassword,
} from '@/controllers/member'

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

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number

  try {
    const profile = await getMemberProfile(memberId)
    // profile: { idx, memberId, nickname, name, age, gender, email, phoneNumber, address, status, createdAt, updatedAt }
    return NextResponse.json(profile)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number
  const body = (await req.json()) as UpdateBody

  try {
    // 비밀번호 변경 요청 시 검증 및 해싱
    if (body.currentPassword || body.newPassword) {
      if (!body.currentPassword || !body.newPassword) {
        return NextResponse.json(
          { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
          { status: 400 }
        )
      }
      const valid = await verifyMemberPassword(memberId, body.currentPassword)
      if (!valid) {
        return NextResponse.json(
          { error: '현재 비밀번호가 일치하지 않습니다.' },
          { status: 401 }
        )
      }
      body.newPassword = await bcrypt.hash(body.newPassword, 12)
    }

    const updated = await updateMemberProfile(memberId, body)
    // updated: 변경된 회원 객체({ idx, nickname,..., updatedAt })
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number

  // (보안) 탈퇴 전 비밀번호 확인
  const { currentPassword } = (await req.json()) as { currentPassword?: string }
  if (!currentPassword) {
    return NextResponse.json(
      { error: '탈퇴하려면 현재 비밀번호를 입력해주세요.' },
      { status: 400 }
    )
  }
  const valid = await verifyMemberPassword(memberId, currentPassword)
  if (!valid) {
    return NextResponse.json(
      { error: '현재 비밀번호가 일치하지 않습니다.' },
      { status: 401 }
    )
  }

  try {
    await deactivateMember(memberId)
    return NextResponse.json({ message: '회원 탈퇴 처리되었습니다.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
