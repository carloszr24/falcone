import { NextResponse } from 'next/server'
import { getPropertyById } from '@/lib/properties-store'
import { renderDefaultCard, renderPropertyCard, renderValuationCard } from '@/lib/share-cards'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jpeg(body: Buffer, cacheControl: string) {
  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': 'image/jpeg',
      // Content-Length explícito: algunos rastreadores (WhatsApp) llevan mal las respuestas en chunked.
      'Content-Length': String(body.length),
      'Cache-Control': cacheControl,
    },
  })
}

// Una propiedad editada debe verse bien pronto; las tarjetas fijas pueden cachearse más.
const CACHE_PROPERTY = 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400'
const CACHE_STATIC = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (params.id === 'valoracion') return jpeg(await renderValuationCard(), CACHE_STATIC)
    if (params.id === 'default') return jpeg(await renderDefaultCard(), CACHE_STATIC)

    const property = await getPropertyById(params.id)
    if (!property) return new NextResponse('Not found', { status: 404 })
    return jpeg(await renderPropertyCard(property), CACHE_PROPERTY)
  } catch (err) {
    console.error('[api/og] error:', err)
    // Mejor una imagen genérica que ninguna vista previa; sin caché para reintentar enseguida.
    try {
      return jpeg(await renderDefaultCard(), 'no-store')
    } catch {
      return new NextResponse('Error', { status: 500 })
    }
  }
}
