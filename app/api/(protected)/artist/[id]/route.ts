import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middlewares/auth'
import db from '@/models'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const artist = await db.ARTIST.findByPk(params.id, {
    attributes: [
      'idx',
      'realName',
      'artistName',
      'artistPhone',
      'artistEmail',
      'webtoonList',
      'debutDate',
      'modifiedDate',
    ],
    raw: true,
  })

  if (!artist) {
    return NextResponse.json({ error: '작가를 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.json({ artist })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionOrRes = await requireAdmin(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes

  try {
    const artist = await db.ARTIST.findByPk(params.id)
    if (!artist) {
      return NextResponse.json({ error: '수정할 작가가 존재하지 않습니다.' }, { status: 404 })
    }

    const updates = await req.json()
    await artist.update({
      ...updates,
      modifiedDate: new Date(),
    })

    return NextResponse.json({ artist })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '작가 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionOrRes = await requireAdmin(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes

  try {
    const artist = await db.ARTIST.findByPk(params.id)
    if (!artist) {
      return NextResponse.json({ error: '삭제할 작가가 존재하지 않습니다.' }, { status: 404 })
    }

    await artist.destroy()
    return NextResponse.json({ message: '작가 삭제 완료' })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '작가 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
