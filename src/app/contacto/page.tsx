'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BUSINESS_HOURS,
  CONTACT,
  OFFICES,
  emailHref,
  hasEmail,
  mapsHref,
  phoneHref,
  whatsappDisplay,
  whatsappHref,
} from '@/lib/contact'

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.87 19.87 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.87 19.87 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.77.68 2.6a2 2 0 0 1-.45 2.11L8.1 9.91a16 16 0 0 0 6 6l1.48-1.24a2 2 0 0 1 2.11-.45c.83.33 1.7.56 2.6.68A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.nombre,
          email: form.email,
          phone: form.telefono || 'No facilitado',
          notes: form.mensaje,
          source: 'web_contacto',
          intent: 'comprar',
          priority: 'media',
        }),
      })
      if (!res.ok) {
        throw new Error('No se pudo enviar el mensaje')
      }
      setSent(true)
    } catch {
      setError('No se pudo enviar el formulario. Prueba de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-[5.5rem] md:pt-28">
      <div className="bg-brand-burgundy text-white py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-brand-burgundy text-[10px] tracking-[0.22em] uppercase mb-4 font-light">Contacto</p>
          <h1 className="font-display text-5xl md:text-6xl font-light">Estamos a su disposición</h1>
          <p className="text-stone-400 mt-4 text-lg font-light max-w-md">
            Escríbanos o llámenos. Le responderemos en menos de 24 horas.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 p-10 text-center">
                <span className="text-4xl mb-4 block">✓</span>
                <h3 className="font-medium text-emerald-800 text-lg mb-2">Mensaje enviado</h3>
                <p className="text-emerald-600 text-sm font-light">
                  Nos pondremos en contacto con usted en las próximas horas.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ nombre: '', email: '', telefono: '', mensaje: '' }) }}
                  className="mt-6 text-sm text-emerald-700 underline hover:no-underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-display text-3xl font-light text-stone-900 mb-8">Envíanos un mensaje</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-stone-500 tracking-wide block mb-2">Nombre *</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Su nombre"
                      className="w-full border border-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-brand-burgundy transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 tracking-wide block mb-2">Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="su@email.com"
                      className="w-full border border-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-brand-burgundy transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-500 tracking-wide block mb-2">Teléfono</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+34 600 000 000"
                    className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-500 tracking-wide block mb-2">Mensaje *</label>
                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Cuéntenos qué necesita..."
                    className="w-full border border-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-brand-burgundy transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
                {error && (
                  <p className="text-xs text-red-600 text-center">{error}</p>
                )}

                <p className="text-xs text-stone-400 text-center">
                  Al enviar aceptas nuestra{' '}
                  <Link href="/politica-privacidad" className="underline hover:text-stone-600">
                    política de privacidad
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-display text-3xl font-light text-stone-900 mb-8">Información</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="shrink-0 text-stone-500"><PhoneIcon /></span>
                  <div>
                    <p className="text-xs text-stone-400 tracking-wide mb-1">{CONTACT.phone.label}</p>
                    <a href={phoneHref} className="text-stone-700 text-sm font-light hover:text-stone-900 transition-colors">
                      {CONTACT.phone.display}
                    </a>
                  </div>
                </div>

                {hasEmail && (
                  <div className="flex gap-4">
                    <span className="shrink-0 text-stone-500"><MailIcon /></span>
                    <div>
                      <p className="text-xs text-stone-400 tracking-wide mb-1">Email</p>
                      <a href={emailHref} className="text-stone-700 text-sm hover:text-stone-900 transition-colors break-all">
                        {CONTACT.email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <span className="shrink-0 mt-0.5 text-[#25D366]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.02 0C5.42 0 .05 5.36.05 11.96c0 2.1.55 4.16 1.6 5.97L0 24l6.24-1.63a11.9 11.9 0 0 0 5.78 1.48h.01c6.6 0 11.97-5.36 11.97-11.96 0-3.2-1.25-6.22-3.48-8.41Zm-8.5 18.35h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.7.97.99-3.6-.23-.37a9.92 9.92 0 0 1-1.52-5.28c0-5.5 4.47-9.97 9.98-9.97 2.66 0 5.17 1.04 7.05 2.92a9.9 9.9 0 0 1 2.92 7.05c0 5.5-4.48 9.98-9.99 9.98Zm5.47-7.49c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.69.15-.2.3-.79.98-.96 1.18-.18.2-.35.23-.65.08-.3-.15-1.28-.47-2.43-1.49-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.14-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.69-1.66-.94-2.28-.25-.6-.5-.52-.69-.53l-.58-.01c-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.26 5.15 4.57.72.31 1.28.5 1.71.64.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.44.25-.7.25-1.3.18-1.44-.08-.13-.28-.2-.58-.35Z"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-stone-400 tracking-wide mb-1">WhatsApp</p>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-700 text-sm hover:text-stone-900 transition-colors"
                    >
                      {whatsappDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="shrink-0 text-stone-500"><MapPinIcon /></span>
                  <div>
                    <p className="text-xs text-stone-400 tracking-wide mb-1">{OFFICES.primary.label}</p>
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-700 text-sm font-light hover:text-stone-900 transition-colors"
                    >
                      {OFFICES.primary.line1}
                      <br />
                      {OFFICES.primary.line2}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="shrink-0 text-stone-500"><ClockIcon /></span>
                  <div>
                    <p className="text-xs text-stone-400 tracking-wide mb-2">{BUSINESS_HOURS.label}</p>
                    <ul className="space-y-1 text-sm font-light text-stone-700">
                      {BUSINESS_HOURS.schedule.map((row) => (
                        <li key={row.day} className="flex justify-between gap-6 min-w-[12rem]">
                          <span>{row.day}</span>
                          <span className={row.hours === 'Cerrado' ? 'text-stone-400' : ''}>{row.hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
