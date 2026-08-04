import type { Metadata } from 'next'
import { AdminNav } from '@/components/admin/AdminNav'

export const metadata: Metadata = {
  title: 'Panel Admin | Falcone Propiedades',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand-50">
      <header className="bg-brand-burgundy text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-display text-lg font-medium">
            Falcone
            <span className="text-white/70 text-xs ml-2 font-sans font-medium tracking-[0.18em] uppercase">Admin</span>
          </span>
          <AdminNav />
        </div>
        <a href="/" className="text-xs text-white/70 hover:text-white transition-colors">
          ← Ver web
        </a>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  )
}
