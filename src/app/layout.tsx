import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
})

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Falcone Propiedades | Inmobiliaria en Tarifa',
  description:
    'Compra y venta de viviendas en Tarifa y Cádiz. Falcone Propiedades: trato cercano, asesoramiento claro y propiedades cerca del mar.',
  keywords:
    'falcone propiedades, inmobiliaria tarifa, comprar piso tarifa, venta vivienda cadiz, playa de los lances, agencia inmobiliaria tarifa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-sand-50 text-ink antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
