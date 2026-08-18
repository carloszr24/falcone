import Link from 'next/link'
import { getFeaturedPropertiesForHome } from '@/lib/properties-store'
import { HEADER_OFFSET_CLASS } from '@/lib/logo'
import { cn } from '@/lib/utils'
import { FeaturedPropertiesGrid } from '@/components/home/FeaturedPropertiesGrid'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { ScrollHint } from '@/components/home/ScrollHint'
import { HeroActions } from '@/components/home/HeroActions'

export const dynamic = 'force-dynamic'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
      <path d="M3 11.25 12 4l9 7.25" />
      <path d="M5.25 10.5V20h13.5v-9.5" />
      <path d="M9.75 20v-5.5h4.5V20" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3v18M5 7h14M7 7l-2 6h4l-2-6M17 7l-2 6h4l-2-6" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  )
}

export default async function HomePage() {
  const featured = await getFeaturedPropertiesForHome()

  return (
    <>
      <section className={cn('relative h-svh min-h-[32rem] flex flex-col items-center justify-center overflow-hidden pb-8 md:pb-10', HEADER_OFFSET_CLASS)}>
        <div className="absolute inset-0">
          <HeroCarousel />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-brand-burgundy-dark/30 to-stone-950/55" />
        </div>

        <div className="relative z-10 flex flex-1 w-full items-center justify-center px-4 min-[400px]:px-6 translate-y-4 md:translate-y-10">
          <div className="text-center max-w-4xl mx-auto w-full">
            <span
              className="inline-block mb-5 rounded-full border border-white/40 bg-brand-burgundy-dark/35 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 animate-fade-up"
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              Algeciras · Tarifa · Campo de Gibraltar
            </span>
            <h1
              className="font-sans font-extrabold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.35)] text-balance text-[clamp(28px,6vw,46px)] leading-[1.05] tracking-tight mb-6 animate-fade-up"
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              Tu patrimonio es importante,
              <span className="hidden md:inline"> </span>
              <br className="md:hidden" aria-hidden="true" />
              la manera de <span className="text-sand-100">venderlo</span> también
            </h1>
            <p
              className="text-stone-200/95 text-[16px] font-normal max-w-[min(100%,24rem)] sm:max-w-xl mx-auto mb-9 leading-relaxed text-pretty animate-fade-up"
              style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
            >
              Valoramos su vivienda con honestidad, y le acompañamos con una estrategia de venta clara, de principio a fin.
            </p>
            <HeroActions />
          </div>
        </div>

        <ScrollHint />
      </section>

      <section className="bg-brand-burgundy py-20 md:py-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-display text-[26px] text-white md:text-[40px] font-extrabold leading-snug">
              Todo lo que necesita para operar con confianza
            </h2>
            <p className="mt-4 text-sm text-stone-200/80 max-w-2xl mx-auto leading-relaxed font-light">
              Nuestra oficina se encuentra en Tarifa, Cádiz.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: HomeIcon,
                title: 'Compra y venta',
                desc: 'Acompañamiento completo durante toda la operación, de principio a fin.',
              },
              {
                icon: ScaleIcon,
                title: 'Asesoramiento jurídico',
                desc: 'Orientación en documentación, trámites y formalización con la máxima diligencia.',
              },
              {
                icon: ClipboardIcon,
                title: 'Gestión integral',
                desc: 'Coordinación del proceso inmobiliario hasta la firma en notaría.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg p-7 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white/90">
                  <item.icon />
                </span>
                <h3 className="mb-2 font-display text-[16px] md:text-[18px] font-extrabold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-stone-200/85 font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        {featured.length > 0 ? (
          <div className="space-y-7">
            <div className="relative min-h-10">
              <h2 className="font-display text-[26px] md:text-[40px] leading-tight text-center font-extrabold">
                Nuevas <span className="text-brand-burgundy">oportunidades</span>
              </h2>
              <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2">
                <Link href="/propiedades" className="btn-outline text-[10px] shrink-0">
                  Ver todas →
                </Link>
              </div>
            </div>
            <FeaturedPropertiesGrid properties={featured} />
            <div className="flex justify-end md:hidden">
              <Link href="/propiedades" className="btn-outline text-[10px] shrink-0">
                Ver todas →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-stone-400 font-light">
            <p>Próximamente añadiremos propiedades destacadas.</p>
          </div>
        )}
      </section>

      <section className="bg-gradient-to-r from-brand-burgundy-dark via-brand-burgundy to-brand-burgundy-light py-24 px-6 md:px-10 text-center">
        <div className="max-w-2xl mx-auto rounded-xl border border-white/20 bg-black/5 px-6 py-10 md:px-10 md:py-12 flex flex-col items-center text-center">
          <h2 className="mb-5 font-display text-[20px] md:text-[22px] font-extrabold leading-tight text-white text-center w-full">
            ¿Desea encontrar<br />su próximo hogar?
          </h2>
          <p className="mb-10 text-base font-light leading-relaxed text-stone-100/90 text-center w-full max-w-lg mx-auto">
            Cuéntenos qué necesita y prepararemos la estrategia más adecuada para usted.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contacto"
              className="inline-flex min-h-[3rem] items-center justify-center gap-1.5 rounded-sm border border-transparent bg-white px-10 py-3 text-xs font-light tracking-[0.06em] uppercase text-brand-burgundy hover:bg-stone-50 transition-colors duration-200"
            >
              Hable con nuestro equipo
            </Link>
            <Link
              href="/propiedades"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-sm border border-white/80 px-10 py-3 text-xs font-light tracking-[0.06em] uppercase text-white hover:bg-white hover:text-brand-burgundy transition-colors duration-200"
            >
              Ver propiedades
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
