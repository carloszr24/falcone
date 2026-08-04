import Link from 'next/link'
import { getPublicProperties } from '@/lib/properties-store'
import { toPropertyMapPoints } from '@/lib/property-map'
import { PropertyIntentSearch } from '@/components/properties/PropertyIntentSearch'

export const dynamic = 'force-dynamic'

export default async function ComprarPage() {
  const properties = await getPublicProperties()
  const mapPoints = toPropertyMapPoints(properties)

  return (
    <div className="pt-16 md:pt-[4.5rem]">
      <section className="border-b border-stone-200 bg-stone-50 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex items-center gap-2 text-xs font-light text-stone-400">
            <Link href="/" className="transition-colors hover:text-stone-600">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-stone-600">Deseo comprar</span>
          </nav>
          <h1 className="font-display text-4xl font-light text-stone-900 md:text-5xl">
            Encuentre su próximo hogar
          </h1>
          <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-stone-500">
            Indique dónde le gustaría vivir, el tipo de vivienda y explore las opciones disponibles en el mapa.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10 md:py-20">
        <PropertyIntentSearch mode="buy" mapPoints={mapPoints} />
      </section>
    </div>
  )
}
