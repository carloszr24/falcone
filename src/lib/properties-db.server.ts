import 'server-only'
import type { Property } from '@/types'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { normalizeExtraIds, syncLegacyExtraFields } from '@/lib/property-extras'

const TABLE = 'properties'

type PropertyRow = {
  id: string
  title: string
  price: number
  location: string
  address: string | null
  latitude: number | null
  longitude: number | null
  province: string | null
  type: string
  operation: string
  status: string
  description: string
  images: unknown
  fotocasa_url: string | null
  bedrooms: number | null
  bathrooms: number | null
  sq_meters: number | null
  availability: string | null
  hot_water: string | null
  heating: string | null
  condition: string | null
  property_age: string | null
  floor: string | null
  garage: string | null
  elevator: string | null
  furnished: string | null
  extras: unknown
  energy_rating: string | null
  energy_value: number | null
  emissions_rating: string | null
  emissions_value: number | null
  featured: boolean
  archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

function rowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    location: row.location,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    province: row.province,
    type: row.type,
    operation: row.operation,
    status: row.status,
    description: row.description,
    images: JSON.stringify(Array.isArray(row.images) ? row.images : []),
    fotocasaUrl: row.fotocasa_url,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqMeters: row.sq_meters != null ? Number(row.sq_meters) : null,
    availability: row.availability,
    hotWater: row.hot_water,
    heating: row.heating,
    condition: row.condition,
    propertyAge: row.property_age,
    floor: row.floor,
    garage: row.garage,
    elevator: row.elevator,
    furnished: row.furnished,
    extras: normalizeExtraIds(row.extras),
    energyRating: row.energy_rating,
    energyValue: row.energy_value != null ? Number(row.energy_value) : null,
    emissionsRating: row.emissions_rating,
    emissionsValue: row.emissions_value != null ? Number(row.emissions_value) : null,
    featured: row.featured,
    archived: row.archived,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function parseImagesToArray(images: string): string[] {
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return images.split('\n').map((s) => s.trim()).filter(Boolean)
  }
}

function propertyToRow(property: Property): Omit<PropertyRow, 'created_at' | 'updated_at'> & {
  created_at: string
  updated_at: string
} {
  return {
    id: property.id,
    title: property.title,
    price: property.price,
    location: property.location,
    address: property.address ?? null,
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    province: property.province ?? null,
    type: property.type,
    operation: property.operation || 'venta',
    status: property.status,
    description: property.description,
    images: parseImagesToArray(property.images),
    fotocasa_url: property.fotocasaUrl ?? null,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    sq_meters: property.sqMeters ?? null,
    availability: property.availability ?? null,
    hot_water: property.hotWater ?? null,
    heating: property.heating ?? null,
    condition: property.condition ?? null,
    property_age: property.propertyAge ?? null,
    floor: property.floor ?? null,
    garage: property.garage ?? null,
    elevator: property.elevator ?? null,
    furnished: property.furnished ?? null,
    extras: property.extras ?? [],
    energy_rating: property.energyRating ?? null,
    energy_value: property.energyValue ?? null,
    emissions_rating: property.emissionsRating ?? null,
    emissions_value: property.emissionsValue ?? null,
    featured: property.featured,
    archived: property.archived,
    sort_order: property.sortOrder,
    created_at: property.createdAt.toISOString(),
    updated_at: property.updatedAt.toISOString(),
  }
}

export async function listProperties(): Promise<Property[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Error al leer propiedades: ${error.message}`)
  return (data ?? []).map((row) => rowToProperty(row as PropertyRow))
}

export async function getPropertyRowById(id: string): Promise<Property | null> {
  const { data, error } = await getSupabaseAdmin().from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Error al leer propiedad: ${error.message}`)
  return data ? rowToProperty(data as PropertyRow) : null
}

export async function propertyIdExists(id: string): Promise<boolean> {
  const { count, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('id', id)
  if (error) throw new Error(`Error al comprobar propiedad: ${error.message}`)
  return (count ?? 0) > 0
}

export async function countProperties(): Promise<number> {
  const { count, error } = await getSupabaseAdmin().from(TABLE).select('id', { count: 'exact', head: true })
  if (error) throw new Error(`Error al contar propiedades: ${error.message}`)
  return count ?? 0
}

export async function insertProperty(property: Property): Promise<Property> {
  const { data, error } = await getSupabaseAdmin().from(TABLE).insert(propertyToRow(property)).select('*').single()
  if (error) throw new Error(`Error al crear propiedad: ${error.message}`)
  return rowToProperty(data as PropertyRow)
}

export async function updatePropertyRow(id: string, property: Property): Promise<Property> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update(propertyToRow(property))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`Error al actualizar propiedad: ${error.message}`)
  return rowToProperty(data as PropertyRow)
}

