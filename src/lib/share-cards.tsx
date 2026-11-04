import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { CONTACT } from '@/lib/contact'
import type { Property } from '@/types'
import { formatPrice, parseImages } from '@/lib/utils'

// Colores corporativos (tailwind.config.ts)
const BLUE = '#103f91'
const BLUE_DARK = '#0a2d6a'
const SAND = '#f7f4ef'

const FONT = 'Jakarta'

// Los ficheros se leen del disco del proyecto; next.config.js los incluye en el despliegue (outputFileTracingIncludes).
const readProjectFile = (relativePath: string) => readFile(path.join(process.cwd(), relativePath))

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 500 | 800; style: 'normal' }[]> | null = null
function loadFonts() {
  fontsPromise ??= Promise.all([
    readProjectFile('src/assets/fonts/PlusJakartaSans-Medium.ttf'),
    readProjectFile('src/assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  ]).then(([medium, bold]) => [
    { name: FONT, data: medium, weight: 500 as const, style: 'normal' as const },
    { name: FONT, data: bold, weight: 800 as const, style: 'normal' as const },
  ])
  return fontsPromise
}

/** Capa de texto/formas con fondo transparente (PNG); la foto y el logo se pegan con sharp. */
async function renderLayer(node: React.ReactElement, width: number, height: number): Promise<Buffer> {
  const res = new ImageResponse(node, { width, height, fonts: await loadFonts() })
  return Buffer.from(await res.arrayBuffer())
}

async function logo(width: number): Promise<Buffer> {
  return sharp(await readProjectFile('public/images/falcone.png')).resize({ width }).png().toBuffer()
}

async function stockPhoto(width: number, height: number): Promise<Buffer> {
  return sharp(await readProjectFile('public/images/tarifa.png')).resize(width, height, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer()
}

/** Foto principal de la propiedad recortada; si no hay o falla la descarga, foto de Tarifa. */
async function propertyPhoto(property: Property, width: number, height: number): Promise<Buffer> {
  const first = parseImages(property.images)[0]
  if (first && /^https?:\/\//.test(first)) {
    try {
      const res = await fetch(first, { signal: AbortSignal.timeout(8_000) })
      if (res.ok) {
        return await sharp(Buffer.from(await res.arrayBuffer()), { failOn: 'none' })
          .rotate()
          .resize(width, height, { fit: 'cover', position: 'centre' })
          .jpeg({ quality: 90 })
          .toBuffer()
      }
    } catch {
      // cae a la foto de Tarifa
    }
  }
  return stockPhoto(width, height)
}

/**
 * JPEG base (no progresivo): es el formato que mejor tragan las vistas previas de WhatsApp.
 * Se mantiene pequeño (WhatsApp descarta imágenes pesadas).
 */
async function toPreviewJpeg(image: sharp.Sharp, quality = 80): Promise<Buffer> {
  return image.flatten({ background: SAND }).jpeg({ quality, progressive: false, chromaSubsampling: '4:2:0' }).toBuffer()
}

function propertyFacts(property: Property): string[] {
  return [
    property.sqMeters ? `${property.sqMeters} m²` : null,
    property.bedrooms ? `${property.bedrooms} hab.` : null,
    property.bathrooms ? `${property.bathrooms} ${Number(property.bathrooms) === 1 ? 'baño' : 'baños'}` : null,
  ].filter(Boolean) as string[]
}

const ArrowIcon = ({ size = 26, stroke = '#fff' }: { size?: number; stroke?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

// ─── Genérica (portada y fallback) · 1200×630 ───────────────────────────────

export async function renderDefaultCard(): Promise<Buffer> {
  return toPreviewJpeg(sharp(await stockPhoto(1200, 630)), 66)
}

// ─── Valoración gratuita · 1200×630 ─────────────────────────────────────────

export async function renderValuationCard(): Promise<Buffer> {
  const W = 1200
  const H = 630

  const layer = await renderLayer(
    <div style={{ width: W, height: H, display: 'flex', position: 'relative', fontFamily: FONT }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          display: 'flex',
          background: 'linear-gradient(to right, rgba(10,45,106,0.95) 0%, rgba(10,45,106,0.84) 48%, rgba(10,45,106,0.1) 100%)',
        }}
      />
      <div style={{ position: 'absolute', left: 36, top: 32, display: 'flex', width: 230, height: 66, borderRadius: 14, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 64, top: 150, display: 'flex', flexDirection: 'column', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 92, fontWeight: 800, lineHeight: 1.02 }}>
          <div style={{ display: 'flex' }}>Valoración</div>
          <div style={{ display: 'flex' }}>gratuita</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22, fontSize: 38, fontWeight: 800, lineHeight: 1.18 }}>
          <div style={{ display: 'flex' }}>en Tarifa y el</div>
          <div style={{ display: 'flex' }}>Campo de Gibraltar</div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 14,
            marginTop: 30,
            padding: '15px 28px',
            borderRadius: 999,
            background: '#fff',
            color: BLUE,
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          <div style={{ display: 'flex' }}>¿Cuánto vale tu propiedad?</div>
          <ArrowIcon stroke={BLUE} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 36, display: 'flex', color: '#dbe5f7', fontSize: 24, fontWeight: 500 }}>
        Gratis y sin compromiso · falconepropiedades.es
      </div>
    </div>,
    W,
    H
  )

  return toPreviewJpeg(
    sharp(await stockPhoto(W, H)).composite([
      { input: layer, left: 0, top: 0 },
      { input: await logo(190), left: 56, top: 40 },
    ]),
    72
  )
}

