import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import {
  wouldExceedFeaturedHomeLimit,
} from '@/lib/property-constants'
import {
  countProperties,
  inputToProperty,
  insertProperty,
  listProperties,
  propertyIdExists,
  slugifyPropertyId,
} from '@/lib/properties-db.server'
import { getAllProperties } from '@/lib/properties-store'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export async function GET() {
  const properties = await getAllProperties()
  return NextResponse.json(properties)
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  let body: Parameters<typeof inputToProperty>[0]
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const id = slugifyPropertyId(body.title)
  if (await propertyIdExists(id)) {
    return NextResponse.json({ error: 'Ya existe una propiedad con un título similar' }, { status: 400 })
  }

  const current = await listProperties()
  const property = inputToProperty(body, undefined, await countProperties())
  property.id = id

  if (wouldExceedFeaturedHomeLimit(current, { wantFeatured: property.featured, editingPropertyId: null })) {
    return NextResponse.json({ error: `Máximo ${3} propiedades destacadas en la home` }, { status: 400 })
  }

  const created = await insertProperty(property)
  revalidatePath('/')
  revalidatePath('/propiedades')
  return NextResponse.json(created, { status: 201 })
}
