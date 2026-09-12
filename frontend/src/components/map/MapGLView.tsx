import { useEffect, useRef, useCallback } from 'react'
import {
  Map,
  NavigationControl,
  ScaleControl,
  Marker,
  Popup,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { CityMap, MapProperty, MapFilters } from '../../types'

// ── Geographic bounds ──────────────────────────────────────────────
const BOUNDS = {
  minLat: 30.937698, maxLat: 30.952062,
  minLon: 31.144212, maxLon: 31.153085,
}

function propToLonLat(x: number, y: number): [number, number] {
  return [
    BOUNDS.minLon + x * (BOUNDS.maxLon - BOUNDS.minLon),
    BOUNDS.maxLat - y * (BOUNDS.maxLat - BOUNDS.minLat),
  ]
}

// ── Label maps ─────────────────────────────────────────────────────
const TYPE_AR:    Record<string, string> = {
  Apartment: 'شقة',
  House:     'بيت',
  Villa:     'بيت',
  Land:      'أرض',
  Shop:      'محل',
  Commercial:'محل',
}
const LISTING_AR: Record<string, string> = { Sale:'للبيع', Rent:'للإيجار' }
const STATUS_AR:  Record<string, string> = { Available:'متاح', Sold:'مباع' }

// ── Inline MapLibre style (tiles through Vite proxy → OSM) ─────────
// This avoids ALL external style JSON and CORS issues.
// The /osm-tiles/ path is proxied in vite.config.ts → tile.openstreetmap.org
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'osm': {
      type: 'raster' as const,
      tiles: ['/osm-tiles/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id:     'osm-background',
      type:   'background' as const,
      paint:  { 'background-color': '#f0ebe0' },
    },
    {
      id:      'osm-tiles',
      type:    'raster' as const,
      source:  'osm',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

const FINISHING_AR: Record<string, string> = {
  'Core-Shell':   'عظم',
  'Semi-Finished': 'نص تشطيب',
  'Finished':     'تشطيب',
  'Lux':          'لوكس',
  'Super-Lux':    'سوبر لوكس',
  'High-Lux':     'هاي لوكس',
}

// ── Component ──────────────────────────────────────────────────────
interface Props {
  data:    CityMap
  filters: MapFilters
}

export default function MapGLView({ data, filters }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<Map | null>(null)
  const markersRef   = useRef<Marker[]>([])
  const popupRef     = useRef<Popup | null>(null)

  // ── Popup HTML (Full Property Details Card) ───────────────────────
  const buildPopupHTML = useCallback((p: MapProperty): string => {
    const type    = TYPE_AR[p.propertyType ?? ''] ?? (p.propertyType ?? 'عقار')
    const listing = LISTING_AR[p.listingType ?? ''] ?? ''
    const status  = STATUS_AR[p.status] ?? p.status
    const price   = p.price != null ? p.price.toLocaleString('ar-EG') : 'السعر غير محدد'
    const finishing = p.finishingStatus ? (FINISHING_AR[p.finishingStatus] ?? p.finishingStatus) : ''
    const defaultImg = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80'
    const imgUrl  = p.primaryImageUrl || defaultImg

    // Build specs items
    const specs: string[] = []
    if (p.areaSqm != null) specs.push(`<div class="mapgl-popup__spec">📐 <span>${p.areaSqm} م²</span></div>`)
    if (p.bedrooms != null) specs.push(`<div class="mapgl-popup__spec">🛏️ <span>${p.bedrooms} غرف</span></div>`)
    if (p.bathrooms != null) specs.push(`<div class="mapgl-popup__spec">🚿 <span>${p.bathrooms} حمام</span></div>`)
    if (p.floorNumber != null) specs.push(`<div class="mapgl-popup__spec">🏢 <span>الدور ${p.floorNumber === 0 ? 'الأرضي' : p.floorNumber}</span></div>`)
    if (finishing) specs.push(`<div class="mapgl-popup__spec">🎨 <span>${finishing}</span></div>`)

    // Services tags
    const services: string[] = []
    if (p.waterMeterAvailable) services.push(`<span class="mapgl-popup__tag">💧 مياه</span>`)
    if (p.electricityMeterAvailable) services.push(`<span class="mapgl-popup__tag">⚡ كهرباء</span>`)
    if (p.gasMeterAvailable) services.push(`<span class="mapgl-popup__tag">🔥 غاز</span>`)
    if (p.elevatorAvailable) services.push(`<span class="mapgl-popup__tag">🛗 أسانسير</span>`)
    if (p.installmentAvailable) services.push(`<span class="mapgl-popup__tag mapgl-popup__tag--green">💳 تقسيط</span>`)

    return `
      <div class="mapgl-popup-card">
        <div class="mapgl-popup__img-wrap">
          <img src="${imgUrl}" alt="${p.title ?? ''}" class="mapgl-popup__img" onerror="this.src='${defaultImg}'" />
          <div class="mapgl-popup__badges">
            <span class="mapgl-popup__badge mapgl-popup__badge--${p.status}">${status}</span>
            ${listing ? `<span class="mapgl-popup__badge mapgl-popup__badge--listing">${listing}</span>` : ''}
            <span class="mapgl-popup__badge mapgl-popup__badge--type">${type}</span>
          </div>
        </div>

        <div class="mapgl-popup__body">
          <div class="mapgl-popup__title">${p.title ?? 'وحدة عقارية'}</div>
          ${p.address ? `<div class="mapgl-popup__address">📍 ${p.address}</div>` : ''}

          <div class="mapgl-popup__price-row">
            <div class="mapgl-popup__price">${price} <span>جنيه</span></div>
          </div>

          ${specs.length > 0 ? `<div class="mapgl-popup__specs">${specs.join('')}</div>` : ''}

          ${services.length > 0 ? `<div class="mapgl-popup__tags">${services.join('')}</div>` : ''}

          <a class="mapgl-popup__link" href="/properties/${p.id}">
            عرض التفاصيل الكاملة ←
          </a>
        </div>
      </div>
    `
  }, [])

  // ── Init map ────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = new Map({
      container,
      style:   MAP_STYLE,
      center:  [31.1487, 30.9449],
      zoom:    15.5,
      pitch:   50,
      bearing: -15,
      maxPitch: 70,
    })

    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-left')
    map.addControl(new ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left')

    mapRef.current = map

    return () => {
      markersRef.current.forEach(m => m.remove())
      popupRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── Sync property markers ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const addMarkers = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      popupRef.current?.remove()

      const filtered = data.properties.filter(p => {
        if (p.status === 'Reserved') return false
        if (filters.status && p.status !== filters.status) return false
        if (filters.listingType && p.listingType !== filters.listingType) return false
        if (filters.propertyType) {
          if (filters.propertyType === 'House' && (p.propertyType === 'House' || p.propertyType === 'Villa')) {
            // match
          } else if (filters.propertyType === 'Shop' && (p.propertyType === 'Shop' || p.propertyType === 'Commercial')) {
            // match
          } else if (p.propertyType !== filters.propertyType) {
            return false
          }
        }
        return true
      })

      filtered.forEach(prop => {
        const [lon, lat] = propToLonLat(prop.x, prop.y)

        const el = document.createElement('div')
        el.className = `mapgl-pin mapgl-pin--${prop.status}`
        el.innerHTML = `<div class="mapgl-pin__head"></div><div class="mapgl-pin__stem"></div>`

        const marker = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lon, lat])
          .addTo(map)

        el.addEventListener('click', () => {
          popupRef.current?.remove()
          const popup = new Popup({
            offset: [0, -40],
            className: 'mapgl-popup',
            closeButton: true,
            closeOnClick: false,
            maxWidth: '290px',
          })
            .setLngLat([lon, lat])
            .setHTML(buildPopupHTML(prop))
            .addTo(map)
          popupRef.current = popup
        })

        markersRef.current.push(marker)
      })
    }

    // Map might not be loaded yet
    if (map.loaded()) {
      addMarkers()
    } else {
      map.once('load', addMarkers)
    }
  }, [data, filters, buildPopupHTML])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  )
}
