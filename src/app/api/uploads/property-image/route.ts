import { NextRequest, NextResponse } from 'next/server'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { optimizePropertyImage } from '@/lib/optimize-image'
import { getSupabaseAdmin, PROPERTY_IMAGES_BUCKET } from '@/lib/supabase-admin'

// Nota: Vercel limita el body de las funciones serverless a ~4.5MB, por eso este
// límite se queda por debajo de eso. Las imágenes ya llegan comprimidas desde el
// navegador (ver src/lib/client-image.ts), así que en la práctica no debería activarse.
const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length))
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const propertyId = request.nextUrl.searchParams.get('propertyId')?.trim()
  if (!propertyId) return badRequest('Falta propertyId')

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return badRequest('Falta file')
  if (!ALLOWED_TYPES.has(file.type)) return badRequest('Tipo no permitido (jpg/png/webp)')
  if (file.size > MAX_BYTES) return badRequest('La imagen supera 4MB')

  const originalBuffer = Buffer.from(await file.arrayBuffer())
  const optimized = await optimizePropertyImage(originalBuffer)

  const path = `${propertyId}/${Date.now()}.${optimized.ext}`
  const { error: uploadError } = await getSupabaseAdmin()
    .storage.from(PROPERTY_IMAGES_BUCKET)
    .upload(path, optimized.data, { contentType: optimized.contentType, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: `Error al subir imagen: ${uploadError.message}` }, { status: 500 })
  }

  const { data } = getSupabaseAdmin().storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path: data.publicUrl })
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  let body: { url?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (typeof body.url !== 'string' || !body.url) {
    return badRequest('Falta url')
  }

  const path = pathFromPublicUrl(body.url)
  if (!path) return badRequest('URL no reconocida')

  const { error } = await getSupabaseAdmin().storage.from(PROPERTY_IMAGES_BUCKET).remove([path])
  if (error) {
    return NextResponse.json({ error: `Error al borrar imagen: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