export async function deletePropertyRow(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from(TABLE).delete().eq('id', id)
  if (error) throw new Error(`Error al borrar propiedad: ${error.message}`)
}

export async function setPropertyArchived(id: string, archived: boolean): Promise<Property | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ archived, featured: archived ? false : undefined, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`Error al actualizar propiedad: ${error.message}`)
  return data ? rowToProperty(data as PropertyRow) : null
}

export async function reorderPropertyRows(ids: string[]): Promise<void> {
  const admin = getSupabaseAdmin()
  const now = new Date().toISOString()
  const results = await Promise.all(
    ids.map((id, index) =>
      admin.from(TABLE).update({ sort_order: index, updated_at: now }).eq('id', id)
    )
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(`Error al reordenar propiedades: ${failed.error.message}`)
}

export function slugifyPropertyId(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `propiedad-${Date.now()}`
}

export type PropertyInput = {
  title: string
  price: string | number
  location: string
  address?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  province?: string | null
  type: string
  operation?: string
  status?: string
  description: string
  images: string | string[]
  fotocasaUrl?: string | null
  bedrooms?: string | number | null
  bathrooms?: string | number | null
  sqMeters?: string | number | null
  availability?: string | null
  hotWater?: string | null
  heating?: string | null
  condition?: string | null
  propertyAge?: string | null
  floor?: string | null
  garage?: string | null
  elevator?: string | null
  furnished?: string | null
  extras?: string[] | null
  energyRating?: string | null
  energyValue?: string | number | null
  emissionsRating?: string | null
  emissionsValue?: string | number | null
  featured?: boolean
}

function parseCoordinate(value: string | number | null | undefined): number | null {
  if (value === undefined || value === null || value === '') return null
  const parsed = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

export function inputToProperty(input: PropertyInput, existing?: Property, defaultSortOrder = 0): Property {
  const imagesStr = Array.isArray(input.images) ? JSON.stringify(input.images) : String(input.images)
  const extras = normalizeExtraIds(input.extras ?? [])
  const legacyExtras = syncLegacyExtraFields(extras)
  const now = new Date()

  return {
    id: existing?.id ?? slugifyPropertyId(input.title),
    title: input.title,
    price: typeof input.price === 'number' ? input.price : parseFloat(String(input.price)),
    location: input.location,
    address: input.address?.trim() || null,
    latitude: parseCoordinate(input.latitude),
    longitude: parseCoordinate(input.longitude),
    province: input.province?.trim() || null,
    type: input.type,
    operation: input.operation || 'venta',
    status: input.status || 'disponible',
    description: input.description,
    images: imagesStr,
    fotocasaUrl: input.fotocasaUrl?.trim() || null,
    bedrooms:
      input.bedrooms !== undefined && input.bedrooms !== '' && input.bedrooms !== null
        ? parseInt(String(input.bedrooms), 10)
        : null,
    bathrooms:
      input.bathrooms !== undefined && input.bathrooms !== '' && input.bathrooms !== null
        ? parseInt(String(input.bathrooms), 10)
        : null,
    sqMeters:
      input.sqMeters !== undefined && input.sqMeters !== '' && input.sqMeters !== null
        ? parseFloat(String(input.sqMeters))
        : null,
    availability: input.availability || null,
    hotWater: input.hotWater || null,
    heating: input.heating?.trim() || (extras.includes('heating') ? 'Sí' : null),
    condition: input.condition || null,
    propertyAge: input.propertyAge || null,
    floor: input.floor || null,
    garage: input.garage || legacyExtras.garage,
    elevator: input.elevator || legacyExtras.elevator,
    furnished: input.furnished || legacyExtras.furnished,
    extras,
    energyRating: input.energyRating || null,
    energyValue:
      input.energyValue !== undefined && input.energyValue !== '' && input.energyValue !== null
        ? parseFloat(String(input.energyValue))
        : null,
    emissionsRating: input.emissionsRating || null,
    emissionsValue:
      input.emissionsValue !== undefined && input.emissionsValue !== '' && input.emissionsValue !== null
        ? parseFloat(String(input.emissionsValue))
        : null,
    featured: Boolean(input.featured),
    archived: existing?.archived ?? false,
    sortOrder: existing?.sortOrder ?? defaultSortOrder,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}
