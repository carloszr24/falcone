'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HEADER_OFFSET_CLASS } from '@/lib/logo'
import { PropertyIntentSearch } from '@/components/properties/PropertyIntentSearch'
import { ValoracionGratuitaModal } from '@/components/home/ValoracionGratuitaModal'

export function VenderPageClient() {
  const [sellContext, setSellContext] = useState({ location: '', propertyType: '' })

  return (
    <div className={HEADER_OFFSET_CLASS}>
      <section className="border-b border-stone-200 bg-stone-50 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex items-center gap-2 text-xs font-light text-stone-400">
            <Link href="/" className="transition-colors hover:text-stone-600">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-stone-600">Deseo vender</span>
          </nav>
          <h1 className="font-display text-[26px] font-extrabold text-stone-900 md:text-[40px]">
            Venda con tranquilidad
          </h1>
          <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-stone-500">
            Cuéntenos dónde está la vivienda y qué tipo de inmueble es. Le orientamos sin compromiso.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10 md:py-20">
        <PropertyIntentSearch mode="sell" onSellContextChange={setSellContext} />
      </section>

      <section className="border-t border-stone-200 bg-brand-burgundy px-6 py-14 text-center md:px-10 md:py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-[20px] md:text-[22px] font-extrabold text-white">¿Listo para el siguiente paso?</h2>
          <p className="mt-4 text-sm font-light leading-relaxed text-stone-200/90">
            Solicite una valoración gratuita y le diremos cómo podemos ayudarle.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ValoracionGratuitaModal
              triggerLabel="Solicitar valoración gratuita"
              triggerClassName="btn-primary inline-flex min-h-[3rem] w-full sm:w-auto items-center justify-center border border-transparent bg-white px-8 py-3.5 text-xs uppercase tracking-[0.08em] text-brand-burgundy hover:bg-stone-50"
              seedForm={{
                location: sellContext.location,
                propertyType: sellContext.propertyType,
              }}
            />
            <Link
              href="/propiedades"
              className="inline-flex min-h-[3rem] w-full sm:w-auto items-center justify-center border border-white/70 px-8 py-3.5 font-display text-xs font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white/10"
            >
              Ver todas las propiedades
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
