import { Suspense } from 'react'
import { filterProperties, getPublicProperties } from '@/lib/properties-store'
import { listProvincesFromProperties } from '@/lib/property-location'
import { HEADER_OFFSET_CLASS } from '@/lib/logo'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertyFilters } from '@/components/properties/PropertyFilters'
import { PropertyMapSection } from '@/components/maps/PropertyMapLoader'
import { toPropertyMapPoints } from '@/lib/property-map'

export const dynamic = 'force-dynamic'

interface SearchParams {
  type?: string
  operation?: string
  status?: string
  minPrice?: string
  maxPrice?: string
  extra?: string
  extras?: string
  bedrooms?: string
  bathrooms?: string
  province?: string
}

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const allProperties = await getPublicProperties()
  const availableProvinces = listProvincesFromProperties(allProperties)
  const properties = filterProperties(allProperties, searchParams)
  const mapPoints = toPropertyMapPoints(properties)

  return (
    <div className={HEADER_OFFSET_CLASS}>
      <div className="bg-brand-burgundy text-white py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-brand-burgundy text-[10px] tracking-[0.22em] uppercase mb-4 font-light">Propiedades</p>
          <h1 className="font-display text-[26px] md:text-[40px] font-extrabold">Propiedades</h1>
          <p className="text-stone-400 mt-4 text-lg font-light">
            {properties.length} inmueble{properties.length !== 1 ? 's' : ''} disponible
            {properties.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="skeleton h-40 w-full" />}>
        <PropertyFilters availableProvinces={availableProvinces} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        {mapPoints.length > 0 && (
          <PropertyMapSection points={mapPoints} className="mb-14" title="Mapa de propiedades" />
        )}

        {properties.length === 0 ? (
          <div className="border border-dashed border-stone-200 py-32 text-center">
            <p className="mb-2 text-lg text-stone-400">Sin resultados</p>
            <p className="mb-6 text-sm text-stone-400">Prueba ajustando los filtros o explora todo el catálogo</p>
            <a href="/propiedades" className="btn-primary px-8 py-3 text-sm">
              Ver todas las propiedades
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
