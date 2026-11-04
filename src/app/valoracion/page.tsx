import type { Metadata } from 'next'
import Link from 'next/link'
import { HEADER_OFFSET_CLASS } from '@/lib/logo'
import { cn } from '@/lib/utils'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { ValoracionGratuitaModal } from '@/components/home/ValoracionGratuitaModal'

const TITLE = 'Valoración gratuita en Tarifa y el Campo de Gibraltar | Falcone Propiedades'
const DESCRIPTION =
  'Descubre cuánto vale tu propiedad en Tarifa y el Campo de Gibraltar. Valoración gratuita y sin compromiso con Falcone Propiedades.'

const image = { url: '/api/og/valoracion', width: 1200, height: 630, alt: 'Valoración gratuita en Tarifa y el Campo de Gibraltar · Falcone Propiedades', type: 'image/jpeg' }

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/valoracion' },
  // Página solo para compartir por WhatsApp: fuera de Google (la vista previa de WhatsApp no depende de esto).
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'Falcone Propiedades',
    locale: 'es_ES',
    url: '/valoracion',
    title: TITLE,
    description: DESCRIPTION,
    images: [image],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [image.url] },
}

// Mismo fondo que la portada: el formulario se abre encima (autoOpen) y, al cerrarlo, queda el botón para reabrirlo.
export default function ValoracionPage() {
  return (
    <section className={cn('relative flex h-svh min-h-[32rem] flex-col items-center justify-center overflow-hidden', HEADER_OFFSET_CLASS)}>
      <div className="absolute inset-0">
        <HeroCarousel />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-brand-burgundy-dark/30 to-stone-950/55" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 text-center min-[400px]:px-6">
        <span className="mb-5 inline-block rounded-full border border-white/40 bg-brand-burgundy-dark/35 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
          Tarifa · Campo de Gibraltar
        </span>
        <h1 className="mb-6 text-balance font-display text-[clamp(28px,6vw,46px)] font-extrabold leading-[1.05] tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
          Valoración gratuita de tu vivienda en Tarifa y el Campo de Gibraltar
        </h1>
        <p className="mx-auto mb-9 max-w-xl text-pretty text-[16px] leading-relaxed text-stone-200/95">
          Cuéntanos sobre tu inmueble y te realizaremos una valoración completa, gratuita y sin compromiso.
        </p>
        <div className="mx-auto flex w-full max-w-xl justify-center">
          <ValoracionGratuitaModal
            autoOpen
            triggerLabel="¿Cuánto vale tu propiedad?"
            triggerClassName="btn-gold w-full sm:w-auto text-center border border-transparent box-border"
          />
        </div>
        <Link href="/propiedades" className="mt-8 inline-block text-sm text-white/80 transition-colors hover:text-white">
          Ver nuestras propiedades →
        </Link>
      </div>
    </section>
  )
}
