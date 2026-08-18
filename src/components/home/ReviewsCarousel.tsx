'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { REVIEWS } from '@/data/reviews'

function StarRow() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Valoracion excelente">
      {Array.from({ length: 5 }).map((_, idx) => (
        <svg
          key={idx}
          viewBox="0 0 24 24"
          className={`h-5 w-5 text-gold`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.5l2.93 5.94 6.56.95-4.74 4.62 1.12 6.53L12 17.46 6.13 20.54l1.12-6.53L2.5 9.39l6.56-.95L12 2.5z" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsCarousel() {
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const rootRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const loopWidthRef = useRef(0)
  const pointerXRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const resumeTimerRef = useRef<number | null>(null)
  const loopedReviews = useMemo(() => [...REVIEWS, ...REVIEWS], [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMediaChange = () => setReducedMotion(media.matches)
    onMediaChange()
    media.addEventListener('change', onMediaChange)
    return () => media.removeEventListener('change', onMediaChange)
  }, [])

  useEffect(() => {
    if (!rootRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !trackRef.current) return
    loopWidthRef.current = trackRef.current.scrollWidth / 2
  }, [isVisible, loopedReviews])

  useEffect(() => {
    if (!isVisible || reducedMotion || !trackRef.current) return

    const speedPxPerSecond = 22
    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) lastFrameRef.current = timestamp
      const delta = timestamp - lastFrameRef.current
      lastFrameRef.current = timestamp

      if (!isPaused && !isDraggingRef.current && loopWidthRef.current > 0) {
        offsetRef.current += (speedPxPerSecond * delta) / 1000
        if (offsetRef.current >= loopWidthRef.current) {
          offsetRef.current -= loopWidthRef.current
        }
        trackRef.current!.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastFrameRef.current = null
    }
  }, [isVisible, reducedMotion, isPaused])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current)
    }
  }, [])

  const resumeAutoplay = () => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = window.setTimeout(() => setIsPaused(false), 1200)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerXRef.current = event.clientX
    isDraggingRef.current = true
    setIsPaused(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || pointerXRef.current === null || loopWidthRef.current <= 0) return
    const deltaX = event.clientX - pointerXRef.current
    pointerXRef.current = event.clientX
    offsetRef.current -= deltaX

    while (offsetRef.current < 0) offsetRef.current += loopWidthRef.current
    while (offsetRef.current >= loopWidthRef.current) offsetRef.current -= loopWidthRef.current

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
    }
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    pointerXRef.current = null
    resumeAutoplay()
  }

  return (
    <section ref={rootRef} className="bg-stone-50 py-20 md:py-24 px-6 md:px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div
          className={`mb-12 md:mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-3 sm:gap-0 sm:p-2">
            {[
              { value: '+200', label: 'propiedades vendidas' },
              { value: '< 30 días', label: 'tiempo medio de cierre' },
              { value: '4,8/5', label: 'en Google' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center rounded-xl px-6 py-5 text-center ${
                  idx !== 2 ? 'sm:border-r sm:border-stone-200' : ''
                }`}
              >
                <p className="font-display text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">{stat.value}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-stone-500 font-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`text-center max-w-3xl mx-auto mb-10 md:mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-brand-burgundy text-[10px] tracking-[0.22em] uppercase mb-3 font-light">Opiniones</p>
          <h2 className="section-title mb-5">Nuestra prioridad: el cliente</h2>
          <div className="flex flex-col items-center gap-2 text-stone-700">
            <StarRow />
            <p className="text-base md:text-lg font-light">Un servicio adaptado a las necesidades de cada cliente</p>
          </div>
        </div>

        <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div
            className="overflow-hidden select-none touch-pan-y"
            aria-label="Carrusel de reseñas de clientes"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              if (!isDraggingRef.current) resumeAutoplay()
            }}
          >
            <div ref={trackRef} className="flex items-stretch gap-4 md:gap-6 will-change-transform">
              {loopedReviews.map((review, idx) => (
                <div key={`${review.id}-${idx}`} className="shrink-0 w-[86vw] sm:w-[68vw] md:w-[44vw] lg:w-[31vw]">
                  <article className="card-hover h-full min-h-56 bg-white border border-stone-200 p-6 md:p-7 rounded-lg shadow-sm hover:shadow-lg">
                    <StarRow />
                    <p className="text-stone-600 text-sm md:text-base leading-relaxed mt-4 font-light">"{review.text}"</p>
                    <p className="mt-6 text-stone-900 font-light">{review.name}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
