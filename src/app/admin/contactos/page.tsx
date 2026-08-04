'use client'

import { useMemo, useState } from 'react'
import {
  ADMIN_CONTACTS,
  CONTACT_PROFILE_LABELS,
  CONTACT_STAGE_LABELS,
  type ContactProfile,
  type ContactStage,
} from '@/data/admin-contacts'
import { cn } from '@/lib/utils'

const PROPERTY_LABELS: Record<string, string> = {
  'piso-mar-rojo-tarifa': 'Piso Mar Rojo – Tarifa',
  'triplex-trafalgar-tarifa': 'Dúplex/Triplex Trafalgar – Tarifa',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

function stageBadgeClass(stage: ContactStage) {
  if (stage === 'activo') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (stage === 'proximo') return 'bg-blue-50 text-blue-700 border-blue-100'
  if (stage === 'futuro') return 'bg-amber-50 text-amber-800 border-amber-100'
  return 'bg-stone-100 text-stone-600 border-stone-200'
}

export default function AdminContactosPage() {
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<'all' | ContactStage>('all')
  const [profileFilter, setProfileFilter] = useState<'all' | ContactProfile>('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'linked' | 'none' | string>('all')

  const zones = useMemo(() => {
    return Array.from(new Set(ADMIN_CONTACTS.map((c) => c.zone))).sort((a, b) => a.localeCompare(b, 'es'))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ADMIN_CONTACTS.filter((contact) => {
      if (stageFilter !== 'all' && contact.stage !== stageFilter) return false
      if (profileFilter !== 'all' && contact.profile !== profileFilter) return false
      if (zoneFilter !== 'all' && contact.zone !== zoneFilter) return false
      if (propertyFilter === 'linked' && !contact.propertyId) return false
      if (propertyFilter === 'none' && contact.propertyId) return false
      if (
        propertyFilter !== 'all' &&
        propertyFilter !== 'linked' &&
        propertyFilter !== 'none' &&
        contact.propertyId !== propertyFilter
      ) {
        return false
      }
      if (!q) return true
      const haystack = [
        contact.fullName,
        contact.email,
        contact.phone,
        contact.zone,
        contact.calledFor,
        contact.notes,
        CONTACT_PROFILE_LABELS[contact.profile],
        contact.propertyId ? PROPERTY_LABELS[contact.propertyId] ?? contact.propertyId : '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    }).sort((a, b) => new Date(b.lastContactAt).getTime() - new Date(a.lastContactAt).getTime())
  }, [query, stageFilter, profileFilter, zoneFilter, propertyFilter])

  const stats = useMemo(
    () => ({
      total: ADMIN_CONTACTS.length,
      activos: ADMIN_CONTACTS.filter((c) => c.stage === 'activo').length,
      proximos: ADMIN_CONTACTS.filter((c) => c.stage === 'proximo').length,
      conPropiedad: ADMIN_CONTACTS.filter((c) => Boolean(c.propertyId)).length,
    }),
    []
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-stone-900">Contactos</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500">
          Base de potenciales clientes (próximos o futuros): perfil, zona, presupuesto y propiedad de interés.
          Pensado para volcar y enriquecer vuestra propia agenda comercial.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Activos" value={String(stats.activos)} />
        <StatCard label="Próximos" value={String(stats.proximos)} />
        <StatCard label="Con propiedad" value={String(stats.conPropiedad)} />
      </section>

      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, zona, teléfono, notas…"
          className="w-full border border-stone-200 px-4 py-3 text-sm font-light focus:border-brand-burgundy focus:outline-none"
        />

        <FilterRow label="Etapa">
          <Chip active={stageFilter === 'all'} onClick={() => setStageFilter('all')}>
            Todas
          </Chip>
          {(Object.keys(CONTACT_STAGE_LABELS) as ContactStage[]).map((stage) => (
            <Chip key={stage} active={stageFilter === stage} onClick={() => setStageFilter(stage)}>
              {CONTACT_STAGE_LABELS[stage]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Perfil que busca">
          <Chip active={profileFilter === 'all'} onClick={() => setProfileFilter('all')}>
            Todos
          </Chip>
          {(Object.keys(CONTACT_PROFILE_LABELS) as ContactProfile[]).map((profile) => (
            <Chip key={profile} active={profileFilter === profile} onClick={() => setProfileFilter(profile)}>
              {CONTACT_PROFILE_LABELS[profile]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Zona">
          <Chip active={zoneFilter === 'all'} onClick={() => setZoneFilter('all')}>
            Todas
          </Chip>
          {zones.map((zone) => (
            <Chip key={zone} active={zoneFilter === zone} onClick={() => setZoneFilter(zone)}>
              {zone}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Propiedad vinculada">
          <Chip active={propertyFilter === 'all'} onClick={() => setPropertyFilter('all')}>
            Todas
          </Chip>
          <Chip active={propertyFilter === 'linked'} onClick={() => setPropertyFilter('linked')}>
            Con propiedad
          </Chip>
          <Chip active={propertyFilter === 'none'} onClick={() => setPropertyFilter('none')}>
            Sin propiedad
          </Chip>
          {Object.entries(PROPERTY_LABELS).map(([id, label]) => (
            <Chip key={id} active={propertyFilter === id} onClick={() => setPropertyFilter(id)}>
              {label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      <p className="text-xs text-stone-400">
        Mostrando {filtered.length} de {ADMIN_CONTACTS.length} contactos
      </p>

      <div className="space-y-3">
        {filtered.map((contact) => (
          <article
            key={contact.id}
            className="rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-brand-burgundy/25"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-light text-stone-900">{contact.fullName}</h2>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em]',
                      stageBadgeClass(contact.stage)
                    )}
                  >
                    {CONTACT_STAGE_LABELS[contact.stage]}
                  </span>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                    {contact.age} años
                  </span>
                </div>

                <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  <Row label="Teléfono" value={contact.phone} />
                  <Row label="Email" value={contact.email} />
                  <Row label="Perfil" value={CONTACT_PROFILE_LABELS[contact.profile]} />
                  <Row label="Zona" value={contact.zone} />
                  <Row label="Presupuesto" value={contact.budgetLabel} />
                  <Row
                    label="Propiedad"
                    value={
                      contact.propertyId
                        ? PROPERTY_LABELS[contact.propertyId] ?? contact.propertyId
                        : 'Sin vincular'
                    }
                  />
                </dl>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Llamó para…</p>
                  <p className="mt-1 text-sm font-light text-stone-700">{contact.calledFor}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Notas</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-stone-600">{contact.notes}</p>
                </div>
              </div>

              <div className="shrink-0 text-left lg:text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Último contacto</p>
                <p className="mt-1 text-sm font-light text-stone-600">{formatDate(contact.lastContactAt)}</p>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center text-sm text-stone-400">
            No hay contactos con esos filtros.
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
