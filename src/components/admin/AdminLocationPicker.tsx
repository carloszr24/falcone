'use client'

import { useEffect, useRef, useState } from 'react'
import { PropertyMap } from '@/components/maps/PropertyMapLoader'
import { cn } from '@/lib/utils'

type GeocodeSuggestion = {
  id: string
  label: string
  subtitle: string
  latitude: number
  longitude: number
  displayName: string
}

type Props = {
  address: string
  province: string
  latitude: string
  longitude: string
  onAddressChange: (value: string) => void
  onCoordinatesChange: (latitude: string, longitude: string) => void
}

export function AdminLocationPicker({
  address,
  province,
  latitude,
  longitude,
  onAddressChange,
  onCoordinatesChange,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipSuggestRef = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const onCoordinatesChangeRef = useRef(onCoordinatesChange)
  const onAddressChangeRef = useRef(onAddressChange)

  onCoordinatesChangeRef.current = onCoordinatesChange
  onAddressChangeRef.current = onAddressChange

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const trimmed = address.trim()
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false
      return
    }

    if (trimmed.length < 3) {
      setSuggestions([])
      setSuggestOpen(false)
      setSuggestLoading(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true)
      setSuggestOpen(true)

      try {
        const params = new URLSearchParams({ address: trimmed, suggest: '1' })
        if (province.trim()) params.set('province', province.trim())
        const res = await fetch(`/api/geocode?${params.toString()}`, { credentials: 'include' })
        const data = (await res.json().catch(() => ({}))) as { suggestions?: GeocodeSuggestion[] }

        if (!res.ok) {
          setSuggestions([])
          return
        }

        setSuggestions(data.suggestions ?? [])
      } catch {
        setSuggestions([])
      } finally {
        setSuggestLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [address, province])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setSuggestOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const selectSuggestion = (item: GeocodeSuggestion) => {
    skipSuggestRef.current = true
    onAddressChangeRef.current(item.displayName)
    onCoordinatesChangeRef.current(String(item.latitude), String(item.longitude))
    setSuggestions([])
    setSuggestOpen(false)
    setStatus('ok')
    setMessage(`Ubicación seleccionada: ${item.label}`)
  }

  const lat = parseFloat(latitude)
  const lng = parseFloat(longitude)
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng)

  return (
    <div className="md:col-span-2 space-y-3">
      <div ref={rootRef} className="relative">
        <label className="text-xs text-stone-500 block mb-1.5">Dirección para el mapa</label>
        <input
          value={address}
          onChange={(e) => {
            setStatus('idle')
            setMessage(null)
            onAddressChange(e.target.value)
          }}
          onFocus={() => {
            if (suggestions.length > 0) setSuggestOpen(true)
          }}
          onBlur={() => {
            blurTimerRef.current = setTimeout(() => setSuggestOpen(false), 150)
          }}
          placeholder="Ej: Urb. El Acebuche, Tarifa"
          autoComplete="off"
          className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900"
        />
        <p className="mt-1.5 text-xs text-stone-400">
          Empiece a escribir la calle o el pueblo y elija una opción de la lista. Después puede arrastrar el pin para afinar.
        </p>

        {suggestOpen && (suggestLoading || suggestions.length > 0) && (
          <div className="absolute left-0 right-0 top-[calc(100%-1.25rem)] z-30 mt-1 max-h-64 overflow-y-auto border border-stone-200 bg-white shadow-[0_8px_24px_rgba(28,25,23,0.08)]">
            {suggestLoading && suggestions.length === 0 && (
              <p className="px-3 py-2.5 text-xs text-stone-400">Buscando direcciones…</p>
            )}
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(item)}
                className={cn(
                  'block w-full border-b border-stone-100 px-3 py-2.5 text-left transition-colors last:border-b-0',
                  'hover:bg-stone-50 focus:bg-stone-50 focus:outline-none'
                )}
              >
                <span className="block text-sm font-light text-stone-900">{item.label}</span>
                <span className="mt-0.5 block text-xs font-light text-stone-500 line-clamp-2">{item.subtitle}</span>
              </button>
            ))}
            {!suggestLoading && suggestions.length === 0 && address.trim().length >= 3 && (
              <p className="px-3 py-2.5 text-xs text-stone-400">
                Sin resultados. Pruebe con calle y pueblo, por ejemplo: Calle Trafalgar, Tarifa
              </p>
            )}
          </div>
        )}
      </div>

      {message && (
        <p
          className={
            status === 'error'
              ? 'text-xs text-red-500'
              : status === 'loading'
                ? 'text-xs text-stone-400'
                : 'text-xs text-emerald-700'
          }
        >
          {message}
        </p>
      )}

      {hasCoordinates ? (
        <PropertyMap
          className="h-[280px]"
          draggable={{
            latitude: lat,
            longitude: lng,
            onMove: (nextLat, nextLng) => {
              onCoordinatesChange(String(nextLat), String(nextLng))
              setStatus('ok')
              setMessage('Pin ajustado manualmente')
            },
          }}
        />
      ) : (
        <div className="flex h-[280px] items-center justify-center rounded-sm border border-dashed border-stone-200 bg-stone-50 px-6 text-center text-sm text-stone-400">
          Escriba la dirección y elija una sugerencia para colocar el pin en el mapa
        </div>
      )}
    </div>
  )
}
