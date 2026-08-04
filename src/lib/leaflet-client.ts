import L from 'leaflet'

/** Centro por defecto: Tarifa (Cádiz) */
export const TARIFA_CENTER: [number, number] = [36.014, -5.604]
export const DEFAULT_MAP_ZOOM = 14

export const MAP_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>'

const MARKER_SVG = `
<svg viewBox="0 0 32 40" width="26" height="32" aria-hidden="true" focusable="false">
  <path fill="#103f91" stroke="#ffffff" stroke-width="1.5" d="M16 1.5c-5.8 0-10.5 4.7-10.5 10.5 0 7.8 10.5 22.5 10.5 22.5s10.5-14.7 10.5-22.5C26.5 6.2 21.8 1.5 16 1.5z"/>
  <circle cx="16" cy="12" r="3.5" fill="#ffffff"/>
</svg>
`.trim()

export function createPropertyMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'property-map-marker',
    html: MARKER_SVG,
    iconSize: [26, 32],
    iconAnchor: [13, 32],
    popupAnchor: [0, -30],
  })
}

export function configureLeafletIcons() {
  // Custom divIcon markers — default Leaflet icons not used on public maps.
}
