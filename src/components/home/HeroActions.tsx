'use client'

import { ValoracionGratuitaModal } from '@/components/home/ValoracionGratuitaModal'

export function HeroActions() {
  return (
    <div
      className="flex w-full max-w-xl mx-auto justify-center animate-fade-up md:-translate-y-2"
      style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
    >
      <ValoracionGratuitaModal
        triggerLabel="¿Cuánto vale tu propiedad?"
        triggerClassName="btn-gold w-full sm:w-auto min-h-[3rem] md:min-h-[3.1rem] px-10 py-3.5 text-xs md:text-sm text-center border border-transparent box-border"
      />
    </div>
  )
}
