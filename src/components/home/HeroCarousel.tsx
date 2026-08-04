'use client'

import Image from 'next/image'

export function HeroCarousel() {
  return (
    <div className="absolute inset-0 z-0">
      <Image
        src="/images/tarifa.png"
        alt="Vista de Tarifa"
        fill
        priority
        quality={80}
        sizes="100vw"
        className="object-cover brightness-[0.88] saturate-[0.95]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-burgundy-dark/45 via-ink/25 to-brand-accent/20"
        aria-hidden="true"
      />
    </div>
  )
}
