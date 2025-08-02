import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middlewares/auth'
import db from '@/models'

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAdmin(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes

  try {
    const artists = await db.ARTIST.findAll({
      attributes: ['idx', 'artistName', 'realName', 'artistEmail', 'debutDate'],
      order: [['artistName', 'ASC']],
      raw: true,
    })

    return NextResponse.json({ artists })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '작가 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const sessionOrRes = await requireAdmin(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes

  try {
    const body = await req.json()
    const newArtist = await db.ARTIST.create({
      ...body,
      adminId: sessionOrRes.id,
      debutDate: body.debutDate ?? new Date(),
      modifiedDate: new Date(),
    })

    return NextResponse.json({ artist: newArtist }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '작가 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
