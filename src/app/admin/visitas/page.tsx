'use client'

import { useMemo, useState } from 'react'
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
  const [query, setQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | VisitChannel>('all')
  const [propertyFilter, setPropertyFilter] = useState<'all' | string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ADMIN_VISITS.filter((visit) => {
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
  }, [query, channelFilter, propertyFilter])

  const stats = useMemo(() => {
    const byProperty = Object.fromEntries(
      Object.keys(PROPERTY_LABELS).map((id) => [id, ADMIN_VISITS.filter((v) => v.propertyId === id).length])
    ) as Record<string, number>
    return {
      total: ADMIN_VISITS.length,
      llamadas: ADMIN_VISITS.filter((v) => v.channel === 'llamada').length,
      visitas: ADMIN_VISITS.filter((v) => v.channel === 'visita_presencial').length,
      interesadas: ADMIN_VISITS.filter((v) => v.channel === 'interesada').length,
      byProperty,
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-stone-900">Visitas / llamadas</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500">
          Interacciones siempre asociadas a una propiedad publicada: llamadas, mails, visitas, referidos y
          seguimientos.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Llamadas" value={String(stats.llamadas)} />
        <StatCard label="Visitas" value={String(stats.visitas)} />
        <StatCard label="Interesadas" value={String(stats.interesadas)} />
      </section>

      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por contacto, propiedad, notas…"
          className="w-full border border-stone-200 px-4 py-3 text-sm font-light focus:border-brand-burgundy focus:outline-none"
        />

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

      <p className="text-xs text-stone-400">
        Mostrando {filtered.length} de {ADMIN_VISITS.length} interacciones
      </p>

      <div className="space-y-3">
        {filtered.map((visit) => (
          <article
            key={visit.id}
            className="rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-brand-burgundy/25"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-light text-stone-900">{visit.contactName}</h2>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em]',
                      channelBadgeClass(visit.channel)
                    )}
                  >
                    {VISIT_CHANNEL_LABELS[visit.channel]}
                  </span>
                </div>

                <p className="text-sm font-medium text-brand-burgundy">
                  {PROPERTY_LABELS[visit.propertyId] ?? visit.propertyId}
                </p>

                <p className="text-sm font-light leading-relaxed text-stone-700">{visit.summary}</p>

                <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  <Row label="Teléfono" value={visit.phone} />
                  <Row label="Próxima acción" value={visit.nextAction} />
                </dl>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Notas</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-stone-600">{visit.notes}</p>
                </div>
              </div>

              <div className="shrink-0 text-left lg:text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Fecha</p>
                <p className="mt-1 text-sm font-light text-stone-600">{formatDate(visit.occurredAt)}</p>
              </div>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <p className="mt-2 font-display text-2xl font-light text-stone-900">{value}</p>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-wide text-stone-500">{label}</p>
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
        'border px-3 py-1.5 text-xs transition-colors',
        active
          ? 'border-stone-900 bg-stone-900 text-white'
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
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
      <dd className="mt-0.5 font-light text-stone-700">{value}</dd>
    </div>
  )
}
