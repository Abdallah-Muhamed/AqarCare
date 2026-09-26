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
import { getPropertyPlaceholder } from '../../constants/placeholders'

// ── Geographic bounds ──────────────────────────────────────────────
const BOUNDS = {
  minLat: 21.5,
  maxLat: 32.0,
  minLon: 24.5,
  maxLon: 37.0,
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
  data:              CityMap
  filters:           MapFilters
  selectedProperty?: MapProperty | null
  onSelectProperty?: (p: MapProperty | null) => void
}

export default function MapGLView({ data, filters, selectedProperty, onSelectProperty }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<Map | null>(null)
  const markersRef   = useRef<Marker[]>([])
  const popupRef     = useRef<Popup | null>(null)
  const isInitialFit = useRef(true)
  const isProgrammaticClose = useRef(false)
  const activePropIdRef     = useRef<number | null>(null)
  const onSelectRef         = useRef(onSelectProperty)
  useEffect(() => {
    onSelectRef.current = onSelectProperty
  }, [onSelectProperty])

  // ── Popup HTML (Full Property Details Card) ───────────────────────
  const buildPopupHTML = useCallback((p: MapProperty): string => {
    const title   = p.title?.trim() || 'وحدة عقارية'
    const type    = TYPE_AR[p.propertyType ?? ''] ?? (p.propertyType ?? 'عقار')
    const listing = LISTING_AR[p.listingType ?? ''] ?? ''
    const status  = STATUS_AR[p.status] ?? p.status
    const finishing = p.finishingStatus ? (FINISHING_AR[p.finishingStatus] ?? p.finishingStatus) : ''
    const defaultImg = getPropertyPlaceholder(p.propertyType)
    const imgUrl  = p.primaryImageUrl || defaultImg

    const isHouse = p.propertyType === 'House' || p.propertyType === 'Villa'
    const isLand  = p.propertyType === 'Land'
    const isShop  = p.propertyType === 'Shop' || p.propertyType === 'Commercial'

    const availableFloors = !isHouse && !isLand ? (p.floors || []).filter(f => f.isAvailable) : []
    const targetFloors = availableFloors.length > 0 ? availableFloors : (!isHouse && !isLand ? (p.floors || []) : [])
    const cashPrices = targetFloors.map(f => f.price).filter((pr): pr is number => pr != null && pr > 0)
    const instPrices = targetFloors.map(f => f.installmentPrice).filter((pr): pr is number => pr != null && pr > 0)

    const minCash = cashPrices.length > 0 ? Math.min(...cashPrices) : (p.price != null && p.price > 0 ? p.price : null)
    const maxCash = cashPrices.length > 0 ? Math.max(...cashPrices) : (p.price != null && p.price > 0 ? p.price : null)
    const minInst = instPrices.length > 0 ? Math.min(...instPrices) : (p.installmentPrice != null && p.installmentPrice > 0 ? p.installmentPrice : null)
    const maxInst = instPrices.length > 0 ? Math.max(...instPrices) : (p.installmentPrice != null && p.installmentPrice > 0 ? p.installmentPrice : null)

    const formatPriceText = (min: number | null, max: number | null) => {
      if (min == null) return null
      if (isHouse || isLand || isShop || max == null || min === max) return `${min.toLocaleString('ar-EG')} جنيه`
      return `يبدأ من ${min.toLocaleString('ar-EG')} جنيه`
    }

    const cashText = formatPriceText(minCash, maxCash)
    const instText = formatPriceText(minInst, maxInst)

    // Build specs items
    const specs: string[] = []
    const floorAreas = (p.floors || []).map(f => f.areaSqm).filter((a): a is number => a != null && a > 0)
    const areaVal = p.areaSqm ?? (floorAreas.length > 0 ? (
      Math.min(...floorAreas) === Math.max(...floorAreas)
        ? Math.min(...floorAreas)
        : `${Math.min(...floorAreas)} - ${Math.max(...floorAreas)}`
    ) : null)
    if (areaVal != null) specs.push(`<div class="mapgl-popup__spec">📐 <span>${areaVal} م²</span></div>`)

    if (isHouse) {
      const floorsNum = p.numberOfFloors ?? (p.floors && p.floors.length > 0 ? p.floors.length : null)
      if (floorsNum != null) specs.push(`<div class="mapgl-popup__spec">🏢 <span>${floorsNum} أدوار</span></div>`)
      if (p.apartmentsPerFloor != null && p.apartmentsPerFloor > 0) {
        specs.push(`<div class="mapgl-popup__spec">🚪 <span>${p.apartmentsPerFloor === 1 ? 'شقة بالدور' : p.apartmentsPerFloor === 2 ? 'شقتين بالدور' : `${p.apartmentsPerFloor} شقق بالدور`}</span></div>`)
      }
      if (p.finishedApartments != null && p.finishedApartments > 0) {
        specs.push(`<div class="mapgl-popup__spec" style="color:#047857;font-weight:700;">✨ <span>${p.finishedApartments} متشطب</span></div>`)
      }
      if (p.semiFinishedApartments != null && p.semiFinishedApartments > 0) {
        specs.push(`<div class="mapgl-popup__spec" style="color:#b45309;font-weight:700;">🧱 <span>${p.semiFinishedApartments} نص تشطيب</span></div>`)
      }
      if (p.coreShellApartments != null && p.coreShellApartments > 0) {
        specs.push(`<div class="mapgl-popup__spec" style="color:#475569;font-weight:700;">🏗️ <span>${p.coreShellApartments} عظم</span></div>`)
      }
    } else {
      if (!isLand && !isShop) {
        const floorBeds = (p.floors || []).map(f => f.bedrooms).filter((b): b is number => b != null && b > 0)
        const bedVal = p.bedrooms ?? (floorBeds.length > 0 ? (
          Math.min(...floorBeds) === Math.max(...floorBeds)
            ? Math.min(...floorBeds)
            : `${Math.min(...floorBeds)} - ${Math.max(...floorBeds)}`
        ) : null)
        if (bedVal != null) specs.push(`<div class="mapgl-popup__spec">🛏️ <span>${bedVal} غرف</span></div>`)
      }

      if (!isLand) {
        const floorBaths = (p.floors || []).map(f => f.bathrooms).filter((b): b is number => b != null && b > 0)
        const bathVal = p.bathrooms ?? (floorBaths.length > 0 ? (
          Math.min(...floorBaths) === Math.max(...floorBaths)
            ? Math.min(...floorBaths)
            : `${Math.min(...floorBaths)} - ${Math.max(...floorBaths)}`
        ) : null)
        if (bathVal != null) specs.push(`<div class="mapgl-popup__spec">🚿 <span>${bathVal} حمام</span></div>`)
      }

      if (!isLand) {
        if (p.floorNumber != null) {
          specs.push(`<div class="mapgl-popup__spec">🏢 <span>${p.floorNumber === 0 ? 'الدور الأرضي' : `الدور ${p.floorNumber}`}</span></div>`)
        } else if (p.floors && p.floors.length > 0) {
          specs.push(`<div class="mapgl-popup__spec">🏢 <span>${formatFloorsText(p.floors, p.propertyType)}</span></div>`)
        }
      }
      if (!isLand && finishing) specs.push(`<div class="mapgl-popup__spec">🎨 <span>${finishing}</span></div>`)
    }

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

          <div class="mapgl-popup__price-row" style="display:flex;flex-direction:column;gap:3px;align-items:flex-start;">
            ${cashText ? `<div class="mapgl-popup__price" style="font-size:0.92rem;">💵 كاش: ${cashText}</div>` : '<div class="mapgl-popup__price">السعر عند الطلب</div>'}
            ${instText ? `<div style="font-size:0.8rem;font-weight:700;color:#2563eb;">💳 تقسيط: ${instText}</div>` : ''}
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

  // ── Show property (moves camera + opens desktop popup smoothly) ──
  const showProperty = useCallback((p: MapProperty) => {
    const map = mapRef.current
    if (!map || p.x == null || p.y == null || isNaN(p.x) || isNaN(p.y)) return

    activePropIdRef.current = p.id
    const [lon, lat] = propToLonLat(p.x, p.y)
    const isMobile = window.innerWidth <= 768

    const run = () => {
      map.flyTo({
        center: [lon, lat],
        offset: isMobile ? [0, -70] : [0, 130],
        zoom: 17.5,
        pitch: 35,
        bearing: -10,
        duration: 1000,
        essential: true,
      })

      // Programmatically remove any existing popup without triggering onSelect(null)
      isProgrammaticClose.current = true
      popupRef.current?.remove()
      popupRef.current = null
      isProgrammaticClose.current = false

      if (!isMobile) {
        const popup = new Popup({
          offset: [0, -42],
          className: 'mapgl-popup',
          closeButton: true,
          closeOnClick: true,
          maxWidth: '290px',
        })
          .setLngLat([lon, lat])
          .setHTML(buildPopupHTML(p))
          .addTo(map)

        popup.on('close', () => {
          if (!isProgrammaticClose.current) {
            activePropIdRef.current = null
            onSelectRef.current?.(null)
          }
        })

        popupRef.current = popup
      }
    }

    if (map.loaded()) {
      run()
    } else {
      map.once('load', run)
    }
  }, [buildPopupHTML])

  // Sync property selection (e.g. via URL /map?propertyId=12 or external click)
  useEffect(() => {
    if (!selectedProperty) {
      if (activePropIdRef.current !== null) {
        activePropIdRef.current = null
        isProgrammaticClose.current = true
        popupRef.current?.remove()
        popupRef.current = null
        isProgrammaticClose.current = false
      }
      return
    }

    // If this property is already actively displayed, avoid duplicate camera/popup triggers
    if (activePropIdRef.current === selectedProperty.id) {
      return
    }

    showProperty(selectedProperty)
  }, [selectedProperty, showProperty])

  // ── Init map ────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const validProps = (data.properties || []).filter(p => p.x != null && p.y != null && !isNaN(p.x) && !isNaN(p.y))
    const hasProps = validProps.length > 0
    const initialCenter: [number, number] = hasProps
      ? propToLonLat(validProps[0].x, validProps[0].y)
      : [31.157, 30.947]

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

    map.on('click', () => {
      activePropIdRef.current = null
      isProgrammaticClose.current = true
      popupRef.current?.remove()
      popupRef.current = null
      isProgrammaticClose.current = false
      onSelectRef.current?.(null)
    })

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
      isProgrammaticClose.current = true
      popupRef.current?.remove()
      popupRef.current = null
      isProgrammaticClose.current = false
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
      if (!selectedProperty) {
        isProgrammaticClose.current = true
        popupRef.current?.remove()
        popupRef.current = null
        isProgrammaticClose.current = false
      }

      const filtered = (data.properties || []).filter(p => {
        if (p.x == null || p.y == null || isNaN(p.x) || isNaN(p.y)) return false
        if (p.status === 'Reserved') return false
        if (filters.status && p.status !== filters.status) return false
        if (filters.listingType && p.listingType !== filters.listingType) return false
        if (filters.finishingStatus && p.finishingStatus !== filters.finishingStatus) return false
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
          showProperty(prop)
          onSelectRef.current?.(prop)
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