// ─── Propiedad · 1200×630 ───────────────────────────────────────────────────

export async function renderPropertyCard(property: Property): Promise<Buffer> {
  const W = 1200
  const H = 630
  const facts = propertyFacts(property)

  const layer = await renderLayer(
    <div style={{ width: W, height: H, display: 'flex', position: 'relative', fontFamily: FONT }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: W,
          height: 300,
          display: 'flex',
          background: 'linear-gradient(to top, rgba(10,45,106,0.96) 0%, rgba(10,45,106,0.7) 55%, rgba(10,45,106,0) 100%)',
        }}
      />
      <div style={{ position: 'absolute', left: 36, top: 32, display: 'flex', width: 230, height: 66, borderRadius: 14, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 56, bottom: 44, right: 56, display: 'flex', flexDirection: 'column', color: '#fff' }}>
        <div style={{ display: 'flex', fontSize: 78, fontWeight: 800, lineHeight: 1 }}>{formatPrice(property.price, property.operation)}</div>
        <div style={{ display: 'flex', marginTop: 14, fontSize: 32, fontWeight: 800 }}>{property.location}</div>
        {facts.length > 0 && (
          <div style={{ display: 'flex', marginTop: 8, fontSize: 28, fontWeight: 500, color: '#dbe5f7' }}>{facts.join('  ·  ')}</div>
        )}
      </div>
    </div>,
    W,
    H
  )

  return toPreviewJpeg(
    sharp(await propertyPhoto(property, W, H)).composite([
      { input: layer, left: 0, top: 0 },
      { input: await logo(190), left: 56, top: 40 },
    ]),
    70
  )
}

// ─── Propiedad para estados de WhatsApp · 1080×1920 ─────────────────────────

export async function renderStoryCard(property: Property): Promise<Buffer> {
  const W = 1080
  const H = 1920
  const PHOTO_H = 1180
  const facts = propertyFacts(property)
  const title = property.title.length > 60 ? `${property.title.slice(0, 58)}…` : property.title

  const layer = await renderLayer(
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: FONT }}>
      <div style={{ position: 'absolute', left: 48, top: 48, display: 'flex', width: 276, height: 80, borderRadius: 18, background: '#fff' }} />
      <div style={{ display: 'flex', width: W, height: PHOTO_H }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px 48px', justifyContent: 'space-between', background: BLUE }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1 }}>{formatPrice(property.price, property.operation)}</div>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, marginTop: 24, lineHeight: 1.15 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 500, color: '#dbe5f7', marginTop: 16 }}>{property.location}</div>
          {facts.length > 0 && (
            <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, marginTop: 28 }}>{facts.join('  ·  ')}</div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid rgba(255,255,255,0.35)', paddingTop: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 800, letterSpacing: 2 }}>FALCONE PROPIEDADES</div>
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: '#dbe5f7', marginTop: 6 }}>falconepropiedades.es</div>
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800 }}>{`+34 ${CONTACT.phone.display}`}</div>
        </div>
      </div>
    </div>,
    W,
    H
  )

  return toPreviewJpeg(
    sharp({ create: { width: W, height: H, channels: 3, background: BLUE } }).composite([
      { input: await propertyPhoto(property, W, PHOTO_H), left: 0, top: 0 },
      { input: layer, left: 0, top: 0 },
      { input: await logo(236), left: 68, top: 58 },
    ]),
    88
  )
}
