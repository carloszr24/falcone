import { ImageResponse } from 'next/og'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { CONTACT } from '@/lib/contact'
import { getPropertyById } from '@/lib/properties-store'
import { formatPrice, parseImages } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const W = 1080
const H = 1920
const PHOTO_H = 1180

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const property = await getPropertyById(params.id)
    if (!property) return new NextResponse('Not found', { status: 404 })

    // Foto principal recortada a la zona superior y pasada a JPEG (satori no lee webp).
    let photo: string | null = null
    const first = parseImages(property.images)[0]
    if (first && /^https?:\/\//.test(first)) {
      const res = await fetch(first, { signal: AbortSignal.timeout(10_000) })
      if (res.ok) {
        const jpeg = await sharp(Buffer.from(await res.arrayBuffer()), { failOn: 'none' })
          .rotate()
          .resize(W, PHOTO_H, { fit: 'cover', position: 'centre' })
          .jpeg({ quality: 85 })
          .toBuffer()
        photo = `data:image/jpeg;base64,${jpeg.toString('base64')}`
      }
    }

    const facts = [
      property.sqMeters ? `${property.sqMeters} m²` : null,
      property.bedrooms ? `${property.bedrooms} hab.` : null,
      property.bathrooms ? `${property.bathrooms} baños` : null,
    ].filter(Boolean) as string[]

    return new ImageResponse(
      (
        <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', background: '#1c1917', color: '#fff' }}>
          <div style={{ width: W, height: PHOTO_H, display: 'flex', background: '#44403c' }}>
            {photo && <img src={photo} width={W} height={PHOTO_H} style={{ objectFit: 'cover' }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px 48px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1 }}>
                {formatPrice(property.price, property.operation)}
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, marginTop: 24, lineHeight: 1.15 }}>
                {property.title.length > 60 ? `${property.title.slice(0, 58)}…` : property.title}
              </div>
              <div style={{ fontSize: 34, color: '#d6d3d1', marginTop: 16 }}>{property.location}</div>
              {facts.length > 0 && (
                <div style={{ fontSize: 36, color: '#fff', marginTop: 28, fontWeight: 700 }}>{facts.join('  ·  ')}</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #57534e', paddingTop: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 2 }}>FALCONE PROPIEDADES</div>
                <div style={{ fontSize: 28, color: '#d6d3d1', marginTop: 6 }}>falconepropiedades.es</div>
              </div>
              <div style={{ fontSize: 34, fontWeight: 700 }}>+34 {CONTACT.phone.display}</div>
            </div>
          </div>
        </div>
      ),
      { width: W, height: H }
    )
  } catch (err) {
    console.error('[api/story] error:', err)
    return new NextResponse('Error', { status: 500 })
  }
}
