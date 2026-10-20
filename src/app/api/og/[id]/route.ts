import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { getPropertyById } from '@/lib/properties-store'
import { parseImages } from '@/lib/utils'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://falconepropiedades.es').replace(/\/$/, '')
const DEFAULT_SOURCE = `${SITE_URL}/images/tarifa.png`

async function resolveSourceUrl(id: string): Promise<string> {
  if (id === 'default') return DEFAULT_SOURCE
  // Solo se usan imágenes de la propiedad guardada en BD, nunca una URL recibida por parámetro.
  const property = await getPropertyById(id)
  const first = property ? parseImages(property.images)[0] : undefined
  return first && /^https?:\/\//.test(first) ? first : DEFAULT_SOURCE
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const sourceUrl = await resolveSourceUrl(params.id)
    const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return new NextResponse('Not found', { status: 404 })

    const input = Buffer.from(await res.arrayBuffer())
    const jpeg = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer()

    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (err) {
    console.error('[api/og] error:', err)
    return new NextResponse('Error', { status: 500 })
  }
}
