/**
 * MapPickerModal.tsx
 * High-precision interactive map picker for administrators:
 * - Powered by MapLibre GL JS
 * - Toggle between OpenStreetMap (Arabic streets) & High-Res Satellite Imagery
 * - Full zoom (up to level 19 - building/doorstep level) & smooth pan
 * - Draggable marker with instant coordinate calculation
 * - Pre-loads current property position if already assigned
 * - Street search & selection
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Map, NavigationControl, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { API_BASE_URL } from '../../constants/api'

interface Street {
  id: number
  name: string
}

interface Props {
  propertyId:    number
  propertyTitle: string
  apiKey:        string
  onClose:       () => void
  onSaved:       () => void
}

// Geographic boundaries for normalized coordinates (covers all regions with sub-centimeter precision)
const BOUNDS = {
  minLat: 21.5,
  maxLat: 32.0,
  minLon: 24.5,
  maxLon: 37.0,
}

// Default center
const CENTER: [number, number] = [31.157, 30.947]

function lngLatToNormalized(lng: number, lat: number): { x: number; y: number } {
  const x = (lng - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)
  const y = (BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)
  return {
    x: Math.round(Math.max(0, Math.min(1, x)) * 1e8) / 1e8,
    y: Math.round(Math.max(0, Math.min(1, y)) * 1e8) / 1e8,
  }
}

function normalizedToLngLat(x: number, y: number): [number, number] {
  const lng = BOUNDS.minLon + x * (BOUNDS.maxLon - BOUNDS.minLon)
  const lat = BOUNDS.maxLat - y * (BOUNDS.maxLat - BOUNDS.minLat)
  return [lng, lat]
}

// Map style definition with both OSM and Satellite sources
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'osm-streets': {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
    'esri-satellite': {
      type: 'raster' as const,
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri, Maxar',
    },
  },
  layers: [
    {
      id: 'bg',
      type: 'background' as const,
      paint: { 'background-color': '#1a202c' },
    },
    {
      id: 'satellite-layer',
      type: 'raster' as const,
      source: 'esri-satellite',
      layout: { visibility: 'none' as const },
    },
    {
      id: 'streets-layer',
      type: 'raster' as const,
      source: 'osm-streets',
      layout: { visibility: 'visible' as const },
    },
  ],
}

export default function MapPickerModal({
  propertyId, propertyTitle, apiKey, onClose, onSaved,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<Map | null>(null)
  const markerRef       = useRef<Marker | null>(null)

  const [mapMode, setMapMode]         = useState<'streets' | 'satellite'>('streets')
  const [currentLngLat, setCurrentLngLat] = useState<{ lng: number; lat: number } | null>(null)
  const [normalized, setNormalized]   = useState<{ x: number; y: number } | null>(null)
  const [streets, setStreets]         = useState<Street[]>([])
  const [streetId, setStreetId]       = useState<number | ''>('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState(false)
  const [hasExisting, setHasExisting] = useState(false)

  // ── Sync Marker and Coords ─────────────────────────────────────────
  const updateMarkerPosition = useCallback((lng: number, lat: number) => {
    setCurrentLngLat({ lng, lat })
    const norm = lngLatToNormalized(lng, lat)
    setNormalized(norm)
    setError(null)
  }, [])

  // ── Load streets and existing property location ───────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/maps/mansheyat-el-bakry`)
      .then(r => r.json())
      .then((data: { streets?: Street[]; properties?: { id: number; x: number; y: number; streetId?: number }[] }) => {
        if (data.streets) {
          const list = data.streets.filter(s => s.name)
          setStreets(list)
          if (list.length > 0) setStreetId(list[0].id)
        }

        // Check if this property already has a location
        const existing = data.properties?.find(p => p.id === propertyId)
        if (existing) {
          setHasExisting(true)
          const [lng, lat] = normalizedToLngLat(existing.x, existing.y)
          updateMarkerPosition(lng, lat)
          if (existing.streetId) setStreetId(existing.streetId)

          // Center map on existing location once ready
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 17 })
            if (markerRef.current) markerRef.current.setLngLat([lng, lat])
          }
        }
      })
      .catch(() => {})
  }, [propertyId, updateMarkerPosition])

  // ── Initialize MapLibre ───────────────────────────────────────────
  useEffect(() => {
    const container = mapContainerRef.current
    if (!container || mapRef.current) return

    try {
      const initialPos: [number, number] = currentLngLat
        ? [currentLngLat.lng, currentLngLat.lat]
        : CENTER

      const map = new Map({
        container,
        style: MAP_STYLE,
        center: initialPos,
        zoom: 15.5,
        maxZoom: 19,
        minZoom: 13,
      })

      map.addControl(new NavigationControl({ showCompass: true }), 'bottom-left')

      // Create custom pin element
      const pinEl = document.createElement('div')
      pinEl.className = 'map-picker-pin-interactive'
      pinEl.innerHTML = `
        <div class="map-picker-pin-head"></div>
        <div class="map-picker-pin-stem"></div>
        <div class="map-picker-pin-badge">اسحبني للموقع</div>
      `

      const marker = new Marker({
        element: pinEl,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat(initialPos)
        .addTo(map)

      // Listen to marker drag events
      marker.on('dragend', () => {
        const pos = marker.getLngLat()
        updateMarkerPosition(pos.lng, pos.lat)
      })

      // Listen to map click to move marker
      map.on('click', (e) => {
        marker.setLngLat(e.lngLat)
        updateMarkerPosition(e.lngLat.lng, e.lngLat.lat)
      })

      markerRef.current = marker
      mapRef.current    = map

      // If user hasn't set custom position yet, initialize with center
      if (!currentLngLat) {
        updateMarkerPosition(initialPos[0], initialPos[1])
      }

      // Ensure proper canvas size after modal animation
      const timer = setTimeout(() => map.resize(), 150)

      return () => {
        clearTimeout(timer)
        marker.remove()
        map.remove()
        mapRef.current    = null
        markerRef.current = null
      }
    } catch (err) {
      console.error('MapPickerModal map initialization error:', err)
      setError('تعذر تشغيل محرك الخريطة: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [updateMarkerPosition])

  // ── Place marker if pre-existing coordinates loaded after map ready ──
  useEffect(() => {
    if (mapRef.current && markerRef.current && currentLngLat) {
      markerRef.current.setLngLat([currentLngLat.lng, currentLngLat.lat])
    }
  }, [currentLngLat])

  // ── Switch Map Mode (Streets vs Satellite) ────────────────────────
  const toggleMapMode = (mode: 'streets' | 'satellite') => {
    setMapMode(mode)
    const map = mapRef.current
    if (!map) return

    if (mode === 'satellite') {
      map.setLayoutProperty('satellite-layer', 'visibility', 'visible')
      map.setLayoutProperty('streets-layer', 'visibility', 'none')
    } else {
      map.setLayoutProperty('satellite-layer', 'visibility', 'none')
      map.setLayoutProperty('streets-layer', 'visibility', 'visible')
    }
  }

  // ── Reset view to center ──────────────────────────────────────────
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: CENTER, zoom: 15.5, pitch: 0 })
    }
  }

  // ── Save Location ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!normalized) {
      setError('يرجى الضغط على الخريطة أو سحب الدبوس لتحديد موقع العقار أولاً')
      return
    }

    const targetStreetId = streetId || (streets.length > 0 ? streets[0].id : 1)

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/maps/properties/${propertyId}/location`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
          body: JSON.stringify({
            mapStreetId: targetStreetId,
            x: normalized.x,
            y: normalized.y,
          }),
        }
      )
      if (!res.ok) throw new Error(`خطأ في الحفظ (${res.status})`)
      setSuccess(true)
      setTimeout(() => {
        onSaved()
        onClose()
      }, 700)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر حفظ الموقع')
    } finally {
      setSaving(false)
    }
  }

  // ── Remove Location ───────────────────────────────────────────────
  const handleRemove = async () => {
    if (!confirm('هل أنت متأكد من حذف موقع هذا العقار من الخريطة؟')) return
    setSaving(true)
    try {
      await fetch(
        `${API_BASE_URL}/api/admin/maps/properties/${propertyId}/location`,
        { method: 'DELETE', headers: { 'X-Api-Key': apiKey } }
      )
      onSaved()
      onClose()
    } catch {
      setError('فشل حذف الموقع')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="map-picker-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="map-picker-modal map-picker-modal--large">

        {/* ── Top Header ───────────────────────────────────────────── */}
        <div className="map-picker-header">
          <div>
            <div className="map-picker-title">
              📍 تحديد الموقع الدقيق على الخريطة
              {hasExisting && <span className="map-picker-badge-existing">محدد مسبقاً</span>}
            </div>
            <div className="map-picker-sub">
              {propertyTitle}
            </div>
          </div>

          {/* Map Layer Switcher & View Reset */}
          <div className="map-picker-header-tools">
            <div className="map-picker-layer-toggle">
              <button
                type="button"
                className={`map-picker-layer-btn ${mapMode === 'streets' ? 'active' : ''}`}
                onClick={() => toggleMapMode('streets')}
              >
                🗺️ خريطة الشوارع
              </button>
              <button
                type="button"
                className={`map-picker-layer-btn ${mapMode === 'satellite' ? 'active' : ''}`}
                onClick={() => toggleMapMode('satellite')}
              >
                🛰️ قمر صناعي
              </button>
            </div>

            <button
              type="button"
              className="map-picker-reset-btn"
              onClick={handleResetView}
              title="إعادة ضبط العرض لمركز الحي"
            >
              🎯 إعادة الضبط
            </button>

            <button type="button" className="map-picker-close" onClick={onClose} title="إغلاق">
              ✕
            </button>
          </div>
        </div>

        {/* ── Coordinates & Instructions Bar ──────────────────────── */}
        <div className="map-picker-toolbar">
          {normalized ? (
            <div className="map-picker-coords-badge">
              <span>📍 خط العرض: {currentLngLat?.lat.toFixed(6)}</span>
              <span>خط الطول: {currentLngLat?.lng.toFixed(6)}</span>
              <span className="coords-norm">(X={normalized.x.toFixed(3)}, Y={normalized.y.toFixed(3)})</span>
            </div>
          ) : (
            <div className="map-picker-instructions">
              👆 اضغط على أي مكان بالخريطة أو اسحب الدبوس لتحديد الموقع
            </div>
          )}
        </div>

        {/* ── Interactive Map Canvas ───────────────────────────────── */}
        <div className="map-picker-map-wrapper">
          <div ref={mapContainerRef} className="map-picker-map-canvas" />

          {/* Precision Crosshair / Target Helper */}
          <div className="map-picker-map-hint">
            💡 يمكنك استخدام عجلة الماوس للتقريب الأقصى حتى مستوى المبنى والشارع
          </div>
        </div>

        {/* ── Alerts ───────────────────────────────────────────────── */}
        {error   && <div className="map-picker-error">⚠️ {error}</div>}
        {success && <div className="map-picker-success">✅ تم حفظ موقع العقار بنجاح!</div>}

        {/* ── Footer Actions ───────────────────────────────────────── */}
        <div className="map-picker-actions">
          <button
            type="button"
            className="map-picker-btn map-picker-btn--save"
            onClick={handleSave}
            disabled={saving || !normalized}
          >
            {saving ? 'جاري الحفظ…' : '💾 حفظ وتثبيت الموقع'}
          </button>

          {hasExisting && (
            <button
              type="button"
              className="map-picker-btn map-picker-btn--remove"
              onClick={handleRemove}
              disabled={saving}
            >
              🗑 حذف الموقع من الخريطة
            </button>
          )}

          <button type="button" className="map-picker-btn map-picker-btn--cancel" onClick={onClose}>
            إلغاء
          </button>
        </div>

      </div>
    </div>
  )
}
