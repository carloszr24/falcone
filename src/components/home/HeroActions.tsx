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
        triggerClassName="btn-gold w-full sm:w-auto text-center border border-transparent box-border"
      />
    </div>
  )
}
