import { NextResponse } from 'next/server'
import { getPropertyById } from '@/lib/properties-store'
import { renderStoryCard } from '@/lib/share-cards'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const property = await getPropertyById(params.id)
    if (!property) return new NextResponse('Not found', { status: 404 })

    const jpeg = await renderStoryCard(property)
    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(jpeg.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[api/story] error:', err)
    return new NextResponse('Error', { status: 500 })
  }
}
