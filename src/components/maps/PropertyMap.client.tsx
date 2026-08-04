'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import {
  TARIFA_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
  configureLeafletIcons,
  createPropertyMarkerIcon,
} from '@/lib/leaflet-client'
import type { PropertyMapPoint } from '@/lib/property-map'

type DraggableMarker = {
  latitude: number
  longitude: number
  onMove: (latitude: number, longitude: number) => void
}

type FocusCenter = {
  latitude: number
  longitude: number
  zoom?: number
}

type Props = {
  points?: PropertyMapPoint[]
  className?: string
  draggable?: DraggableMarker | null
  focusCenter?: FocusCenter | null
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildPopupHtml(point: PropertyMapPoint) {
  const image = point.imageUrl
    ? `<div class="property-map-popup__image"><img src="${escapeHtml(point.imageUrl)}" alt="" /></div>`
    : ''
  return `
    <div class="property-map-popup__inner">
      ${image}
      <p class="property-map-popup__title">${escapeHtml(point.title)}</p>
      <p class="property-map-popup__price">${escapeHtml(formatPrice(point.price, point.operation || 'venta'))}</p>
      <p class="property-map-popup__location">${escapeHtml(point.location)}</p>
      <a class="property-map-popup__link" href="/propiedades/${escapeHtml(point.id)}">Ver ficha</a>
    </div>
  `
}

export default function PropertyMap({ points = [], className, draggable = null, focusCenter = null }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const draggableMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    configureLeafletIcons()
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    }).setView(TARIFA_CENTER, DEFAULT_MAP_ZOOM)

    map.zoomControl.setPosition('topright')

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    mapRef.current = map
    markersLayerRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
      draggableMarkerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    draggableMarkerRef.current?.remove()
    draggableMarkerRef.current = null

    const markerIcon = createPropertyMarkerIcon()

    if (draggable) {
      const marker = L.marker([draggable.latitude, draggable.longitude], {
        draggable: true,
        icon: markerIcon,
      }).addTo(map)
      draggableMarkerRef.current = marker
      marker.on('dragend', () => {
        const position = marker.getLatLng()
        draggable.onMove(position.lat, position.lng)
      })
      map.setView([draggable.latitude, draggable.longitude], 16, { animate: false })
      return
    }

    if (points.length === 0) {
      map.setView(TARIFA_CENTER, DEFAULT_MAP_ZOOM, { animate: false })
      return
    }

    const bounds = L.latLngBounds([])
    for (const point of points) {
      const marker = L.marker([point.latitude, point.longitude], { icon: markerIcon })
      marker.bindPopup(buildPopupHtml(point), {
        className: 'property-map-popup',
        maxWidth: 260,
        minWidth: 220,
        closeButton: true,
        autoPanPadding: [24, 24],
      })
      marker.addTo(layer)
      bounds.extend([point.latitude, point.longitude])
    }

    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 15, { animate: false })
    } else {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: false })
    }
  }, [points, draggable])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusCenter || draggable) return
    map.setView([focusCenter.latitude, focusCenter.longitude], focusCenter.zoom ?? 14, { animate: true })
  }, [focusCenter, draggable])

  return (
    <div className={cn('property-map-shell', className)}>
      <div ref={containerRef} className="property-map-canvas" />
    </div>
  )
}
