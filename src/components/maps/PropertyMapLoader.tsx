'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import type { PropertyMapPoint } from '@/lib/property-map'

const PropertyMap = dynamic(() => import('./PropertyMap.client'), {
  ssr: false,
  loading: () => <div className="skeleton h-[320px] w-full rounded-sm" />,
})

type Props = {
  points: PropertyMapPoint[]
  className?: string
  title?: string
}

export function PropertyMapSection({ points, className, title = 'Mapa' }: Props) {
  if (points.length === 0) return null

  return (
    <section className={cn('space-y-5', className)}>
      <div className="border-b border-stone-200 pb-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-brand-burgundy font-light mb-2">Ubicación</p>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-stone-900">{title}</h2>
        <p className="mt-2 text-sm font-light text-stone-500">
          {points.length === 1
            ? 'Consulte la ubicación exacta de la propiedad'
            : `${points.length} propiedades disponibles en el mapa`}
        </p>
      </div>
      <PropertyMap points={points} className="h-[300px] md:h-[400px]" />
    </section>
  )
}

export { PropertyMap }
