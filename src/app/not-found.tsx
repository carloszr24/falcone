import Link from 'next/link'
import { HEADER_OFFSET_CLASS } from '@/lib/logo'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className={cn('min-h-screen flex items-center justify-center px-6', HEADER_OFFSET_CLASS)}>
      <div className="text-center">
        <p className="font-display text-8xl font-extrabold text-stone-200 mb-6">404</p>
        <h1 className="font-display text-3xl font-extrabold text-stone-900 mb-4">Página no encontrada</h1>
        <p className="text-stone-500 mb-10">La página que buscas no existe o ha sido movida. Puedes volver al inicio y explorar nuestras propiedades.</p>
        <Link href="/" className="btn-primary px-8 py-3 text-sm">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
