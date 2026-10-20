import type { Metadata } from 'next'
import { Fraunces, Manrope, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
})

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['700', '800'],
})

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
})

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://falconepropiedades.es').replace(/\/$/, '')
const SITE_TITLE = 'Falcone Propiedades | Inmobiliaria en Tarifa'
const SITE_DESCRIPTION =
  'Compra y venta de viviendas en Tarifa y Cádiz. Falcone Propiedades: trato cercano, asesoramiento claro y propiedades cerca del mar.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Falcone Propiedades',
    locale: 'es_ES',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: '/api/og/default', width: 1200, height: 630, alt: 'Falcone Propiedades' }],
  },
  twitter: { card: 'summary_large_image', images: ['/api/og/default'] },
  keywords:
    'falcone propiedades, inmobiliaria tarifa, comprar piso tarifa, venta vivienda cadiz, playa de los lances, agencia inmobiliaria tarifa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${sans.variable} ${heading.variable} ${display.variable}`}>
      <body className="bg-sand-50 text-ink antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
