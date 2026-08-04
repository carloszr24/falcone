'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { phoneHref } from '@/lib/contact'
import { HEADER_HEIGHT_CLASS } from '@/lib/logo'
import { cn } from '@/lib/utils'
import { ValoracionGratuitaModal } from '@/components/home/ValoracionGratuitaModal'
import { SiteLogo } from '@/components/SiteLogo'
import { SERVICE_ITEMS } from '@/data/services'

const links = [
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/sobre-nosotros', label: 'Servicios' },
  { href: '/contacto', label: 'Contacto' },
]

const navLinkClass =
  'inline-flex items-center leading-none text-xs font-light uppercase tracking-[0.16em] transition-colors duration-200'

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const closeTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  if (pathname.startsWith('/admin')) return null

  const cancelClose = () => {
    if (!closeTimer.current) return
    clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  const openServices = () => {
    cancelClose()
    setServicesOpen(true)
  }

  const closeServices = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setServicesOpen(false), 110)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/80 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto pl-5 pr-4 md:pl-12 md:pr-10">
        <div className={cn('flex w-full items-center', HEADER_HEIGHT_CLASS)}>
          <Link href="/" className="relative z-10 flex h-full shrink-0 items-center py-1">
            <SiteLogo priority />
          </Link>

          <div className="ml-auto hidden md:flex items-center gap-8 shrink-0 self-center">
            <nav className="flex items-center gap-8">
              {links.map((link) =>
                link.href === '/sobre-nosotros' ? (
                  <div
                    key={link.href}
                    className="relative inline-flex items-center"
                    onMouseEnter={openServices}
                    onMouseLeave={closeServices}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        navLinkClass,
                        'gap-1',
                        pathname === link.href || servicesOpen
                          ? 'text-stone-900'
                          : 'text-stone-500 hover:text-stone-900'
                      )}
                    >
                      {link.label}
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className={cn(
                          'h-3 w-3 shrink-0 transition-transform duration-200',
                          servicesOpen && 'rotate-180'
                        )}
                      >
                        <path
                          d="M5.5 7.5 10 12l4.5-4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                    <div
                      className={cn(
                        'absolute right-0 top-full z-[60] pt-3',
                        servicesOpen ? 'pointer-events-auto' : 'pointer-events-none'
                      )}
                      onMouseEnter={openServices}
                      onMouseLeave={closeServices}
                    >
                      <div
                        className={cn(
                          'w-[min(48rem,calc(100vw-2.5rem))] max-w-[calc(100vw-2.5rem)] rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xl transition-all duration-200',
                          servicesOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                        )}
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {SERVICE_ITEMS.map((service) => (
                            <Link
                              key={service.title}
                              href="/sobre-nosotros"
                              className="block rounded-lg border border-stone-200/80 bg-stone-50/40 p-4 transition-colors duration-150 hover:border-stone-300 hover:bg-white"
                            >
                              <p className="text-sm font-light text-stone-900">{service.title}</p>
                              <p className="mt-1.5 line-clamp-3 text-xs font-light leading-relaxed text-stone-500">
                                {service.desc}
                              </p>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-stone-100 pt-4 text-center">
                          <a
                            href={phoneHref}
                            className="inline-flex items-center justify-center gap-1 text-sm font-light text-brand-burgundy transition-colors hover:text-brand-burgundy-dark"
                          >
                            Llámenos y le ofreceremos la solución que busca →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      navLinkClass,
                      pathname === link.href
                        ? 'text-stone-900'
                        : 'text-stone-500 hover:text-stone-900'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            <ValoracionGratuitaModal
              triggerLabel="Valoración gratuita"
              triggerClassName="btn-primary inline-flex shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em]"
            />
          </div>

          <button
            className="ml-auto p-2 text-stone-600 transition-colors md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <div className="w-5 space-y-1.5">
              <span
                className={cn(
                  'block h-px bg-stone-900 transition-all duration-300',
                  open && 'translate-y-2 rotate-45'
                )}
              />
              <span
                className={cn(
                  'block h-px bg-stone-900 transition-all duration-300',
                  open && 'opacity-0'
                )}
              />
              <span
                className={cn(
                  'block h-px bg-stone-900 transition-all duration-300',
                  open && '-translate-y-2 -rotate-45'
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-stone-100 bg-white px-6 py-6 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-1 text-sm font-light text-stone-600 hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
          <ValoracionGratuitaModal
            triggerLabel="Valoración gratuita"
            triggerClassName="btn-primary mt-4 w-full text-center text-xs"
          />
        </div>
      )}
    </header>
  )
}
