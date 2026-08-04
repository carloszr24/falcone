'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Suggestion = {
  id: string
  label: string
  subtitle: string
  latitude: number
  longitude: number
  displayName: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  onSelect: (item: Suggestion) => void
  placeholder?: string
  className?: string
}

export function LocationSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = 'Ej: Calle Trafalgar, Tarifa',
  className,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipRef = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false
      return
    }

    const trimmed = value.trim()
    if (trimmed.length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setOpen(true)
      try {
        const params = new URLSearchParams({ address: trimmed })
        const res = await fetch(`/api/location/search?${params.toString()}`)
        const data = (await res.json().catch(() => ({}))) as { suggestions?: Suggestion[] }
        setSuggestions(data.suggestions ?? [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border border-stone-200 bg-white px-4 py-3 text-sm font-light text-stone-900 focus:border-stone-900 focus:outline-none"
      />

      {open && (loading || suggestions.length > 0 || value.trim().length >= 3) && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto border border-stone-200 bg-white shadow-lg">
          {loading && suggestions.length === 0 && (
            <p className="px-4 py-3 text-xs font-light text-stone-400">Buscando zonas…</p>
          )}
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                skipRef.current = true
                onChange(item.displayName)
                onSelect(item)
                setOpen(false)
              }}
              className="block w-full border-b border-stone-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-stone-50"
            >
              <span className="block text-sm font-light text-stone-900">{item.label}</span>
              <span className="mt-0.5 block text-xs font-light text-stone-500 line-clamp-2">{item.subtitle}</span>
            </button>
          ))}
          {!loading && suggestions.length === 0 && value.trim().length >= 3 && (
            <p className="px-4 py-3 text-xs font-light text-stone-400">
              No encontramos esa zona. Pruebe con calle y pueblo.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export type { Suggestion as LocationSuggestion }
