import type { MetadataRoute } from 'next'
import { getPublicProperties } from '@/lib/properties-store'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://falconepropiedades.es').replace(/\/$/, '')

const STATIC_ROUTES = [
  '',
  '/propiedades',
  '/comprar',
  '/vender',
  '/sobre-nosotros',
  '/contacto',
  '/aviso-legal',
  '/politica-privacidad',
  '/politica-cookies',
]

// Revalida en vez de quedar fijo para siempre en el build (las propiedades cambian).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Si Supabase falla o tarda (p.ej. en build), no debe tirar todo el despliegue abajo:
  // el sitemap sale sin las fichas de propiedad en vez de romper el build.
  let properties: Awaited<ReturnType<typeof getPublicProperties>> = []
  try {
    properties = await getPublicProperties()
  } catch (err) {
    console.error('[sitemap] No se pudieron leer las propiedades:', err)
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/propiedades' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route === '/propiedades' ? 0.9 : 0.5,
  }))

  const propertyEntries: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${SITE_URL}/propiedades/${property.id}`,
    lastModified: property.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticEntries, ...propertyEntries]
}
