'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ValoracionForm = {
  propertyType: string
  location: string
  sqMeters: string
  bedrooms: string
  bathrooms: string
  condition: string
  saleTimeline: string
  notes: string
  name: string
  phone: string
  email: string
}

const initialForm: ValoracionForm = {
  propertyType: '',
  location: '',
  sqMeters: '',
  bedrooms: '',
  bathrooms: '',
  condition: '',
  saleTimeline: '',
  notes: '',
  name: '',
  phone: '',
  email: '',
}

const propertyTypeOptions = [
  'Piso',
  'Casa',
  'Ático',
  'Dúplex',
  'Chalet',
  'Local',
  'Garaje',
  'Terreno',
  'Otro',
]

const saleTimelineOptions = [
  'Lo antes posible',
  'En 1-3 meses',
  'En 3-6 meses',
  'En 6-12 meses',
  'Deseo una orientación por ahora',
]

const conditionOptions = [
  'Totalmente reformado',
  'Semirreformado',
  'Reforma antigua',
  'Para entrar a vivir',
  'Para reformar',
]

type Props = {
  triggerClassName?: string
  triggerLabel?: string
  seedForm?: Partial<ValoracionForm>
}

export function ValoracionGratuitaModal({
  triggerClassName = '',
  triggerLabel = 'Deseo vender',
  seedForm,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<ValoracionForm>(initialForm)
  const [error, setError] = useState('')
  const totalSteps = 3
  const progress = Math.round((step / totalSteps) * 100)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const closeModal = () => {
    setIsOpen(false)
    setSubmitted(false)
    setStep(1)
    setError('')
    setForm(initialForm)
  }

  const openModal = () => {
    setForm({ ...initialForm, ...seedForm })
    setSubmitted(false)
    setStep(1)
    setError('')
    setIsOpen(true)
  }

  const validateCurrentStep = () => {
    setError('')
    if (step === 1) {
      const required = [form.propertyType, form.location, form.sqMeters]
      if (required.some((value) => !value.trim())) {
        setError('Completa los campos obligatorios para continuar.')
        return false
      }
    }

    if (step === 2 && !form.saleTimeline.trim()) {
      setError('Indica cuándo planeas vender para continuar.')
      return false
    }

    return true
  }

  const goToNextStep = () => {
    if (!validateCurrentStep()) return
    setError('')
    setStep((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const required = [form.name, form.phone, form.email]
    if (required.some((value) => !value.trim())) {
      setError('Complete sus datos de contacto para enviar la solicitud.')
      return
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    if (!emailOk) {
      setError('Introduzca un email válido.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          source: 'web_valoracion',
          intent: 'vender',
          priority: form.saleTimeline === 'Lo antes posible' ? 'alta' : 'media',
          saleTimeline: form.saleTimeline,
          propertyRef: `${form.propertyType} - ${form.location}`,
          propertyType: form.propertyType,
          location: form.location,
          sqMeters: form.sqMeters,
          bedrooms: form.bedrooms || null,
          bathrooms: form.bathrooms || null,
          condition: form.condition || null,
          observations: form.notes || null,
          notes: [
            `Tipo: ${form.propertyType}`,
            `Zona/Direccion: ${form.location}`,
            `Metros cuadrados: ${form.sqMeters}`,
            `Habitaciones: ${form.bedrooms || 'No indicado'}`,
            `Banos: ${form.bathrooms || 'No indicado'}`,
            `Estado: ${form.condition || 'No indicado'}`,
            `Observaciones: ${form.notes || 'No indicado'}`,
          ].join('\n'),
        }),
      })
      if (!res.ok) throw new Error('No se pudo enviar la solicitud')
      setSubmitted(true)
    } catch {
      setError('No se pudo enviar la solicitud. Inténtelo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={triggerClassName || 'btn-outline px-10 py-4 text-[calc(0.875rem+4pt)] tracking-wide'}
      >
        {triggerLabel}
      </button>

      {mounted && isOpen && createPortal(
        <div className="lead-modal-overlay" onClick={closeModal}>
          <div className="lead-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={closeModal} className="lead-modal-close" aria-label="Cerrar modal">
              ×
            </button>

            {submitted ? (
              <div className="lead-modal-thanks">
                <span className="lead-modal-thanks-icon" aria-hidden="true">✓</span>
                <h3>Gracias por confiar en nosotros</h3>
                <p>Nos pondremos en contacto con usted para facilitarle la valoración gratuita de su propiedad.</p>
                <button type="button" className="btn-primary lead-modal-submit" onClick={closeModal}>
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="lead-modal-hero">
                  <h3 className="lead-modal-title">¿Desea conocer el valor de su vivienda?</h3>
                  <p className="lead-modal-subtitle">
                    Complete los datos y le realizaremos una valoración completa de su inmueble sin compromiso.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="lead-modal-form">
                  <div className="lead-modal-progress-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                    <div className="lead-modal-progress-meta">
                      <span>Paso {step} de {totalSteps}</span>
                      <span>{progress}% completado</span>
                    </div>
                    <div className="lead-modal-progress-track">
                      <div className="lead-modal-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="lead-modal-section">
                      <h4>Su inmueble</h4>
                      <div className="lead-modal-grid">
                        <label>
                          Tipo de inmueble *
                          <select
                            value={form.propertyType}
                            onChange={(e) => setForm((prev) => ({ ...prev, propertyType: e.target.value }))}
                          >
                            <option value="">Selecciona una opción</option>
                            {propertyTypeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Zona / Dirección *
                          <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                          />
                        </label>

                        <label>
                          m² aproximados *
                          <input
                            type="number"
                            value={form.sqMeters}
                            onChange={(e) => setForm((prev) => ({ ...prev, sqMeters: e.target.value }))}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="lead-modal-section">
                      <h4>Más detalles</h4>
                      <div className="lead-modal-grid">
                        <label>
                          Habitaciones
                          <input
                            type="number"
                            value={form.bedrooms}
                            onChange={(e) => setForm((prev) => ({ ...prev, bedrooms: e.target.value }))}
                          />
                        </label>

                        <label>
                          Baños
                          <input
                            type="number"
                            value={form.bathrooms}
                            onChange={(e) => setForm((prev) => ({ ...prev, bathrooms: e.target.value }))}
                          />
                        </label>

                        <label>
                          Estado de la vivienda
                          <select
                            value={form.condition}
                            onChange={(e) => setForm((prev) => ({ ...prev, condition: e.target.value }))}
                          >
                            <option value="">Selecciona una opción</option>
                            {conditionOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="lead-modal-full">
                          ¿Cuándo planea venderlo? *
                          <select
                            value={form.saleTimeline}
                            onChange={(e) => setForm((prev) => ({ ...prev, saleTimeline: e.target.value }))}
                          >
                            <option value="">Selecciona una opción</option>
                            {saleTimelineOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="lead-modal-full">
                          Observaciones
                          <textarea
                            rows={2}
                            placeholder="Cuéntenos cualquier detalle adicional"
                            value={form.notes}
                            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="lead-modal-section">
                      <h4>Datos de contacto</h4>
                      <div className="lead-modal-grid">
                        <label>
                          Nombre *
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                          />
                        </label>

                        <label>
                          Teléfono *
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                          />
                        </label>

                        <label className="lead-modal-full">
                          Email *
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {error && <p className="lead-modal-error">{error}</p>}

                  <div className="lead-modal-actions">
                    {step > 1 && (
                      <button type="button" className="btn-outline lead-modal-secondary" onClick={() => setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev))}>
                        Atrás
                      </button>
                    )}

                    {step < 3 ? (
                      <button type="button" className="btn-primary lead-modal-submit" onClick={goToNextStep}>
                        Siguiente
                      </button>
                    ) : (
                      <button type="submit" disabled={submitting} className="btn-primary lead-modal-submit disabled:opacity-60">
                        {submitting ? 'Enviando...' : 'Solicitar valoración'}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
