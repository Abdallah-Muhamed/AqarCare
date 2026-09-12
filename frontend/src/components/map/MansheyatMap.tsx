import { useRef, useState, useEffect, useCallback } from 'react'
import type { CityMap, MapProperty, MapFilters } from '../../types'
import MapStreetLayer from './MapStreetLayer'
import PropertyMarkerLayer from './PropertyMarkerLayer'
import PropertyPopup from './PropertyPopup'
import MapFiltersPanel from './MapFiltersPanel'
import MapLegend from './MapLegend'
import './MansheyatMap.css'

const MAP_W = 900   // SVG viewBox width (internal units)
const MAP_H = 750   // SVG viewBox height
const MIN_ZOOM = 0.5
const MAX_ZOOM = 6
const ZOOM_STEP = 0.35

interface Props {
  data: CityMap
  loading?: boolean
}

// Status helpers
export function statusClass(status: string) {
  if (status === 'Available') return 'available'
  if (status === 'Reserved')  return 'reserved'
  if (status === 'Sold')      return 'sold'
  return 'default'
}
export function statusLabel(status: string) {
  if (status === 'Available') return 'متاح'
  if (status === 'Reserved')  return 'محجوز'
  if (status === 'Sold')      return 'مباع'
  return status
}

export default function MansheyatMap({ data, loading }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)

  // Pan + zoom state
  const [zoom, setZoom]   = useState(1)
  const [pan, setPan]     = useState({ x: 0, y: 0 })
  const drag = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const pinch = useRef<{ dist: number; zoom: number } | null>(null)

  // Selected marker
  const [selected, setSelected] = useState<MapProperty | null>(null)
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 })

  // Filters
  const [filters, setFilters] = useState<MapFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showSheet, setShowSheet] = useState(false)   // mobile bottom sheet

  // Filtered properties

  const filtered = data.properties.filter(p => {
    if (filters.listingType && p.listingType !== filters.listingType) return false
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false
    if (filters.status && p.status !== filters.status) return false
    if (filters.minPrice != null && (p.price ?? 0) < filters.minPrice) return false
    if (filters.maxPrice != null && (p.price ?? Infinity) > filters.maxPrice) return false
    return true
  })

  // ── Center map on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return
    const { width, height } = wrapRef.current.getBoundingClientRect()
    const scale = Math.min(width / MAP_W, height / MAP_H) * 0.92
    setZoom(scale)
    setPan({ x: (width - MAP_W * scale) / 2, y: (height - MAP_H * scale) / 2 })
  }, [])

  // ── Mouse drag ──────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
  }
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!drag.current) return
    setPan({ x: drag.current.panX + e.clientX - drag.current.startX, y: drag.current.panY + e.clientY - drag.current.startY })
  }, [])
  const onMouseUp = useCallback(() => { drag.current = null }, [])

  // ── Scroll wheel zoom ───────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    if (!wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setZoom(z => {
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
      const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta))
      setPan(p => ({
        x: mx - (mx - p.x) * (nz / z),
        y: my - (my - p.y) * (nz / z),
      }))
      return nz
    })
  }, [])

  // ── Touch events ────────────────────────────────────────────────
  const getTouchDist = (t: React.TouchList) => {
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      drag.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, panX: pan.x, panY: pan.y }
    } else if (e.touches.length === 2) {
      drag.current = null
      pinch.current = { dist: getTouchDist(e.touches), zoom }
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && drag.current) {
      setPan({ x: drag.current.panX + e.touches[0].clientX - drag.current.startX, y: drag.current.panY + e.touches[0].clientY - drag.current.startY })
    } else if (e.touches.length === 2 && pinch.current && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect()
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
      const dist = getTouchDist(e.touches)
      const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinch.current.zoom * (dist / pinch.current.dist)))
      setZoom(z => {
        setPan(p => ({ x: cx - (cx - p.x) * (nz / z), y: cy - (cy - p.y) * (nz / z) }))
        return nz
      })
    }
  }
  const onTouchEnd = () => { drag.current = null; pinch.current = null }

  // Register global mouse events
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    const wrap = wrapRef.current
    if (wrap) wrap.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (wrap) wrap.removeEventListener('wheel', onWheel)
    }
  }, [onMouseMove, onMouseUp, onWheel])

  // ── Marker click ────────────────────────────────────────────────
  const onMarkerClick = (prop: MapProperty, svgX: number, svgY: number) => {
    setSelected(prop)
    if (window.innerWidth > 768) {
      const screenX = pan.x + svgX * zoom
      const screenY = pan.y + svgY * zoom
      setPopupPos({ x: screenX + 14, y: screenY - 80 })
    } else {
      setShowSheet(true)
    }
  }

  const closePopup = () => { setSelected(null); setShowSheet(false) }

  const zoomIn  = () => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))

  const availableCount  = filtered.filter(p => p.status === 'Available').length
  const reservedCount   = filtered.filter(p => p.status === 'Reserved').length
  const soldCount       = filtered.filter(p => p.status === 'Sold').length

  return (
    <div className="map-canvas-wrap" ref={wrapRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── SVG map ───────────────────────────────────────────────── */}
      <svg
        className="map-svg"
        width={MAP_W}
        height={MAP_H}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        onClick={e => { if ((e.target as Element).classList.contains('map-bg')) closePopup() }}
      >
        {/* Background */}
        <rect className="map-bg" x={0} y={0} width={MAP_W} height={MAP_H} rx={4} />

        {/* Streets */}
        <MapStreetLayer streets={data.streets} mapW={MAP_W} mapH={MAP_H} zoom={zoom} />

        {/* Property markers */}
        <PropertyMarkerLayer
          properties={filtered}
          mapW={MAP_W}
          mapH={MAP_H}
          selected={selected}
          onMarkerClick={onMarkerClick}
        />
      </svg>

      {/* ── Desktop popup ─────────────────────────────────────────── */}
      {selected && (
        <div
          className="map-popup visible"
          style={{ left: popupPos.x, top: popupPos.y }}
        >
          <PropertyPopup property={selected} onClose={closePopup} />
        </div>
      )}

      {/* ── Mobile bottom sheet ────────────────────────────────────── */}
      <div className={`map-sheet ${showSheet ? 'open' : ''}`}>
        <div className="map-sheet__backdrop" onClick={closePopup} />
        <div className="map-sheet__content">
          <div className="map-sheet__handle" />
          {selected && <PropertyPopup property={selected} onClose={closePopup} />}
        </div>
      </div>

      {/* ── Filters panel ─────────────────────────────────────────── */}
      <MapFiltersPanel
        filters={filters}
        onChange={setFilters}
        open={showFilters}
        onToggle={() => setShowFilters(s => !s)}
      />

      {/* ── Legend ────────────────────────────────────────────────── */}
      <MapLegend
        available={availableCount}
        reserved={reservedCount}
        sold={soldCount}
      />

      {/* ── Zoom controls ─────────────────────────────────────────── */}
      <div className="map-zoom">
        <button className="map-zoom__btn" onClick={zoomIn}  title="تكبير">+</button>
        <button className="map-zoom__btn" onClick={zoomOut} title="تصغير">−</button>
      </div>

      {/* ── OSM attribution ───────────────────────────────────────── */}
      <div className="map-attribution">
        بيانات الشوارع: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
      </div>

      {/* ── Loading overlay ───────────────────────────────────────── */}
      {loading && (
        <div className="map-loading">
          <div className="spinner" />
          <span>جاري تحميل الخريطة…</span>
        </div>
      )}

      {/* ── Empty state (no streets) ──────────────────────────────── */}
      {!loading && data.streets.length === 0 && (
        <div className="map-empty">
          <h3>لا توجد بيانات للخريطة</h3>
          <p>يرجى مراجعة لوحة الإدارة لاستيراد بيانات الشوارع</p>
        </div>
      )}
    </div>
  )
}
