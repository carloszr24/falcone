import 'server-only'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'FalconePropiedades/1.0 (https://falconepropiedades.es)'

/** Área Tarifa / costa de Cádiz — prioriza resultados cercanos sin limitar solo a esta zona */
const TARIFA_VIEWBOX = '-5.70,36.08,-5.50,35.95'

export type GeocodeResult = {
  latitude: number
  longitude: number
  displayName: string
}

export type GeocodeSuggestion = {
  id: string
  label: string
  subtitle: string
  latitude: number
  longitude: number
  displayName: string
}

type NominatimHit = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  type?: string
  class?: string
  address?: {
    road?: string
    house_number?: string
    pedestrian?: string
    neighbourhood?: string
    suburb?: string
    village?: string
    town?: string
    city?: string
    municipality?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
}

async function nominatimSearch(params: Record<string, string>): Promise<NominatimHit[]> {
  const url = new URL(NOMINATIM_URL)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
    next: { revalidate: 60 * 60 * 6 },
  })

  if (!response.ok) return []
  return (await response.json()) as NominatimHit[]
}

function localityFromAddress(address: NominatimHit['address']): string | null {
  if (!address) return null
  return (
    address.town ||
    address.city ||
    address.village ||
    address.municipality ||
    address.suburb ||
    address.neighbourhood ||
    null
  )
}

function streetFromAddress(address: NominatimHit['address']): string | null {
  if (!address) return null
  const base = address.road || address.pedestrian
  if (!base) return null
  return address.house_number ? `${base} ${address.house_number}` : base
}

function formatSuggestion(hit: NominatimHit): GeocodeSuggestion {
  const street = streetFromAddress(hit.address)
  const locality = localityFromAddress(hit.address)
  const province = hit.address?.state || hit.address?.county || null
  const postcode = hit.address?.postcode || null

  const label =
    street ||
    locality ||
    hit.display_name.split(',')[0]?.trim() ||
    hit.display_name

  const subtitleParts = [
    street && locality ? locality : null,
    province,
    postcode,
  ].filter(Boolean)

  const subtitle =
    subtitleParts.length > 0
      ? subtitleParts.join(' · ')
      : hit.display_name.split(',').slice(1, 3).join(',').trim()

  return {
    id: String(hit.place_id),
    label,
    subtitle: subtitle || hit.display_name,
    latitude: parseFloat(hit.lat),
    longitude: parseFloat(hit.lon),
    displayName: hit.display_name,
  }
}

export function buildGeocodeQuery(address: string, province?: string | null): string {
  const parts = [address.trim()]
  if (province?.trim()) parts.push(province.trim())
  parts.push('España')
  return parts.filter(Boolean).join(', ')
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim()
  if (trimmed.length < 5) return null

  const hits = await nominatimSearch({
    q: trimmed,
    format: 'json',
    limit: '1',
    countrycodes: 'es',
    addressdetails: '1',
    viewbox: TARIFA_VIEWBOX,
    bounded: '0',
  })

  const hit = hits[0]
  if (!hit) return null

  const latitude = parseFloat(hit.lat)
  const longitude = parseFloat(hit.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  return {
    latitude,
    longitude,
    displayName: hit.display_name,
  }
}

export async function searchAddressSuggestions(
  query: string,
  province?: string | null
): Promise<GeocodeSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const fullQuery = buildGeocodeQuery(trimmed, province)

  const hits = await nominatimSearch({
    q: fullQuery,
    format: 'json',
    limit: '8',
    countrycodes: 'es',
    addressdetails: '1',
    dedupe: '1',
    viewbox: TARIFA_VIEWBOX,
    bounded: '0',
  })

  const suggestions: GeocodeSuggestion[] = []
  const seen = new Set<string>()

  for (const hit of hits) {
    const latitude = parseFloat(hit.lat)
    const longitude = parseFloat(hit.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

    const suggestion = formatSuggestion(hit)
    const key = `${suggestion.label}|${suggestion.subtitle}|${latitude.toFixed(5)}|${longitude.toFixed(5)}`
    if (seen.has(key)) continue
    seen.add(key)
    suggestions.push(suggestion)
  }

  return suggestions
}
