'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LEAD_INTENT_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { Lead, LeadSource, LeadStatus } from '@/types'

type SourceFilter = 'all' | 'web_contacto' | 'web_valoracion' | 'web_calculadora'
type StatusFilter = 'all' | LeadStatus

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function isToday(date: Date) {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function sourceBadgeClass(source: LeadSource) {
  if (source === 'web_contacto') return 'bg-blue-50 text-blue-700 border-blue-100'
  if (source === 'web_valoracion') return 'bg-red-50 text-red-700 border-red-100'
  if (source === 'web_calculadora') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  return 'bg-stone-100 text-stone-600 border-stone-200'
}

function leadDetails(lead: Lead) {
  if (lead.source === 'web_contacto') {
    return lead.notes ? [{ label: 'Mensaje', value: lead.notes }] : []
  }

  if (lead.source === 'web_valoracion') {
    const rows: { label: string; value: string }[] = []
    if (lead.saleTimeline) rows.push({ label: 'Plazo de venta', value: lead.saleTimeline })
    if (lead.notes) {
      for (const line of lead.notes.split('\n')) {
        const idx = line.indexOf(':')
        if (idx > 0) {
          rows.push({ label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() })
        }
      }
    }
    return rows
  }

  if (lead.source === 'web_calculadora') {
    const rows: { label: string; value: string }[] = []
    if (lead.propertyRef) rows.push({ label: 'Calculadora', value: lead.propertyRef })
    if (lead.notes) {
      for (const line of lead.notes.split('\n')) {
        const idx = line.indexOf(':')
        if (idx > 0) {
          rows.push({ label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() })
        }
      }
    }
    return rows
  }

  const rows: { label: string; value: string }[] = []
  if (lead.notes) rows.push({ label: 'Notas', value: lead.notes })
  if (lead.propertyRef) rows.push({ label: 'Referencia', value: lead.propertyRef })
  return rows
}

export default function AdminLeadsPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [pwError, setPwError] = useState(false)
  const [pwErrorMsg, setPwErrorMsg] = useState<string | null>(null)

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'include' })
      .then(async (r) => r.json().catch(() => ({})))
      .then((data: { authed?: boolean }) => {
        if (data.authed) setAuthed(true)
      })
      .catch(() => {})
  }, [])

  const login = async () => {
    setPwError(false)
    setPwErrorMsg(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password, pin }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (res.ok) {
        setAuthed(true)
        setPassword('')
        setPin('')
        return
      }
      setPwError(true)
      setPwErrorMsg(data.error || 'Contraseña o PIN incorrectos')
    } catch {
      setPwError(true)
      setPwErrorMsg('No se pudo conectar. Inténtalo de nuevo.')
    }
  }

  const fetchLeads = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', { credentials: 'include' })
      const data = await res.json().catch(() => [])
      if (!res.ok) throw new Error('Error cargando leads')
      setLeads(
        (data as Lead[]).map((lead) => ({
          ...lead,
          createdAt: new Date(lead.createdAt),
          updatedAt: new Date(lead.updatedAt),
          firstResponseAt: lead.firstResponseAt ? new Date(lead.firstResponseAt) : null,
          lastContactAt: lead.lastContactAt ? new Date(lead.lastContactAt) : null,
        }))
      )
    } catch {
      setError('No se pudieron cargar los leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) fetchLeads()
  }, [authed])

  const updateLeadStatus = async (id: string, status: string) => {
    const res = await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id,
        status,
        ...(status === 'contactado' ? { lastContactAt: new Date().toISOString() } : {}),
      }),
    })
    if (!res.ok) throw new Error('Error al actualizar')
    const updated = (await res.json()) as Lead
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...updated,
              createdAt: new Date(updated.createdAt),
              updatedAt: new Date(updated.updatedAt),
              firstResponseAt: updated.firstResponseAt ? new Date(updated.firstResponseAt) : null,
              lastContactAt: updated.lastContactAt ? new Date(updated.lastContactAt) : null,
            }
          : lead
      )
    )
  }

  const deleteLead = async (lead: Lead) => {
    const ok = window.confirm(`¿Eliminar el lead de ${lead.fullName}? Esta acción no se puede deshacer.`)
    if (!ok) return

    setDeletingId(lead.id)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: lead.id }),
      })
      if (!res.ok) throw new Error('Error al eliminar')
      setLeads((prev) => prev.filter((item) => item.id !== lead.id))
    } catch {
      setError('No se pudo eliminar el lead')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredLeads = useMemo(() => {
    let list = leads
    if (sourceFilter !== 'all') {
      list = list.filter((lead) => lead.source === sourceFilter)
    }
    if (statusFilter !== 'all') {
      list = list.filter((lead) => lead.status === statusFilter)
    }
    return [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [leads, sourceFilter, statusFilter])

  const stats = useMemo(() => {
    const webLeads = leads.filter(
      (l) => l.source === 'web_contacto' || l.source === 'web_valoracion' || l.source === 'web_calculadora'
    )
    return {
      total: webLeads.length,
      today: webLeads.filter((l) => isToday(l.createdAt)).length,
      contacto: leads.filter((l) => l.source === 'web_contacto').length,
      valoracion: leads.filter((l) => l.source === 'web_valoracion').length,
      calculadora: leads.filter((l) => l.source === 'web_calculadora').length,
      nuevos: webLeads.filter((l) => l.status === 'nuevo').length,
    }
  }, [leads])

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-light text-stone-900 mb-8 text-center">Acceso admin</h1>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwError(false); setPwErrorMsg(null) }}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              placeholder="Contraseña"
              autoComplete="current-password"
              className={cn(
                'w-full border px-4 py-3 text-sm focus:outline-none transition-colors',
                pwError ? 'border-red-300 bg-red-50' : 'border-stone-200 focus:border-stone-900'
              )}
            />
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPwError(false); setPwErrorMsg(null) }}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              placeholder="PIN"
              autoComplete="one-time-code"
              className={cn(
                'w-full border px-4 py-3 text-sm focus:outline-none transition-colors tracking-[0.3em]',
                pwError ? 'border-red-300 bg-red-50' : 'border-stone-200 focus:border-stone-900'
              )}
            />
            {pwErrorMsg && <p className="text-red-500 text-xs">{pwErrorMsg}</p>}
            <button type="button" onClick={login} className="btn-primary w-full py-3 text-sm">
              Entrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-stone-900">Leads de la web</h1>
          <p className="text-stone-500 text-sm mt-1">
            Contactos y valoraciones recibidos desde la web de Falcone Propiedades
          </p>
        </div>
        <button type="button" className="btn-outline text-xs px-4 py-2.5 self-start" onClick={fetchLeads}>
          Actualizar
        </button>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total web" value={String(stats.total)} />
        <StatCard label="Hoy" value={String(stats.today)} highlight={stats.today > 0} />
        <StatCard label="Contactos" value={String(stats.contacto)} />
        <StatCard label="Valoraciones" value={String(stats.valoracion)} />
        <StatCard label="Calculadora" value={String(stats.calculadora)} />
      </section>

      {stats.nuevos > 0 && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 px-4 py-3">
          Tienes <strong>{stats.nuevos}</strong> lead{stats.nuevos === 1 ? '' : 's'} sin revisar.
        </p>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-[11px] text-stone-500 uppercase tracking-wide mb-2">Origen</p>
          <div className="flex flex-wrap gap-2">
            {([
              ['all', 'Todos'],
              ['web_contacto', 'Contacto'],
              ['web_valoracion', 'Valoración'],
              ['web_calculadora', 'Calculadora'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSourceFilter(value)}
                className={cn(
                  'text-xs px-4 py-2 border transition-colors',
                  sourceFilter === value
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] text-stone-500 uppercase tracking-wide mb-2">Estado</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'text-xs px-4 py-2 border transition-colors',
                statusFilter === 'all'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              )}
            >
              Todos
            </button>
            {LEAD_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'text-xs px-4 py-2 border transition-colors',
                  statusFilter === status
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                )}
              >
                {LEAD_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="bg-white border border-stone-200 p-10 text-center text-stone-400 text-sm">
          Cargando leads...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center">
          <p className="text-stone-500 text-sm">No hay leads con estos filtros.</p>
          <p className="text-stone-400 text-xs mt-2">
            Prueba otro origen o estado, o espera nuevos envíos desde la web.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const details = leadDetails(lead)
            return (
              <article key={lead.id} className="bg-white border border-stone-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 border rounded-full',
                          sourceBadgeClass(lead.source)
                        )}
                      >
                        {LEAD_SOURCE_LABELS[lead.source]}
                      </span>
                      {lead.status === 'nuevo' && (
                        <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <h2 className="font-medium text-stone-900 text-lg">{lead.fullName}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="text-brand-blue hover:underline">
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-brand-blue hover:underline break-all">
                          {lead.email}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-2">{formatDate(lead.createdAt)}</p>
                    {lead.source !== 'web_contacto' && lead.source !== 'web_valoracion' && lead.source !== 'web_calculadora' && (
                      <p className="text-xs text-stone-500 mt-1">
                        Interés: {LEAD_INTENT_LABELS[lead.intent]}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col sm:items-end gap-3">
                    <div>
                      <label className="text-[11px] text-stone-500 uppercase tracking-wide block mb-1">Estado</label>
                      <select
                        value={lead.status}
                        className="border border-stone-200 bg-white px-3 py-2 text-sm min-w-[160px]"
                        onChange={async (e) => {
                          try {
                            await updateLeadStatus(lead.id, e.target.value)
                          } catch {
                            setError('No se pudo actualizar el estado')
                          }
                        }}
                      >
                        {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteLead(lead)}
                      disabled={deletingId === lead.id}
                      className="inline-flex items-center gap-2 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                      title="Eliminar lead"
                    >
                      <TrashIcon />
                      {deletingId === lead.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>

                {details.length > 0 && (
                  <dl className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {details.map((row) => (
                      <div key={`${lead.id}-${row.label}`} className={row.label === 'Mensaje' || row.label === 'Observaciones' ? 'sm:col-span-2' : ''}>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{row.label}</dt>
                        <dd className="text-sm text-stone-800 mt-1 whitespace-pre-wrap">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <article className={cn('bg-white border p-4', highlight ? 'border-amber-200 bg-amber-50/40' : 'border-stone-200')}>
      <p className="text-[11px] text-stone-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-light text-stone-900 mt-1">{value}</p>
    </article>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9l1-12" />
    </svg>
  )
}
