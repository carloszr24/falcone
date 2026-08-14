'use client'

import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  calculateBuyerCosts,
  calculateIrpfVenta,
  calculatePlusvaliaMunicipal,
  formatEuro,
  type BuyerCostsResult,
  type IrpfVentaResult,
  type PlusvaliaResult,
} from '@/lib/tax-calculators'
import { cn } from '@/lib/utils'

type Tab = 'plusvalia' | 'irpf' | 'compra'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type ContactFields = {
  name: string
  email: string
  phone: string
  consent: boolean
}

const emptyContact: ContactFields = { name: '', email: '', phone: '', consent: false }

type PlusvaliaForm = ContactFields & {
  municipio: string
  tipoImpositivo: string
  fechaCompra: string
  fechaVenta: string
  precioCompra: string
  precioVenta: string
  valorCatastralSuelo: string
  valorCatastralTotal: string
}

const emptyPlusvaliaForm: PlusvaliaForm = {
  ...emptyContact,
  municipio: '',
  tipoImpositivo: '30',
  fechaCompra: '',
  fechaVenta: '',
  precioCompra: '',
  precioVenta: '',
  valorCatastralSuelo: '',
  valorCatastralTotal: '',
}

type IrpfForm = ContactFields & {
  precioCompra: string
  gastosCompra: string
  precioVenta: string
  gastosVenta: string
  esViviendaHabitual: string
  tiene65oMas: string
}

const emptyIrpfForm: IrpfForm = {
  ...emptyContact,
  precioCompra: '',
  gastosCompra: '',
  precioVenta: '',
  gastosVenta: '',
  esViviendaHabitual: '',
  tiene65oMas: '',
}

type CompraForm = ContactFields & {
  precioCompra: string
  tipoVivienda: string
  necesitaHipoteca: string
}

const emptyCompraForm: CompraForm = {
  ...emptyContact,
  precioCompra: '',
  tipoVivienda: '',
  necesitaHipoteca: '',
}

const num = (value: string) => parseFloat(value.replace(',', '.')) || 0

function emailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validateContact(form: ContactFields): string | null {
  if (!form.name.trim() || !form.email.trim()) return 'Completa tu nombre y email para ver el resultado.'
  if (!emailValid(form.email)) return 'Introduce un email válido.'
  if (!form.consent) return 'Debes aceptar que te contactemos con el resultado.'
  return null
}

async function saveLead(payload: Record<string, unknown>, setStatus: (s: SaveStatus) => void) {
  setStatus('saving')
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setStatus(res.ok ? 'saved' : 'error')
  } catch {
    setStatus('error')
  }
}

type Props = {
  triggerClassName?: string
  triggerLabel?: string
}

