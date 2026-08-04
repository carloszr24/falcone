'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [contacts, setContacts] = useState(ADMIN_CONTACTS)
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<'all' | ContactStage>('all')
  const [profileFilter, setProfileFilter] = useState<'all' | ContactProfile>('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'linked' | 'none' | string>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [newContact, setNewContact] = useState({
    fullName: '',
    age: '',
    phone: '',
    email: '',
    profile: 'familia' as ContactProfile,
    zone: '',
    budgetLabel: '',
    stage: 'potencial' as ContactStage,
    calledFor: '',
    propertyId: 'none',
    notes: '',
  })

  const zones = useMemo(() => {
    return Array.from(new Set(contacts.map((c) => c.zone))).sort((a, b) => a.localeCompare(b, 'es'))
  }, [contacts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return contacts.filter((contact) => {
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
  }, [contacts, query, stageFilter, profileFilter, zoneFilter, propertyFilter])

  const stats = useMemo(
    () => ({
      total: contacts.length,
      activos: contacts.filter((c) => c.stage === 'activo').length,
      proximos: contacts.filter((c) => c.stage === 'proximo').length,
      conPropiedad: contacts.filter((c) => Boolean(c.propertyId)).length,
    }),
    [contacts]
  )

  const activeFilterCount = [
    query.trim() !== '',
    stageFilter !== 'all',
    profileFilter !== 'all',
    zoneFilter !== 'all',
    propertyFilter !== 'all',
  ].filter(Boolean).length

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

  function handleContactChange<K extends keyof typeof newContact>(field: K, value: (typeof newContact)[K]) {
    setNewContact((current) => ({ ...current, [field]: value }))
  }

  function handleCreateContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const contact = {
      id: `c${Date.now()}`,
      fullName: newContact.fullName.trim(),
      age: Number(newContact.age) || 0,
      phone: newContact.phone.trim(),
      email: newContact.email.trim(),
      stage: newContact.stage,
      profile: newContact.profile,
      zone: newContact.zone.trim(),
      budgetLabel: newContact.budgetLabel.trim(),
      calledFor: newContact.calledFor.trim(),
      propertyId: newContact.propertyId === 'none' ? null : newContact.propertyId,
      notes: newContact.notes.trim(),
      lastContactAt: new Date().toISOString(),
    }

    setContacts((current) => [contact, ...current])
    setExpandedIds((current) => [contact.id, ...current.filter((item) => item !== contact.id)])
    setNewContact({
      fullName: '',
      age: '',
      phone: '',
      email: '',
      profile: 'familia',
      zone: '',
      budgetLabel: '',
      stage: 'potencial',
      calledFor: '',
      propertyId: 'none',
      notes: '',
    })
    setFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-stone-900">Contactos</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-500">
            Base de potenciales clientes (próximos o futuros): perfil, zona, presupuesto y propiedad de interés.
            Pensado para volcar y enriquecer vuestra propia agenda comercial.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-stone-700 shadow-sm shadow-stone-100/40 transition hover:border-brand-burgundy/20 hover:text-brand-burgundy"
        >
          <PlusIcon />
          <span>Nuevo contacto</span>
        </button>
      </div>

      {mounted &&
        formOpen &&
        createPortal(
          <AdminModal onClose={() => setFormOpen(false)} title="Nuevo contacto" eyebrow="Alta rápida CRM">
            <p className="mt-1 text-sm font-light text-stone-500">
              Registra nuevos leads con el mismo nivel de detalle que las fichas de ejemplo.
            </p>
            <form onSubmit={handleCreateContact} className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <Label>Nombre completo</Label>
                  <TextInput
                    value={newContact.fullName}
                    onChange={(e) => handleContactChange('fullName', e.target.value)}
                    placeholder="Ej. Marta Ruiz"
                    required
                  />
                </Field>
                <Field>
                  <Label>Edad</Label>
                  <TextInput
                    type="number"
                    min="18"
                    max="99"
                    value={newContact.age}
                    onChange={(e) => handleContactChange('age', e.target.value)}
                    placeholder="42"
                    required
                  />
                </Field>
                <Field>
                  <Label>Teléfono</Label>
                  <TextInput
                    value={newContact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="600 00 00 00"
                    required
                  />
                </Field>
                <Field>
                  <Label>Email</Label>
                  <TextInput
                    type="email"
                    value={newContact.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="cliente@email.com"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field>
                  <Label>Perfil buscado</Label>
                  <SelectInput
                    value={newContact.profile}
                    onChange={(e) => handleContactChange('profile', e.target.value as ContactProfile)}
                  >
                    {(Object.keys(CONTACT_PROFILE_LABELS) as ContactProfile[]).map((profile) => (
                      <option key={profile} value={profile}>
                        {CONTACT_PROFILE_LABELS[profile]}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field>
                  <Label>Zona preferida</Label>
                  <TextInput
                    value={newContact.zone}
                    onChange={(e) => handleContactChange('zone', e.target.value)}
                    placeholder="Los Lances / centro"
                    required
                  />
                </Field>
                <Field>
                  <Label>Presupuesto</Label>
                  <TextInput
                    value={newContact.budgetLabel}
                    onChange={(e) => handleContactChange('budgetLabel', e.target.value)}
                    placeholder="320–380.000 €"
                    required
                  />
                </Field>
                <Field>
                  <Label>Etapa / estado</Label>
                  <SelectInput
                    value={newContact.stage}
                    onChange={(e) => handleContactChange('stage', e.target.value as ContactStage)}
                  >
                    {(Object.keys(CONTACT_STAGE_LABELS) as ContactStage[]).map((stage) => (
                      <option key={stage} value={stage}>
                        {CONTACT_STAGE_LABELS[stage]}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <Label>Llamó para...</Label>
                  <TextAreaInput
                    value={newContact.calledFor}
                    onChange={(e) => handleContactChange('calledFor', e.target.value)}
                    placeholder="Qué busca, contexto de la llamada o motivación principal"
                    required
                  />
                </Field>
                <div className="grid gap-4">
                  <Field>
                    <Label>Propiedad relacionada</Label>
                    <SelectInput
                      value={newContact.propertyId}
                      onChange={(e) => handleContactChange('propertyId', e.target.value)}
                    >
                      <option value="none">Sin vincular</option>
                      {Object.entries(PROPERTY_LABELS).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field>
                    <Label>Notas</Label>
                    <TextAreaInput
                      value={newContact.notes}
                      onChange={(e) => handleContactChange('notes', e.target.value)}
                      placeholder="Detalles relevantes, timing, objeciones, siguientes pasos..."
                      required
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-stone-400">
                  Al guardar, el contacto se añade arriba del listado y queda listo para filtrar.
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
                    Guardar contacto
                  </button>
                </div>
              </div>
            </form>
          </AdminModal>,
          document.body
        )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Activos" value={String(stats.activos)} />
        <StatCard label="Próximos" value={String(stats.proximos)} />
        <StatCard label="Con propiedad" value={String(stats.conPropiedad)} />
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-100/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, zona, teléfono, notas…"
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
              {filtered.length} de {contacts.length} contactos
            </p>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-4 grid gap-4 border-t border-stone-100 pt-4">
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
        )}
      </section>

      <div className="space-y-3">
        {filtered.map((contact) => (
          <article
            key={contact.id}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-100/40 transition-all hover:-translate-y-0.5 hover:border-brand-burgundy/25 hover:shadow-md"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-light text-stone-900">{contact.fullName}</h2>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]',
                        stageBadgeClass(contact.stage)
                      )}
                    >
                      {CONTACT_STAGE_LABELS[contact.stage]}
                    </span>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                      {contact.age} años
                    </span>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                      {contact.zone}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                    <InfoPill label="Tel" value={contact.phone} />
                    <InfoPill label="Perfil" value={CONTACT_PROFILE_LABELS[contact.profile]} />
                    <InfoPill label="Presupuesto" value={contact.budgetLabel} />
                    <InfoPill
                      label="Propiedad"
                      value={
                        contact.propertyId ? PROPERTY_LABELS[contact.propertyId] ?? contact.propertyId : 'Sin vincular'
                      }
                    />
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm font-light leading-6 text-stone-700">{contact.calledFor}</p>
                </div>

                <div className="flex items-center justify-between gap-3 lg:block lg:shrink-0 lg:text-right">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Último contacto</p>
                    <p className="mt-1 text-sm font-light text-stone-600">{formatDate(contact.lastContactAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(contact.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-stone-600 transition hover:border-brand-burgundy/20 hover:text-brand-burgundy"
                  >
                    <span>{expandedIds.includes(contact.id) ? 'Ocultar' : 'Detalles'}</span>
                    <ChevronIcon open={expandedIds.includes(contact.id)} />
                  </button>
                </div>
              </div>

              {expandedIds.includes(contact.id) && (
                <div className="grid gap-4 border-t border-stone-100 pt-3">
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
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

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <DetailBlock label="Llamó para…">{contact.calledFor}</DetailBlock>
                    <DetailBlock label="Notas">{contact.notes}</DetailBlock>
                  </div>
                </div>
              )}
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

function Field({ children }: { children: React.ReactNode }) {
  return <label className="grid gap-1.5">{children}</label>
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
