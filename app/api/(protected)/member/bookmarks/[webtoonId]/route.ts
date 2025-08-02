import { NextRequest, NextResponse } from 'next/server'
import db from '@/models'
import { requireAuth } from '@/lib/middlewares/auth'

async function findSub(memberId: number, webtoonId: number) {
  return db.SUBSCRIPTION.findOne({ where: { memberId, webtoonId } })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { webtoonId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number
  const webtoonId = parseInt(params.webtoonId, 10)

  try {
    const ex = await findSub(memberId, webtoonId)
    if (ex) {
      if (ex.status === 'INACTIVE') {
        // 재구독: status만 ACTIVE로
        ex.status = 'ACTIVE'
        ex.alarm_on = false
        await ex.save()
        return NextResponse.json(
          { message: '구독이 복구되었습니다.', alarmOn: ex.alarm_on },
          { status: 200 }
        )
      }
      return NextResponse.json(
        { message: '이미 구독 중인 웹툰입니다.', alarmOn: ex.alarm_on },
        { status: 200 }
      )
    }

    const sub = await db.SUBSCRIPTION.create({
      memberId,
      webtoonId,
      alarm_on: false,
      status: 'ACTIVE',
    })
    return NextResponse.json(
      { message: '구독이 추가되었습니다.', alarmOn: sub.alarm_on },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { webtoonId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number
  const webtoonId = parseInt(params.webtoonId, 10)
  const { alarmOn } = (await req.json()) as { alarmOn: boolean }

  try {
    const sub = await findSub(memberId, webtoonId)
    if (!sub || sub.status === 'INACTIVE') {
      return NextResponse.json(
        { error: '구독 정보가 없거나 비활성 상태입니다.' },
        { status: 404 }
      )
    }
    sub.alarm_on = alarmOn
    await sub.save()
    return NextResponse.json(
      { message: '알림 설정이 변경되었습니다.', alarmOn: sub.alarm_on },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '알림 토글 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { webtoonId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number
  const webtoonId = parseInt(params.webtoonId, 10)

  try {
    const sub = await findSub(memberId, webtoonId)
    if (!sub || sub.status === 'INACTIVE') {
      return NextResponse.json(
        { message: '구독 정보가 없거나 이미 해제된 상태입니다.' },
        { status: 200 }
      )
    }
    // soft-delete: status→INACTIVE
    sub.status = 'INACTIVE'
    await sub.save()
    return NextResponse.json({ message: '구독이 해제되었습니다.' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 해제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

