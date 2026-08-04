'use client'

import { useEffect, useState } from 'react'
import { Property } from '@/types'
import { MAX_FEATURED_ON_HOME, MAX_PROPERTY_IMAGES } from '@/lib/property-constants'
import { formatPrice, OPERATION_LABELS, PROPERTY_OPERATIONS, PROPERTY_PROVINCES, PROPERTY_STATUSES, PROPERTY_TYPES, STATUS_BADGE_CLASSES_ADMIN, STATUS_LABELS, TYPE_LABELS } from '@/lib/utils'
import { getPropertyProvince } from '@/lib/property-location'
import { getPropertyExtras, type PropertyExtraId } from '@/lib/property-extras'
import { ExtrasDropdown } from '@/components/admin/ExtrasDropdown'
import { AdminLocationPicker } from '@/components/admin/AdminLocationPicker'
import { cn } from '@/lib/utils'

type ImageItem =
  | { id: string; kind: 'existing'; url: string }
  | { id: string; kind: 'new'; file: File; previewUrl: string }

function safeParseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  }
}

const emptyForm = {
  title: '',
  price: '',
  location: '',
  address: '',
  latitude: '',
  longitude: '',
  province: '',
  type: 'piso',
  operation: 'venta',
  status: 'disponible',
  description: '',
  fotocasaUrl: '',
  bedrooms: '',
  bathrooms: '',
  sqMeters: '',
  availability: '',
  hotWater: '',
  heating: '',
  condition: '',
  propertyAge: '',
  floor: '',
  extras: [] as PropertyExtraId[],
  energyRating: '',
  energyValue: '',
  emissionsRating: '',
  emissionsValue: '',
  featured: false,
}

