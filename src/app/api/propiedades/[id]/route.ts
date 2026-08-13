import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { wouldExceedFeaturedHomeLimit } from '@/lib/property-constants'
import {
  deletePropertyRow,
  getPropertyRowById,
  inputToProperty,
  listProperties,
  updatePropertyRow,
} from '@/lib/properties-db.server'
import { getPropertyById } from '@/lib/properties-store'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id)
  if (!property) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json(property)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  let body: Parameters<typeof inputToProperty>[0]
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const existing = await getPropertyRowById(params.id)
  if (!existing) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  const property = inputToProperty(body, existing)
  property.id = params.id

  const current = await listProperties()
  if (wouldExceedFeaturedHomeLimit(current, { wantFeatured: property.featured, editingPropertyId: params.id })) {
    return NextResponse.json({ error: 'Máximo 3 propiedades destacadas en la home' }, { status: 400 })
  }

  const updated = await updatePropertyRow(params.id, property)
  revalidatePath('/')
  revalidatePath('/propiedades')
  revalidatePath(`/propiedades/${params.id}`)
  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const existing = await getPropertyRowById(params.id)
  if (!existing) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  await deletePropertyRow(params.id)
  revalidatePath('/')
  revalidatePath('/propiedades')
  revalidatePath(`/propiedades/${params.id}`)
  return NextResponse.json({ ok: true })
}