export function CalculadoraImpuestosModal({
  triggerClassName = '',
  triggerLabel = 'Calcula tus impuestos',
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('plusvalia')

  const [plusvaliaForm, setPlusvaliaForm] = useState<PlusvaliaForm>(emptyPlusvaliaForm)
  const [plusvaliaResult, setPlusvaliaResult] = useState<PlusvaliaResult | null>(null)
  const [plusvaliaError, setPlusvaliaError] = useState('')
  const [plusvaliaSave, setPlusvaliaSave] = useState<SaveStatus>('idle')

  const [irpfForm, setIrpfForm] = useState<IrpfForm>(emptyIrpfForm)
  const [irpfResult, setIrpfResult] = useState<IrpfVentaResult | null>(null)
  const [irpfError, setIrpfError] = useState('')
  const [irpfSave, setIrpfSave] = useState<SaveStatus>('idle')

  const [compraForm, setCompraForm] = useState<CompraForm>(emptyCompraForm)
  const [compraResult, setCompraResult] = useState<BuyerCostsResult | null>(null)
  const [compraError, setCompraError] = useState('')
  const [compraSave, setCompraSave] = useState<SaveStatus>('idle')

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

  const openModal = () => {
    setTab('plusvalia')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const onSubmitPlusvalia = (e: FormEvent) => {
    e.preventDefault()
    setPlusvaliaError('')
    const f = plusvaliaForm
    if (!f.municipio.trim() || !f.fechaCompra || !f.fechaVenta || !f.precioCompra || !f.precioVenta || !f.valorCatastralSuelo || !f.valorCatastralTotal) {
      setPlusvaliaError('Completa todos los datos de la operación.')
      return
    }
    const contactErr = validateContact(f)
    if (contactErr) { setPlusvaliaError(contactErr); return }

    const result = calculatePlusvaliaMunicipal({
      municipio: f.municipio,
      tipoImpositivo: num(f.tipoImpositivo),
      fechaCompra: f.fechaCompra,
      fechaVenta: f.fechaVenta,
      precioCompra: num(f.precioCompra),
      precioVenta: num(f.precioVenta),
      valorCatastralSuelo: num(f.valorCatastralSuelo),
      valorCatastralTotal: num(f.valorCatastralTotal),
    })
    setPlusvaliaResult(result)

    const notes = [
      `Municipio: ${f.municipio}`,
      `Tipo impositivo: ${f.tipoImpositivo}%`,
      `Fecha compra: ${f.fechaCompra}`,
      `Fecha venta: ${f.fechaVenta}`,
      `Precio compra: ${formatEuro(num(f.precioCompra))}`,
      `Precio venta: ${formatEuro(num(f.precioVenta))}`,
      `Valor catastral suelo: ${formatEuro(num(f.valorCatastralSuelo))}`,
      `Valor catastral total: ${formatEuro(num(f.valorCatastralTotal))}`,
      `Años de tenencia: ${result.years}`,
      `Cuota método objetivo: ${formatEuro(result.cuotaObjetiva)}`,
      `Cuota método real: ${formatEuro(result.cuotaReal)}`,
      `Resultado final: ${result.exento ? 'Exento' : formatEuro(result.cuotaFinal)} (${result.metodoRecomendado})`,
    ].join('\n')

    saveLead({
      fullName: f.name,
      email: f.email,
      phone: f.phone || 'No indicado',
      source: 'web_calculadora',
      intent: 'vender',
      priority: 'media',
      propertyRef: `Plusvalía municipal — ${f.municipio}`,
      notes,
    }, setPlusvaliaSave)
  }

  const onSubmitIrpf = (e: FormEvent) => {
    e.preventDefault()
    setIrpfError('')
    const f = irpfForm
    if (!f.precioCompra || !f.precioVenta || !f.esViviendaHabitual || !f.tiene65oMas) {
      setIrpfError('Completa todos los datos de la operación.')
      return
    }
    const contactErr = validateContact(f)
    if (contactErr) { setIrpfError(contactErr); return }

    const result = calculateIrpfVenta({
      precioCompra: num(f.precioCompra),
      gastosCompra: num(f.gastosCompra),
      precioVenta: num(f.precioVenta),
      gastosVenta: num(f.gastosVenta),
      esViviendaHabitual: f.esViviendaHabitual === 'si',
      tiene65oMas: f.tiene65oMas === 'si',
    })
    setIrpfResult(result)

    const notes = [
      `Precio compra: ${formatEuro(num(f.precioCompra))}`,
      `Gastos compra: ${formatEuro(num(f.gastosCompra))}`,
      `Precio venta: ${formatEuro(num(f.precioVenta))}`,
      `Gastos venta: ${formatEuro(num(f.gastosVenta))}`,
      `Vivienda habitual: ${f.esViviendaHabitual === 'si' ? 'Sí' : 'No'}`,
      `65 años o más: ${f.tiene65oMas === 'si' ? 'Sí' : 'No'}`,
      `Ganancia patrimonial: ${formatEuro(result.ganancia)}`,
      `IRPF estimado: ${result.exento ? 'Exento' : formatEuro(result.cuotaIrpf)}`,
    ].join('\n')

    saveLead({
      fullName: f.name,
      email: f.email,
      phone: f.phone || 'No indicado',
      source: 'web_calculadora',
      intent: 'vender',
      priority: 'media',
      propertyRef: 'IRPF de la venta',
      notes,
    }, setIrpfSave)
  }

  const onSubmitCompra = (e: FormEvent) => {
    e.preventDefault()
    setCompraError('')
    const f = compraForm
    if (!f.precioCompra || !f.tipoVivienda || !f.necesitaHipoteca) {
      setCompraError('Completa todos los datos de la operación.')
      return
    }
    const contactErr = validateContact(f)
    if (contactErr) { setCompraError(contactErr); return }

    const result = calculateBuyerCosts({
      precioCompra: num(f.precioCompra),
      tipoVivienda: f.tipoVivienda === 'obra_nueva' ? 'obra_nueva' : 'usada',
      necesitaHipoteca: f.necesitaHipoteca === 'si',
    })
    setCompraResult(result)

    const notes = [
      `Precio compra: ${formatEuro(num(f.precioCompra))}`,
      `Tipo de vivienda: ${f.tipoVivienda === 'obra_nueva' ? 'Obra nueva' : 'Usada'}`,
      `Necesita hipoteca: ${f.necesitaHipoteca === 'si' ? 'Sí' : 'No'}`,
      `${result.impuestoPrincipalLabel}: ${formatEuro(result.impuestoPrincipal)}`,
      `Notaría (estimado): ${formatEuro(result.notaria)}`,
      `Registro (estimado): ${formatEuro(result.registro)}`,
      `Gestoría (estimado): ${formatEuro(result.gestoria)}`,
      ...(f.necesitaHipoteca === 'si' ? [`Tasación + gestoría hipoteca (estimado): ${formatEuro(result.tasacionHipoteca + result.gestoriaHipoteca)}`] : []),
      `Total gastos: ${formatEuro(result.totalGastos)}`,
      `Total con precio incluido: ${formatEuro(result.totalConPrecio)}`,
    ].join('\n')

    saveLead({
      fullName: f.name,
      email: f.email,
      phone: f.phone || 'No indicado',
      source: 'web_calculadora',
      intent: 'comprar',
      priority: 'media',
      propertyRef: 'Costes de comprar',
      notes,
    }, setCompraSave)
  }

  const saveStatusLabel = (status: SaveStatus) => {
    if (status === 'saving') return 'Guardando tu solicitud...'
    if (status === 'saved') return 'Datos guardados. Diego Pennise revisará tu caso.'
    if (status === 'error') return 'No se pudo guardar tu solicitud, pero aquí tienes tu resultado.'
    return ''
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
          <div className="lead-modal lead-modal--wide" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={closeModal} className="lead-modal-close" aria-label="Cerrar modal">
              ×
            </button>

            <div className="lead-modal-hero">
              <h3 className="lead-modal-title">Calcula impuestos y gastos de tu operación</h3>
              <p className="lead-modal-subtitle">
                Tres calculadoras orientativas para vender o comprar en la Costa del Sol. Resultado al instante y revisión sin coste con Diego Pennise.
              </p>
            </div>

            <div className="lead-modal-tabs">
              <button
                type="button"
                className={cn('lead-modal-tab', tab === 'plusvalia' && 'lead-modal-tab--active')}
                onClick={() => setTab('plusvalia')}
              >
                Plusvalía municipal
              </button>
              <button
                type="button"
                className={cn('lead-modal-tab', tab === 'irpf' && 'lead-modal-tab--active')}
                onClick={() => setTab('irpf')}
              >
                IRPF de la venta
              </button>
              <button
                type="button"
                className={cn('lead-modal-tab', tab === 'compra' && 'lead-modal-tab--active')}
                onClick={() => setTab('compra')}
              >
                Costes de comprar
              </button>
            </div>

            {tab === 'plusvalia' && (
              <form onSubmit={onSubmitPlusvalia} className="lead-modal-form">
                <div className="lead-modal-section">
                  <h4>Datos de la operación</h4>
                  <div className="lead-modal-grid">
                    <label>
                      Municipio *
                      <input type="text" value={plusvaliaForm.municipio}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, municipio: e.target.value }))} />
                    </label>
                    <label>
                      Tipo impositivo (%) · lo fija el ayuntamiento (máx. 30)
                      <input type="number" value={plusvaliaForm.tipoImpositivo}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, tipoImpositivo: e.target.value }))} />
                    </label>
                    <label>
                      Fecha de compra *
                      <input type="date" value={plusvaliaForm.fechaCompra}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, fechaCompra: e.target.value }))} />
                    </label>
                    <label>
                      Fecha de venta *
                      <input type="date" value={plusvaliaForm.fechaVenta}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, fechaVenta: e.target.value }))} />
                    </label>
                    <label>
                      Precio de compra (€) *
                      <input type="number" placeholder="Ej: 200000" value={plusvaliaForm.precioCompra}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, precioCompra: e.target.value }))} />
                    </label>
                    <label>
                      Precio de venta (€) *
                      <input type="number" placeholder="Ej: 300000" value={plusvaliaForm.precioVenta}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, precioVenta: e.target.value }))} />
                    </label>
                    <label>
                      Valor catastral del suelo (€) *
                      <input type="number" placeholder="Ej: 60000" value={plusvaliaForm.valorCatastralSuelo}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, valorCatastralSuelo: e.target.value }))} />
                    </label>
                    <label>
                      Valor catastral total (€) *
                      <input type="number" placeholder="Ej: 100000" value={plusvaliaForm.valorCatastralTotal}
                        onChange={(e) => setPlusvaliaForm((p) => ({ ...p, valorCatastralTotal: e.target.value }))} />
                    </label>
                  </div>
                </div>

                <ContactSection form={plusvaliaForm} setForm={setPlusvaliaForm} />

                {plusvaliaError && <p className="lead-modal-error">{plusvaliaError}</p>}

                <div className="lead-modal-actions">
                  <button type="submit" className="btn-primary lead-modal-submit">
                    Calcular y ver mi plusvalía
                  </button>
                </div>

                {plusvaliaResult && (
                  <ResultCard
                    headline={plusvaliaResult.exento ? 'Exenta' : formatEuro(plusvaliaResult.cuotaFinal)}
                    subtitle={
                      plusvaliaResult.exento
                        ? 'No hay incremento de valor del suelo: la operación está exenta.'
                        : `Método más favorable: ${plusvaliaResult.metodoRecomendado === 'real' ? 'real' : 'objetivo'}`
                    }
                    rows={[
                      { label: 'Años de tenencia', value: String(plusvaliaResult.years) },
                      { label: 'Cuota método objetivo', value: formatEuro(plusvaliaResult.cuotaObjetiva) },
                      { label: 'Cuota método real', value: formatEuro(plusvaliaResult.cuotaReal) },
                    ]}
                    saveStatus={saveStatusLabel(plusvaliaSave)}
                  />
                )}
              </form>
            )}

            {tab === 'irpf' && (
              <form onSubmit={onSubmitIrpf} className="lead-modal-form">
                <div className="lead-modal-section">
                  <h4>Datos de la compra</h4>
                  <div className="lead-modal-grid">
                    <label>
                      Precio de compra (€) *
                      <input type="number" placeholder="Ej: 150000" value={irpfForm.precioCompra}
                        onChange={(e) => setIrpfForm((p) => ({ ...p, precioCompra: e.target.value }))} />
                    </label>
                    <label>
                      Gastos e impuestos de la compra (€) · opcional
                      <input type="number" placeholder="ITP o IVA, notaría, registro..." value={irpfForm.gastosCompra}
                        onChange={(e) => setIrpfForm((p) => ({ ...p, gastosCompra: e.target.value }))} />
                    </label>
                  </div>
                </div>

                <div className="lead-modal-section">
                  <h4>Datos de la venta</h4>
                  <div className="lead-modal-grid">
                    <label>
                      Precio de venta (€) *
                      <input type="number" placeholder="Ej: 280000" value={irpfForm.precioVenta}
                        onChange={(e) => setIrpfForm((p) => ({ ...p, precioVenta: e.target.value }))} />
                    </label>
                    <label>
                      Gastos de la venta (€) · opcional
                      <input type="number" placeholder="Agencia, certificado energético..." value={irpfForm.gastosVenta}
                        onChange={(e) => setIrpfForm((p) => ({ ...p, gastosVenta: e.target.value }))} />
                    </label>
                  </div>
                </div>

                <div className="lead-modal-section">
                  <h4>Tu situación</h4>
                  <div className="lead-modal-grid">
                    <label>
                      ¿Es tu vivienda habitual? *
                      <select value={irpfForm.esViviendaHabitual}
                        onChange={(e) => setIrpfForm((p) => ({ ...p, esViviendaHabitual: e.target.value }))}>
                        <option value="">Selecciona</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                    <label>
                      ¿Tienes 65 años o más? *
                      <select value={irpfForm.tiene65oMas}
                        onChange={(e) => setIrpfForm((p) => ({ ...p, tiene65oMas: e.target.value }))}>
                        <option value="">Selecciona</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                  </div>
                </div>

                <ContactSection form={irpfForm} setForm={setIrpfForm} />

                {irpfError && <p className="lead-modal-error">{irpfError}</p>}

                <div className="lead-modal-actions">
                  <button type="submit" className="btn-primary lead-modal-submit">
                    Calcular y ver mi IRPF
                  </button>
                </div>

                {irpfResult && (
                  <ResultCard
                    headline={irpfResult.exento || irpfResult.ganancia <= 0 ? (irpfResult.ganancia <= 0 ? 'Sin ganancia' : 'Exento') : formatEuro(irpfResult.cuotaIrpf)}
                    subtitle={
                      irpfResult.ganancia <= 0
                        ? 'No hay ganancia patrimonial en esta operación.'
                        : irpfResult.exento
                          ? 'Exenta por venta de vivienda habitual con 65 años o más.'
                          : 'Estimado con los tramos del ahorro vigentes.'
                    }
                    rows={[
                      { label: 'Ganancia patrimonial', value: formatEuro(irpfResult.ganancia) },
                      { label: 'Valor de adquisición', value: formatEuro(irpfResult.valorAdquisicion) },
                      { label: 'Valor de transmisión', value: formatEuro(irpfResult.valorTransmision) },
                    ]}
                    note="Si reinviertes el importe en tu nueva vivienda habitual en un plazo de 2 años, puedes tener derecho a exención total o parcial. Consúltanos tu caso."
                    saveStatus={saveStatusLabel(irpfSave)}
                  />
                )}
              </form>
            )}

            {tab === 'compra' && (
              <form onSubmit={onSubmitCompra} className="lead-modal-form">
                <div className="lead-modal-section">
                  <h4>Datos de la compra</h4>
                  <div className="lead-modal-grid">
                    <label>
                      Precio de compra (€) *
                      <input type="number" placeholder="Ej: 250000" value={compraForm.precioCompra}
                        onChange={(e) => setCompraForm((p) => ({ ...p, precioCompra: e.target.value }))} />
                    </label>
                    <label>
                      Tipo de vivienda *
                      <select value={compraForm.tipoVivienda}
                        onChange={(e) => setCompraForm((p) => ({ ...p, tipoVivienda: e.target.value }))}>
                        <option value="">Selecciona</option>
                        <option value="usada">Usada</option>
                        <option value="obra_nueva">Obra nueva</option>
                      </select>
                    </label>
                    <label className="lead-modal-full">
                      ¿Vas a necesitar hipoteca? *
                      <select value={compraForm.necesitaHipoteca}
                        onChange={(e) => setCompraForm((p) => ({ ...p, necesitaHipoteca: e.target.value }))}>
                        <option value="">Selecciona</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                  </div>
                </div>

                <ContactSection form={compraForm} setForm={setCompraForm} />

                {compraError && <p className="lead-modal-error">{compraError}</p>}

                <div className="lead-modal-actions">
                  <button type="submit" className="btn-primary lead-modal-submit">
                    Calcular impuestos y gastos
                  </button>
                </div>

                {compraResult && (
                  <ResultCard
                    headline={formatEuro(compraResult.totalGastos)}
                    subtitle={`Total con el precio incluido: ${formatEuro(compraResult.totalConPrecio)}`}
                    rows={[
                      { label: compraResult.impuestoPrincipalLabel, value: formatEuro(compraResult.impuestoPrincipal) },
                      { label: 'Notaría (estimado)', value: formatEuro(compraResult.notaria) },
                      { label: 'Registro (estimado)', value: formatEuro(compraResult.registro) },
                      { label: 'Gestoría (estimado)', value: formatEuro(compraResult.gestoria) },
                      ...(compraForm.necesitaHipoteca === 'si'
                        ? [{ label: 'Tasación + gestoría hipoteca (estimado)', value: formatEuro(compraResult.tasacionHipoteca + compraResult.gestoriaHipoteca) }]
                        : []),
                    ]}
                    note={compraForm.necesitaHipoteca === 'si' ? 'El AJD de la hipoteca lo paga el banco, no tú.' : undefined}
                    saveStatus={saveStatusLabel(compraSave)}
                  />
                )}
              </form>
            )}

            <p className="lead-modal-disclaimer">
              Herramienta orientativa de Falcone Propiedades. No constituye asesoramiento fiscal ni liquidación oficial. Verifica siempre con tu ayuntamiento, notaría o asesor fiscal.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function ContactSection<T extends ContactFields>({
  form,
  setForm,
}: {
  form: T
  setForm: Dispatch<SetStateAction<T>>
}) {
  return (
    <div className="lead-modal-section">
      <h4>Para ver tu resultado, déjanos tus datos</h4>
      <div className="lead-modal-grid">
        <label>
          Nombre *
          <input type="text" placeholder="Tu nombre" value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </label>
        <label>
          Correo electrónico *
          <input type="email" placeholder="tu@email.com" value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </label>
        <label className="lead-modal-full">
          WhatsApp / teléfono · opcional
          <input type="tel" placeholder="+34 600 000 000" value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </label>
        <label className="lead-modal-full" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input type="checkbox" checked={form.consent} style={{ marginTop: '0.2rem' }}
            onChange={(e) => setForm((p) => ({ ...p, consent: e.target.checked }))} />
          <span style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '0.72rem' }}>
            Acepto que Falcone Propiedades contacte conmigo para enviarme el resultado y orientarme. Tratamos tus datos conforme al RGPD y no los cedemos a terceros.
          </span>
        </label>
      </div>
    </div>
  )
}

function ResultCard({
  headline,
  subtitle,
  rows,
  note,
  saveStatus,
}: {
  headline: string
  subtitle: string
  rows: { label: string; value: string }[]
  note?: string
  saveStatus: string
}) {
  return (
    <div className="lead-modal-result">
      <div className="lead-modal-result-headline">
        <span>{subtitle}</span>
        <strong>{headline}</strong>
      </div>
      {rows.map((row) => (
        <div className="lead-modal-result-row" key={row.label}>
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
      {note && <p className="lead-modal-result-note">{note}</p>}
      {saveStatus && <p className="lead-modal-save-status">{saveStatus}</p>}
    </div>
  )
}
