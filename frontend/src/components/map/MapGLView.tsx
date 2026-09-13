import { useEffect, useRef, useCallback } from 'react'
import {
  Map,
  NavigationControl,
  ScaleControl,
  Marker,
  Popup,
  LngLatBounds,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { CityMap, MapProperty, MapFilters } from '../../types'
import { formatFloorsText } from '../../utils/formatters'

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

// ── Free OpenStreetMap raster tiles (No API key required, No watermarks) ──
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'osm': {
      type: 'raster' as const,
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id:     'background',
      type:   'background' as const,
      paint:  { 'background-color': '#f2eee9' },
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
  const isInitialFit = useRef(true)

  // ── Popup HTML (Full Property Details Card) ───────────────────────
  const buildPopupHTML = useCallback((p: MapProperty): string => {
    const title   = p.title?.trim() || 'وحدة عقارية'
    const type    = TYPE_AR[p.propertyType ?? ''] ?? (p.propertyType ?? 'عقار')
    const listing = LISTING_AR[p.listingType ?? ''] ?? ''
    const status  = STATUS_AR[p.status] ?? p.status
    const price   = p.price != null ? `${p.price.toLocaleString('ar-EG')} <span>جنيه</span>` : 'السعر عند الطلب'
    const finishing = p.finishingStatus ? (FINISHING_AR[p.finishingStatus] ?? p.finishingStatus) : ''
    const defaultImg = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80'
    const imgUrl  = p.primaryImageUrl || defaultImg

    // Build specs items
    const specs: string[] = []
    if (p.areaSqm != null) specs.push(`<div class="mapgl-popup__spec">📐 <span>${p.areaSqm} م²</span></div>`)
    if (p.bedrooms != null) specs.push(`<div class="mapgl-popup__spec">🛏️ <span>${p.bedrooms} غرف</span></div>`)
    if (p.bathrooms != null) specs.push(`<div class="mapgl-popup__spec">🚿 <span>${p.bathrooms} حمام</span></div>`)
    if (p.floorNumber != null) {
      specs.push(`<div class="mapgl-popup__spec">🏢 <span>${p.floorNumber === 0 ? 'الدور الأرضي' : `الدور ${p.floorNumber}`}</span></div>`)
    } else if (p.floors && p.floors.length > 0) {
      specs.push(`<div class="mapgl-popup__spec">🏢 <span>${formatFloorsText(p.floors)}</span></div>`)
    }
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
          <img src="${imgUrl}" alt="${title}" class="mapgl-popup__img" onerror="this.src='${defaultImg}'" />
          <div class="mapgl-popup__badges">
            <span class="mapgl-popup__badge mapgl-popup__badge--${p.status}">${status}</span>
            ${listing ? `<span class="mapgl-popup__badge mapgl-popup__badge--listing">${listing}</span>` : ''}
            <span class="mapgl-popup__badge mapgl-popup__badge--type">${type}</span>
          </div>
        </div>

        <div class="mapgl-popup__body">
          <div class="mapgl-popup__title">${title}</div>
          ${p.address ? `<div class="mapgl-popup__address">📍 ${p.address}</div>` : ''}

          <div class="mapgl-popup__price-row">
            <div class="mapgl-popup__price">${price}</div>
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

    const validProps = (data.properties || []).filter(p => p.x != null && p.y != null && !isNaN(p.x) && !isNaN(p.y))
    const hasProps = validProps.length > 0
    const initialCenter: [number, number] = hasProps
      ? propToLonLat(validProps[0].x, validProps[0].y)
      : [31.1487, 30.9449]

    const map = new Map({
      container,
      style:   MAP_STYLE,
      center:  initialCenter,
      zoom:    hasProps ? 16.5 : 15.5,
      pitch:   hasProps ? 35 : 50,
      bearing: hasProps ? -10 : -15,
      maxPitch: 70,
    })

    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-left')
    map.addControl(new ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left')

    const handleResize = () => map.resize()
    window.addEventListener('resize', handleResize)
    map.on('load', handleResize)
    const t1 = setTimeout(handleResize, 100)
    const t2 = setTimeout(handleResize, 400)
    const t3 = setTimeout(handleResize, 1000)

    mapRef.current = map

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
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

      const filtered = (data.properties || []).filter(p => {
        if (p.x == null || p.y == null || isNaN(p.x) || isNaN(p.y)) return false
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

      const getTypeIcon = (t?: string | null) => {
        switch (t) {
          case 'Apartment': return '🏢'
          case 'House':
          case 'Villa': return '🏡'
          case 'Shop':
          case 'Commercial': return '🏪'
          case 'Land': return '🗺️'
          default: return '📍'
        }
      }

      const getFinishingInfo = (f?: string | null) => {
        switch (f) {
          case 'Core-Shell': return { text: 'عظم', cls: 'core' }
          case 'Semi-Finished': return { text: 'نص', cls: 'semi' }
          case 'Finished':
          case 'Lux':
          case 'Super-Lux':
          case 'High-Lux': return { text: 'تشطيب', cls: 'done' }
          default: return null
        }
      }

      filtered.forEach(prop => {
        const [lon, lat] = propToLonLat(prop.x, prop.y)
        const typeIcon = getTypeIcon(prop.propertyType)
        const finishing = getFinishingInfo(prop.finishingStatus)

        const el = document.createElement('div')
        el.className = `mapgl-pin mapgl-pin--${prop.status}`
        el.innerHTML = `
          <div class="mapgl-pin__head">
            <span class="mapgl-pin__icon">${typeIcon}</span>
            ${finishing ? `<span class="mapgl-pin__badge mapgl-pin__badge--${finishing.cls}">${finishing.text}</span>` : ''}
          </div>
          <div class="mapgl-pin__stem"></div>
        `

        const marker = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lon, lat])
          .addTo(map)

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          popupRef.current?.remove()
          const popup = new Popup({
            offset: [0, -42],
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

      // Auto fit / fly to visible properties
      if (filtered.length === 1) {
        const [lon, lat] = propToLonLat(filtered[0].x, filtered[0].y)
        map.flyTo({
          center: [lon, lat],
          zoom: 16.5,
          pitch: 35,
          bearing: -10,
          duration: isInitialFit.current ? 0 : 800,
        })
        isInitialFit.current = false
      } else if (filtered.length > 1) {
        const bounds = new LngLatBounds()
        filtered.forEach(p => {
          bounds.extend(propToLonLat(p.x, p.y))
        })
        map.fitBounds(bounds, {
          padding: { top: 90, bottom: 80, left: 60, right: 60 },
          maxZoom: 17,
          duration: isInitialFit.current ? 0 : 800,
        })
        isInitialFit.current = false
      }
    }

    // Add markers immediately without waiting for tiles
    addMarkers()
    if (!map.loaded()) {
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
