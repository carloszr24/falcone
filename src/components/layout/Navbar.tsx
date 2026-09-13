'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { HEADER_HEIGHT_CLASS } from '@/lib/logo'
import { cn } from '@/lib/utils'
import { ValoracionGratuitaModal } from '@/components/home/ValoracionGratuitaModal'
import { CalculadoraImpuestosModal } from '@/components/home/CalculadoraImpuestosModal'
import { SiteLogo } from '@/components/SiteLogo'

const links = [
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/sobre-nosotros', label: 'Servicios' },
  { href: '/contacto', label: 'Contacto' },
]

const navLinkClass =
  'inline-flex items-center leading-none text-[0.68rem] font-medium uppercase tracking-[0.12em] text-slate-600 transition-colors duration-200'

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname.startsWith('/admin')) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7 lg:px-10 xl:px-12">
        <div
          className={cn(
            'flex w-full items-center justify-between',
            HEADER_HEIGHT_CLASS
          )}
        >
          <Link href="/" className="relative z-10 inline-flex shrink-0 items-center py-1">
            <SiteLogo priority />
          </Link>

          <div className="ml-8 hidden shrink-0 items-center gap-6 self-center md:flex lg:ml-10 lg:gap-7">
            <nav className="flex items-center gap-6 lg:gap-7">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    navLinkClass,
                    pathname === link.href
                      ? 'text-slate-900'
                      : 'hover:text-slate-900'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <CalculadoraImpuestosModal
              triggerLabel="Calcula tus impuestos"
              triggerClassName="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-brand-burgundy px-5 font-display text-xs font-extrabold uppercase tracking-[0.1em] text-brand-burgundy transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-burgundy hover:text-white"
            />

            <ValoracionGratuitaModal
              triggerLabel="Valoración gratuita"
              triggerClassName="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-brand-burgundy px-5 font-display text-xs font-extrabold uppercase tracking-[0.1em] text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-burgundy-dark hover:shadow-lift"
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
          <CalculadoraImpuestosModal
            triggerLabel="Calcula tus impuestos"
            triggerClassName="btn-outline mt-4 w-full text-center text-xs"
          />
          <ValoracionGratuitaModal
            triggerLabel="Valoración gratuita"
            triggerClassName="btn-primary mt-3 w-full text-center text-xs"
          />
        </div>
      )}
    </header>
  )
}
