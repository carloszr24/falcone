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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getPublicProperties()

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
