'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Propiedades' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/contactos', label: 'Contactos' },
  { href: '/admin/visitas', label: 'Visitas/llamadas' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="ml-6 flex flex-wrap items-center gap-1">
      {links.map((link) => {
        const active =
          link.href === '/admin' ? pathname === '/admin' : pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded px-3 py-1.5 text-xs transition-colors',
              active ? 'bg-white/10 text-white' : 'text-stone-400 hover:text-white'
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
