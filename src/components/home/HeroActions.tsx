'use client'

import { DeseoComprarModal } from '@/components/home/DeseoComprarModal'
import { ValoracionGratuitaModal } from '@/components/home/ValoracionGratuitaModal'
import type { PropertyMapPoint } from '@/lib/property-map'

type Props = {
  mapPoints: PropertyMapPoint[]
}

export function HeroActions({ mapPoints }: Props) {
  return (
    <div
      className="flex w-full max-w-xl mx-auto flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up md:-translate-y-2"
      style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
    >
      <DeseoComprarModal
        triggerLabel="Deseo comprar"
        mapPoints={mapPoints}
        triggerClassName="btn-gold w-full sm:flex-1 sm:min-w-0 min-h-[3rem] md:min-h-[3.1rem] px-8 py-3.5 text-xs md:text-sm text-center border border-transparent box-border"
      />
      <ValoracionGratuitaModal
        triggerLabel="Deseo vender"
        triggerClassName="inline-flex w-full sm:flex-1 sm:min-w-0 min-h-[3rem] md:min-h-[3.1rem] items-center justify-center rounded-full px-8 py-3.5 text-xs md:text-sm tracking-[0.04em] font-medium border border-white/80 text-white box-border backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-brand-burgundy hover:-translate-y-0.5 hover:shadow-soft"
      />
    </div>
  )
}
