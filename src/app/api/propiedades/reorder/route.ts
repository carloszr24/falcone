import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { listProperties, reorderPropertyRows } from '@/lib/properties-db.server'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  let body: { ids?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : []
  if (ids.length === 0) {
    return NextResponse.json({ error: 'Falta la lista de ids' }, { status: 400 })
  }

  const current = await listProperties()
  const validIds = ids.filter((id) => current.some((item) => item.id === id))

  await reorderPropertyRows(validIds)
  revalidatePath('/propiedades')
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
