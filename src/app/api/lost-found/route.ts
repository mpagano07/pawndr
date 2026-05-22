import { getLostFoundFeed } from '@/app/lost-found/actions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '12')
  const type = searchParams.get('type') || undefined
  const species = searchParams.get('species') || undefined
  const city = searchParams.get('city') || undefined
  const status = searchParams.get('status') || 'active'

  try {
    const { pets, error } = await getLostFoundFeed(
      {
        type: type as any,
        species,
        city: city || undefined,
        status: status as any
      },
      page,
      pageSize
    )

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ pets })
  } catch (error) {
    console.error('[/api/lost-found Error]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