const statusColors = STATUS_BADGE_CLASSES_ADMIN

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [pwError, setPwError] = useState(false)

  const [properties, setProperties] = useState<Property[]>([])
  const [adminProvinceFilter, setAdminProvinceFilter] = useState('')
  const [adminArchiveFilter, setAdminArchiveFilter] = useState<'active' | 'archived' | 'all'>('active')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [initialImageUrls, setInitialImageUrls] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [archiveConfirm, setArchiveConfirm] = useState<{ id: string; action: 'archive' | 'restore' } | null>(null)
  const [featuredCapError, setFeaturedCapError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pwErrorMsg, setPwErrorMsg] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)

  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'include' })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        return data
      })
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
      if (res.status === 429) {
        setPwErrorMsg(data.error || 'Demasiados intentos. Espera unos minutos.')
        return
      }
      if (res.status === 403) {
        setPwErrorMsg('Acceso no permitido desde esta red.')
        return
      }
      setPwError(true)
      setPwErrorMsg(data.error || 'Contraseña o PIN incorrectos')
    } catch {
      setPwError(true)
      setPwErrorMsg('No se pudo conectar. Inténtalo de nuevo.')
    }
  }

  // Fetch
  const fetchProperties = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/propiedades', { credentials: 'include' })
      const data = await res.json().catch(() => ([]))
      if (res.ok && Array.isArray(data)) setProperties(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) fetchProperties()
  }, [authed])

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name === 'featured') {
        if (checked) {
          const selfFeatured = editingId ? properties.some((p) => p.id === editingId && p.featured) : false
          const nFeatured = properties.filter((p) => p.featured && !p.archived).length
          if (!selfFeatured && nFeatured >= MAX_FEATURED_ON_HOME) {
            setFeaturedCapError(
              `Solo puedes tener ${MAX_FEATURED_ON_HOME} destacadas en la home. Quita la marca en otra propiedad primero.`
            )
            return
          }
        } else {
          setFeaturedCapError(null)
        }
      }
      setForm({ ...form, [name]: checked })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setImageItems([])
    setInitialImageUrls([])
    setFeaturedCapError(null)
    setSubmitError(null)
    setShowForm(true)
  }

  const openEdit = (p: Property) => {
    const urls = safeParseImages(p.images)
    setForm({
      title: p.title,
      price: p.price.toString(),
      location: p.location,
      address: p.address || '',
      latitude: p.latitude?.toString() || '',
      longitude: p.longitude?.toString() || '',
      province: p.province || getPropertyProvince(p) || '',
      type: p.type,
      operation: p.operation || 'venta',
      status: p.status,
      description: p.description,
      fotocasaUrl: p.fotocasaUrl || '',
      bedrooms: p.bedrooms?.toString() || '',
      bathrooms: p.bathrooms?.toString() || '',
      sqMeters: p.sqMeters?.toString() || '',
      availability: p.availability || '',
      hotWater: p.hotWater || '',
      heating: p.heating && !['sí', 'si', 's'].includes(p.heating.trim().toLowerCase()) ? p.heating : '',
      condition: p.condition || '',
      propertyAge: p.propertyAge || '',
      floor: p.floor || '',
      extras: getPropertyExtras(p),
      energyRating: p.energyRating || '',
      energyValue: p.energyValue?.toString() || '',
      emissionsRating: p.emissionsRating || '',
      emissionsValue: p.emissionsValue?.toString() || '',
      featured: p.featured,
    })
    setEditingId(p.id)
    setInitialImageUrls(urls)
    setImageItems(urls.map((url) => ({ id: crypto.randomUUID(), kind: 'existing', url })))
    setFeaturedCapError(null)
    setSubmitError(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp'])
    const maxBytes = 5 * 1024 * 1024
    const next: ImageItem[] = []
    for (const f of Array.from(files)) {
      if (!allowed.has(f.type)) continue
      if (f.size > maxBytes) continue
      next.push({ id: crypto.randomUUID(), kind: 'new', file: f, previewUrl: URL.createObjectURL(f) })
    }
    if (next.length) setImageItems((prev) => [...prev, ...next].slice(0, MAX_PROPERTY_IMAGES))
  }

  const removeItem = async (id: string) => {
    const item = imageItems.find((x) => x.id === id)
    if (!item) return
    if (item.kind === 'new') {
      URL.revokeObjectURL(item.previewUrl)
    }
    setImageItems((prev) => prev.filter((x) => x.id !== id))
  }

  const moveItem = (from: number, to: number) => {
    setImageItems((prev) => {
      const next = [...prev]
      const [it] = next.splice(from, 1)
      next.splice(to, 0, it)
      return next
    })
  }

  const uploadNewImages = async (propertyId: string) => {
    const results: { id: string; url: string }[] = []
    for (const item of imageItems) {
      if (item.kind !== 'new') continue
      const fd = new FormData()
      fd.append('file', item.file)
      const res = await fetch(`/api/uploads/property-image?propertyId=${encodeURIComponent(propertyId)}`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (!res.ok) {
        throw new Error('Error al subir imagen')
      }
      const data = await res.json() as { url: string }
      results.push({ id: item.id, url: data.url })
    }
    return results
  }

  const deleteRemovedImages = async (_finalUrls: string[]) => {
    // En modo local las imágenes se gestionan en public/images y data/properties.json
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSubmitError(null)
    try {
      const existingUrlsInOrder = imageItems
        .filter((i): i is Extract<ImageItem, { kind: 'existing' }> => i.kind === 'existing')
        .map((i) => i.url)

      // 1) Crear/actualizar propiedad (sin nuevas imágenes aún)
      if (!editingId) {
        const createRes = await fetch('/api/propiedades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...form, images: existingUrlsInOrder }),
        })
        if (!createRes.ok) {
          const errBody = (await createRes.json().catch(() => ({}))) as { error?: string }
          setSubmitError(errBody.error || 'Error al crear propiedad')
          return
        }
        const created = await createRes.json() as { id: string }
        const propertyId = created.id

        // 2) Subir imágenes nuevas y actualizar orden final
        const uploaded = await uploadNewImages(propertyId)
        const finalUrls = imageItems.map((it) => {
          if (it.kind === 'existing') return it.url
          const match = uploaded.find((u) => u.id === it.id)
          return match?.url || ''
        }).filter(Boolean)

        const putAfterCreate = await fetch(`/api/propiedades/${propertyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...form, images: finalUrls }),
        })
        if (!putAfterCreate.ok) {
          const errBody = (await putAfterCreate.json().catch(() => ({}))) as { error?: string }
          setSubmitError(errBody.error || 'Error al guardar la propiedad')
          return
        }
      } else {
        const propertyId = editingId

        // Subir nuevas primero
        const uploaded = await uploadNewImages(propertyId)
        const finalUrls = imageItems.map((it) => {
          if (it.kind === 'existing') return it.url
          const match = uploaded.find((u) => u.id === it.id)
          return match?.url || ''
        }).filter(Boolean)

        const putRes = await fetch(`/api/propiedades/${propertyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...form, images: finalUrls }),
        })
        if (!putRes.ok) {
          const errBody = (await putRes.json().catch(() => ({}))) as { error?: string }
          setSubmitError(errBody.error || 'Error al guardar la propiedad')
          return
        }

        await deleteRemovedImages(finalUrls)
      }

      setShowForm(false)
      setEditingId(null)
      await fetchProperties()
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async (id: string, archived: boolean) => {
    await fetch(`/api/propiedades/${id}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ archived }),
    })
    setArchiveConfirm(null)
    await fetchProperties()
  }

  const sortedProperties = [...properties].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (orderDiff !== 0) return orderDiff
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const visibleProperties = sortedProperties
    .filter((property) => {
      if (adminArchiveFilter === 'active') return !property.archived
      if (adminArchiveFilter === 'archived') return property.archived
      return true
    })
    .filter((property) => !adminProvinceFilter || getPropertyProvince(property) === adminProvinceFilter)

  const moveProperty = async (id: string, direction: 'up' | 'down') => {
    if (adminProvinceFilter || adminArchiveFilter !== 'active') return
    const ordered = sortedProperties.filter((property) => !property.archived)
    const index = ordered.findIndex((property) => property.id === id)
    if (index < 0) return
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= ordered.length) return

    const next = [...ordered]
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]

    setReordering(true)
    try {
      const res = await fetch('/api/propiedades/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: next.map((property) => property.id) }),
      })
      if (res.ok) {
        setProperties(next.map((property, sortOrder) => ({ ...property, sortOrder })))
      } else {
        await fetchProperties()
      }
    } finally {
      setReordering(false)
    }
  }

  // PASSWORD SCREEN
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
            <button onClick={login} className="btn-primary w-full py-3 text-sm">
              Entrar
            </button>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-stone-400 text-center">
                Local: <code className="bg-stone-100 px-1">ADMIN_PASSWORD</code> y <code className="bg-stone-100 px-1">ADMIN_PIN</code> en <code className="bg-stone-100 px-1">.env</code>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-stone-900">Propiedades</h1>
          <p className="text-stone-400 text-sm mt-1">{visibleProperties.length} inmueble{visibleProperties.length !== 1 ? 's' : ''} en total</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-stone-500">
            Visibilidad
            <select
              value={adminArchiveFilter}
              onChange={(e) => setAdminArchiveFilter(e.target.value as 'active' | 'archived' | 'all')}
              className="border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
            >
              <option value="active">Publicadas</option>
              <option value="archived">Archivadas</option>
              <option value="all">Todas</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-stone-500">
            Provincia
            <select
              value={adminProvinceFilter}
              onChange={(e) => setAdminProvinceFilter(e.target.value)}
              className="border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
            >
              <option value="">Todas</option>
              {PROPERTY_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
              setAuthed(false)
            }}
            className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
          >
            Cerrar sesión
          </button>
          <button onClick={openCreate} className="btn-primary text-xs px-5 py-2.5">
            + Nueva propiedad
          </button>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white border border-stone-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium text-stone-900">
              {editingId ? 'Editar propiedad' : 'Nueva propiedad'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-900 text-xl leading-none">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-1.5">Título *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Precio (€) *</label>
                <input name="price" value={form.price} onChange={handleChange} required type="number"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Ubicación *</label>
                <input name="location" value={form.location} onChange={handleChange} required
                  placeholder="Ej: Mar Rojo – Tarifa, Cádiz"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
              </div>

              <AdminLocationPicker
                address={form.address}
                province={form.province}
                latitude={form.latitude}
                longitude={form.longitude}
                onAddressChange={(value) => setForm((prev) => ({ ...prev, address: value }))}
                onCoordinatesChange={(latitude, longitude) =>
                  setForm((prev) => ({ ...prev, latitude, longitude }))
                }
              />

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Provincia *</label>
                <select name="province" value={form.province} onChange={handleChange} required
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 bg-white">
                  <option value="">Seleccionar provincia</option>
                  {PROPERTY_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Tipo</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 bg-white">
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Operación</label>
                <select name="operation" value={form.operation} onChange={handleChange}
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 bg-white">
                  {PROPERTY_OPERATIONS.map(op => (
                    <option key={op} value={op}>{OPERATION_LABELS[op]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Estado</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 bg-white">
                  {PROPERTY_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">m²</label>
                <input name="sqMeters" value={form.sqMeters} onChange={handleChange} type="number"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Habitaciones</label>
                <input name="bedrooms" value={form.bedrooms} onChange={handleChange} type="number"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Baños</label>
                <input name="bathrooms" value={form.bathrooms} onChange={handleChange} type="number"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Link portal inmobiliario</label>
                <input name="fotocasaUrl" value={form.fotocasaUrl} onChange={handleChange} type="text"
                  placeholder="Enlace a Fotocasa, Idealista, etc. (con o sin https://)"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-1.5">Descripción *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-2">Imágenes</label>
                <div className="border border-stone-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs text-stone-400">
                      Sube hasta {MAX_PROPERTY_IMAGES} imágenes (JPG/PNG/WebP, máx. 5MB cada una). Arrastra para reordenar.
                    </div>
                    <label className="btn-outline text-[11px] px-4 py-2 cursor-pointer">
                      + Añadir fotos
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                      />
                    </label>
                  </div>

                  {imageItems.length === 0 ? (
                    <div className="text-sm text-stone-400 py-6 text-center">
                      No hay imágenes aún.
                    </div>
                  ) : (
                    <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imageItems.map((item, idx) => {
                        const preview = item.kind === 'existing' ? item.url : item.previewUrl
                        return (
                          <li
                            key={item.id}
                            className="border border-stone-200 bg-stone-50"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', String(idx))
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault()
                              const from = Number(e.dataTransfer.getData('text/plain'))
                              if (!Number.isFinite(from)) return
                              if (from === idx) return
                              moveItem(from, idx)
                            }}
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={preview} alt="" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-stone-700 text-xs px-2 py-1 border border-stone-200"
                              >
                                Quitar
                              </button>
                              {idx === 0 && (
                                <span className="absolute bottom-2 left-2 bg-gold text-white text-[10px] px-2 py-1">
                                  Principal
                                </span>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 border border-stone-100 p-4">
                <p className="text-xs text-stone-500 tracking-wide mb-4">Características opcionales</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Disponibilidad</label>
                    <input name="availability" value={form.availability} onChange={handleChange}
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Agua caliente</label>
                    <input name="hotWater" value={form.hotWater} onChange={handleChange}
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Tipo de calefacción (opcional)</label>
                    <input name="heating" value={form.heating} onChange={handleChange}
                      placeholder="Ej: Gas natural"
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Estado</label>
                    <input name="condition" value={form.condition} onChange={handleChange}
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Antigüedad</label>
                    <input name="propertyAge" value={form.propertyAge} onChange={handleChange}
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Planta</label>
                    <input name="floor" value={form.floor} onChange={handleChange}
                      placeholder="Ej: 6º"
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-stone-500 block mb-1.5">Extras del inmueble</label>
                    <ExtrasDropdown
                      value={form.extras}
                      onChange={(extras) => setForm({ ...form, extras })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Etiqueta energética</label>
                    <input name="energyRating" value={form.energyRating} onChange={handleChange}
                      placeholder="Ej: G"
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Valor energía (kg CO₂/m²/año)</label>
                    <input name="energyValue" value={form.energyValue} onChange={handleChange} type="number" step="any"
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Etiqueta emisiones</label>
                    <input name="emissionsRating" value={form.emissionsRating} onChange={handleChange}
                      placeholder="Ej: G"
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 block mb-1.5">Valor emisiones (kg CO₂/m²/año)</label>
                    <input name="emissionsValue" value={form.emissionsValue} onChange={handleChange} type="number" step="any"
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" name="featured" id="featured"
                  checked={form.featured} onChange={handleChange}
                  className="accent-stone-900 w-4 h-4" />
                <label htmlFor="featured" className="text-sm text-stone-600 cursor-pointer">
                  Destacar en home (máx. {MAX_FEATURED_ON_HOME})
                </label>
              </div>
              {featuredCapError && (
                <p className="text-red-600 text-xs -mt-2">{featuredCapError}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-stone-100">
              {submitError && (
                <p className="text-red-600 text-sm">{submitError}</p>
              )}
              <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-xs px-6 py-2.5 disabled:opacity-50">
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear propiedad'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                Cancelar
              </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-stone-200 overflow-hidden">
        {!adminProvinceFilter && adminArchiveFilter === 'active' && properties.filter((p) => !p.archived).length > 1 && (
          <p className="border-b border-stone-100 px-4 py-2.5 text-xs text-stone-500">
            Usa las flechas para cambiar el orden en la página de propiedades. Las nuevas se añaden al final.
          </p>
        )}
        {(adminProvinceFilter || adminArchiveFilter !== 'active') && (
          <p className="border-b border-stone-100 px-4 py-2.5 text-xs text-stone-400">
            {adminArchiveFilter !== 'active'
              ? 'Muestra solo publicadas para reordenar el catálogo.'
              : 'Quita el filtro de provincia para reordenar el catálogo.'}
          </p>
        )}
        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Cargando...</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-stone-400 mb-4">No hay propiedades aún.</p>
            <button onClick={openCreate} className="btn-primary text-xs px-5 py-2.5">
              Crear la primera
            </button>
          </div>
        ) : visibleProperties.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-stone-400 mb-4">No hay propiedades en esta provincia.</p>
            <button type="button" onClick={() => setAdminProvinceFilter('')} className="text-sm text-stone-600 hover:text-stone-900">
              Ver todas
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  {['Orden', 'Título', 'Precio', 'Operación', 'Tipo', 'Estado', 'Provincia', 'Ubicación', 'Dest.', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-xs text-stone-500 font-medium px-4 py-3 tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visibleProperties.map((p, index) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveProperty(p.id, 'up')}
                          disabled={reordering || adminProvinceFilter !== '' || adminArchiveFilter !== 'active' || index === 0}
                          className="h-7 w-7 border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Subir"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProperty(p.id, 'down')}
                          disabled={reordering || adminProvinceFilter !== '' || adminArchiveFilter !== 'active' || index === visibleProperties.length - 1}
                          className="h-7 w-7 border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Bajar"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-stone-900 line-clamp-1 max-w-[200px] block">
                        {p.title}
                      </span>
                      {p.archived && (
                        <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-stone-500 bg-stone-100 px-1.5 py-0.5">
                          Archivada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {formatPrice(p.price, p.operation)}
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {OPERATION_LABELS[p.operation || 'venta'] || p.operation || 'Venta'}
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {TYPE_LABELS[p.type] || p.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 font-medium', statusColors[p.status] || '')}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs">
                      {getPropertyProvince(p) || '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs max-w-[150px] truncate">
                      {p.location}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.featured ? '⭐' : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          Editar
                        </button>
                        {p.archived ? (
                          <button
                            onClick={() => setArchiveConfirm({ id: p.id, action: 'restore' })}
                            className="text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                          >
                            Reactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => setArchiveConfirm({ id: p.id, action: 'archive' })}
                            className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
                          >
                            Archivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {archiveConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white p-8 max-w-sm w-full">
            <h3 className="font-medium text-stone-900 mb-2">
              {archiveConfirm.action === 'archive' ? '¿Archivar propiedad?' : '¿Reactivar propiedad?'}
            </h3>
            <p className="text-stone-500 text-sm mb-6">
              {archiveConfirm.action === 'archive'
                ? 'Dejará de mostrarse en la web, pero conservarás todos los datos para reactivarla cuando quieras.'
                : 'Volverá a mostrarse en la web pública.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleArchive(archiveConfirm.id, archiveConfirm.action === 'archive')}
                className="btn-primary text-xs px-5 py-2.5"
              >
                {archiveConfirm.action === 'archive' ? 'Archivar' : 'Reactivar'}
              </button>
              <button
                onClick={() => setArchiveConfirm(null)}
                className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
