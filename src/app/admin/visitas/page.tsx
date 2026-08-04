'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ADMIN_VISITS, VISIT_CHANNEL_LABELS, type VisitChannel } from '@/data/admin-visits'
import { cn } from '@/lib/utils'

const PROPERTY_LABELS: Record<string, string> = {
  'piso-mar-rojo-tarifa': 'Piso Mar Rojo – Tarifa',
  'triplex-trafalgar-tarifa': 'Dúplex/Triplex Trafalgar – Tarifa',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

function channelBadgeClass(channel: VisitChannel) {
  switch (channel) {
    case 'interesada':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'llamada':
      return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'mail':
      return 'bg-violet-50 text-violet-700 border-violet-100'
    case 'whatsapp':
      return 'bg-teal-50 text-teal-700 border-teal-100'
    case 'visita_presencial':
      return 'bg-amber-50 text-amber-800 border-amber-100'
    case 'referido':
      return 'bg-rose-50 text-rose-700 border-rose-100'
    default:
      return 'bg-stone-100 text-stone-600 border-stone-200'
  }
}

export default function AdminVisitasPage() {
  const [visits, setVisits] = useState(ADMIN_VISITS)
  const [query, setQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | VisitChannel>('all')
  const [propertyFilter, setPropertyFilter] = useState<'all' | string>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [newVisit, setNewVisit] = useState({
    propertyId: Object.keys(PROPERTY_LABELS)[0] ?? '',
    contactName: '',
    phone: '',
    channel: 'llamada' as VisitChannel,
    outcome: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    summary: '',
    notes: '',
    nextAction: '',
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return visits.filter((visit) => {
      if (channelFilter !== 'all' && visit.channel !== channelFilter) return false
      if (propertyFilter !== 'all' && visit.propertyId !== propertyFilter) return false
      if (!q) return true
      const haystack = [
        visit.contactName,
        visit.phone,
        visit.summary,
        visit.notes,
        visit.nextAction,
        VISIT_CHANNEL_LABELS[visit.channel],
        PROPERTY_LABELS[visit.propertyId] ?? visit.propertyId,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    }).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  }, [visits, query, channelFilter, propertyFilter])

  const stats = useMemo(() => {
    const byProperty = Object.fromEntries(
      Object.keys(PROPERTY_LABELS).map((id) => [id, visits.filter((v) => v.propertyId === id).length])
    ) as Record<string, number>
    return {
      total: visits.length,
      llamadas: visits.filter((v) => v.channel === 'llamada').length,
      visitas: visits.filter((v) => v.channel === 'visita_presencial').length,
      interesadas: visits.filter((v) => v.channel === 'interesada').length,
      byProperty,
    }
  }, [visits])

  const activeFilterCount = [query.trim() !== '', channelFilter !== 'all', propertyFilter !== 'all'].filter(Boolean)
    .length

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!formOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFormOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [formOpen])

  function toggleExpanded(id: string) {
    setExpandedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function handleVisitChange<K extends keyof typeof newVisit>(field: K, value: (typeof newVisit)[K]) {
    setNewVisit((current) => ({ ...current, [field]: value }))
  }

  function handleCreateVisit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const visit = {
      id: `v${Date.now()}`,
      propertyId: newVisit.propertyId,
      contactName: newVisit.contactName.trim(),
      phone: newVisit.phone.trim(),
      channel: newVisit.channel,
      summary: newVisit.summary.trim(),
      notes: `${newVisit.outcome.trim() ? `Resultado: ${newVisit.outcome.trim()}\n\n` : ''}${newVisit.notes.trim()}`.trim(),
      occurredAt: new Date(newVisit.occurredAt).toISOString(),
      nextAction: newVisit.nextAction.trim(),
    }

    setVisits((current) => [visit, ...current])
    setExpandedIds((current) => [visit.id, ...current.filter((item) => item !== visit.id)])
    setNewVisit({
      propertyId: Object.keys(PROPERTY_LABELS)[0] ?? '',
      contactName: '',
      phone: '',
      channel: 'llamada',
      outcome: '',
      occurredAt: new Date().toISOString().slice(0, 16),
      summary: '',
      notes: '',
      nextAction: '',
    })
    setFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-stone-900">Visitas / llamadas</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-500">
            Interacciones siempre asociadas a una propiedad publicada: llamadas, mails, visitas, referidos y
            seguimientos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-stone-700 shadow-sm shadow-stone-100/40 transition hover:border-brand-burgundy/20 hover:text-brand-burgundy"
        >
          <PlusIcon />
          <span>Nueva visita</span>
        </button>
      </div>

      {mounted &&
        formOpen &&
        createPortal(
          <AdminModal onClose={() => setFormOpen(false)} title="Nueva visita / llamada" eyebrow="Registro comercial">
            <p className="mt-1 text-sm font-light text-stone-500">
              Añade nuevas interacciones y haz que aparezcan al momento en el histórico comercial.
            </p>
            <form onSubmit={handleCreateVisit} className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <Label>Propiedad</Label>
                  <SelectInput
                    value={newVisit.propertyId}
                    onChange={(e) => handleVisitChange('propertyId', e.target.value)}
                    required
                  >
                    {Object.entries(PROPERTY_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field>
                  <Label>Nombre del contacto</Label>
                  <TextInput
                    value={newVisit.contactName}
                    onChange={(e) => handleVisitChange('contactName', e.target.value)}
                    placeholder="Ej. Marta Ruiz"
                    required
                  />
                </Field>
                <Field>
                  <Label>Teléfono</Label>
                  <TextInput
                    value={newVisit.phone}
                    onChange={(e) => handleVisitChange('phone', e.target.value)}
                    placeholder="600 00 00 00"
                    required
                  />
                </Field>
                <Field>
                  <Label>Canal / tipo</Label>
                  <SelectInput
                    value={newVisit.channel}
                    onChange={(e) => handleVisitChange('channel', e.target.value as VisitChannel)}
                  >
                    {(Object.keys(VISIT_CHANNEL_LABELS) as VisitChannel[]).map((channel) => (
                      <option key={channel} value={channel}>
                        {VISIT_CHANNEL_LABELS[channel]}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <Label>Fecha</Label>
                  <TextInput
                    type="datetime-local"
                    value={newVisit.occurredAt}
                    onChange={(e) => handleVisitChange('occurredAt', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Interés / estado</Label>
                  <TextInput
                    value={newVisit.outcome}
                    onChange={(e) => handleVisitChange('outcome', e.target.value)}
                    placeholder="Muy interesado, pendiente, frío..."
                    required
                  />
                </Field>
                <Field className="xl:col-span-2">
                  <Label>Siguiente paso</Label>
                  <TextInput
                    value={newVisit.nextAction}
                    onChange={(e) => handleVisitChange('nextAction', e.target.value)}
                    placeholder="Llamar el jueves, enviar dossier, cerrar visita..."
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <Label>Resumen</Label>
                  <TextAreaInput
                    value={newVisit.summary}
                    onChange={(e) => handleVisitChange('summary', e.target.value)}
                    placeholder="Qué ocurrió en la llamada, visita o seguimiento"
                    required
                  />
                </Field>
                <Field>
                  <Label>Notas</Label>
                  <TextAreaInput
                    value={newVisit.notes}
                    onChange={(e) => handleVisitChange('notes', e.target.value)}
                    placeholder="Objeciones, timing, info adicional, tareas internas..."
                    required
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-2 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-stone-400">
                  Al guardar, la interacción se inserta arriba y entra en filtros y detalle.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg border border-stone-200 px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-white transition hover:bg-brand-burgundy"
                  >
                    Guardar interacción
                  </button>
                </div>
              </div>
            </form>
          </AdminModal>,
          document.body
        )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Llamadas" value={String(stats.llamadas)} />
        <StatCard label="Visitas" value={String(stats.visitas)} />
        <StatCard label="Interesadas" value={String(stats.interesadas)} />
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-100/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por contacto, propiedad, notas…"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-light transition focus:border-brand-burgundy focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs uppercase tracking-[0.14em] transition-all',
                filtersOpen || activeFilterCount > 0
                  ? 'border-brand-burgundy/20 bg-brand-burgundy/5 text-brand-burgundy'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900'
              )}
            >
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-brand-burgundy px-1.5 py-0.5 text-[10px] tracking-normal text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronIcon open={filtersOpen} />
            </button>
            <p className="text-xs text-stone-400">
              {filtered.length} de {visits.length} interacciones
            </p>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-4 grid gap-4 border-t border-stone-100 pt-4">
            <FilterRow label="Estado / canal">
              <Chip active={channelFilter === 'all'} onClick={() => setChannelFilter('all')}>
                Todos
              </Chip>
              {(Object.keys(VISIT_CHANNEL_LABELS) as VisitChannel[]).map((channel) => (
                <Chip key={channel} active={channelFilter === channel} onClick={() => setChannelFilter(channel)}>
                  {VISIT_CHANNEL_LABELS[channel]}
                </Chip>
              ))}
            </FilterRow>

            <FilterRow label="Propiedad">
              <Chip active={propertyFilter === 'all'} onClick={() => setPropertyFilter('all')}>
                Todas
              </Chip>
              {Object.entries(PROPERTY_LABELS).map(([id, label]) => (
                <Chip key={id} active={propertyFilter === id} onClick={() => setPropertyFilter(id)}>
                  {label} ({stats.byProperty[id] ?? 0})
                </Chip>
              ))}
            </FilterRow>
          </div>
        )}
      </section>

      <div className="space-y-3">
        {filtered.map((visit) => (
          <article
            key={visit.id}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-100/40 transition-all hover:-translate-y-0.5 hover:border-brand-burgundy/25 hover:shadow-md"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-light text-stone-900">{visit.contactName}</h2>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]',
                        channelBadgeClass(visit.channel)
                      )}
                    >
                      {VISIT_CHANNEL_LABELS[visit.channel]}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                    <InfoPill label="Propiedad" value={PROPERTY_LABELS[visit.propertyId] ?? visit.propertyId} />
                    <InfoPill label="Tel" value={visit.phone} />
                    <InfoPill label="Siguiente paso" value={visit.nextAction} />
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm font-light leading-6 text-stone-700">{visit.summary}</p>
                </div>

                <div className="flex items-center justify-between gap-3 lg:block lg:shrink-0 lg:text-right">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Fecha</p>
                    <p className="mt-1 text-sm font-light text-stone-600">{formatDate(visit.occurredAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(visit.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-stone-600 transition hover:border-brand-burgundy/20 hover:text-brand-burgundy"
                  >
                    <span>{expandedIds.includes(visit.id) ? 'Ocultar' : 'Detalles'}</span>
                    <ChevronIcon open={expandedIds.includes(visit.id)} />
                  </button>
                </div>
              </div>

              {expandedIds.includes(visit.id) && (
                <div className="grid gap-4 border-t border-stone-100 pt-3">
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <Row label="Teléfono" value={visit.phone} />
                    <Row label="Próxima acción" value={visit.nextAction} />
                  </dl>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <DetailBlock label="Resumen">{visit.summary}</DetailBlock>
                    <DetailBlock label="Notas">{visit.notes}</DetailBlock>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center text-sm text-stone-400">
            No hay visitas o llamadas con esos filtros.
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <label className={cn('grid gap-1.5', className)}>{children}</label>
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] uppercase tracking-[0.16em] text-stone-500">{children}</span>
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-light text-stone-700 transition placeholder:text-stone-400 focus:border-brand-burgundy focus:bg-white focus:outline-none',
        props.className
      )}
    />
  )
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-light text-stone-700 transition focus:border-brand-burgundy focus:bg-white focus:outline-none',
        props.className
      )}
    />
  )
}

function TextAreaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[104px] w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-light text-stone-700 transition placeholder:text-stone-400 focus:border-brand-burgundy focus:bg-white focus:outline-none',
        props.className
      )}
    />
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3.5 shadow-sm shadow-stone-100/40">
      <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-light text-stone-900">{value}</p>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs transition-all',
        active
          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50'
      )}
    >
      {children}
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] text-stone-400">{label}</dt>
      <dd className="mt-0.5 font-light leading-6 text-stone-700">{value}</dd>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">
      <span className="uppercase tracking-[0.14em] text-stone-400">{label}</span>
      <span className="text-stone-700">{value}</span>
    </span>
  )
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50/70 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <p className="mt-1.5 text-sm font-light leading-6 text-stone-700">{children}</p>
    </div>
  )
}

function AdminModal({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string
  eyebrow: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl shadow-stone-900/10 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{eyebrow}</p>
            <h2 className="mt-1 font-display text-2xl font-light text-stone-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg text-stone-500 transition hover:border-brand-burgundy/20 hover:text-brand-burgundy"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
      <path d="M8 3.25v9.5M3.25 8h9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
      fill="none"
    >
      <path d="M4 6.5 8 10l4-3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
