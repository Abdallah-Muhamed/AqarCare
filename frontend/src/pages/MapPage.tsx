import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { List, SlidersHorizontal, X } from 'lucide-react'
import { api } from '../api'
import type { CityMap, MapFilters, MapProperty } from '../types'
import { formatFloorsText } from '../utils/formatters'
import MapGLView from '../components/map/MapGLView'
import './MapPage.css'

const CITY_SLUG = 'mansheyat-el-bakry'

const FILTER_OPTS = {
  status:       [{ v: 'Available', l: 'متاح' }, { v: 'Sold', l: 'مباع' }],
  listingType:  [{ v: 'Sale', l: 'للبيع' }, { v: 'Rent', l: 'للإيجار' }],
  propertyType: [
    { v: 'Apartment', l: 'شقة' },
    { v: 'House',     l: 'بيت' },
    { v: 'Land',      l: 'أرض' },
    { v: 'Shop',      l: 'محل' },
  ],
}

const FINISHING_LABELS: Record<string, string> = {
  'Core-Shell':   'عظم',
  'Semi-Finished': 'نص تشطيب',
  'Finished':     'تشطيب',
  'Lux':          'لوكس',
  'Super-Lux':    'سوبر لوكس',
  'High-Lux':     'هاي لوكس',
}

export default function MapPage() {
  const [data,             setData]             = useState<CityMap | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState<string | null>(null)
  const [filters,          setFilters]          = useState<MapFilters>({})
  const [filterOpen,       setFilterOpen]       = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)

  useEffect(() => {
    api.getMap(CITY_SLUG)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof MapFilters, val: string) =>
    setFilters(f => ({ ...f, [key]: val || undefined }))
  const clearAll = () => setFilters({})
  const hasFilters = Object.values(filters).some(Boolean)

  const activeProperties = data ? data.properties.filter(p => p.status !== 'Reserved') : []
  const counts = {
    Available: activeProperties.filter(p => p.status === 'Available').length,
    Sold:      activeProperties.filter(p => p.status === 'Sold').length,
  }

  return (
    <div className={`mappage ${selectedProperty ? 'mappage--card-open' : ''}`}>

      {/* ── Floating top bar ──────────────────────────────────── */}
      <div className="mappage__bar">
        <span className="mappage__bar-title">
          🗺 <span>الخريطة التفاعلية</span>
          {data && (
            <span style={{ fontSize: '.72rem', fontWeight: 600, color: '#b77a3d', marginInlineStart: 4 }}>
              {activeProperties.length} وحدة
            </span>
          )}
        </span>

        <span className="mappage__bar-sep">|</span>

        {/* Filter toggle */}
        <button
          className={`mappage__bar-btn ${filterOpen ? 'mappage__bar-btn--active' : ''}`}
          onClick={() => {
            setFilterOpen(o => !o)
            if (!filterOpen) setSelectedProperty(null)
          }}
        >
          <SlidersHorizontal size={13} />
          فلاتر
          {hasFilters && <span style={{ width:6, height:6, background:'#b77a3d', borderRadius:'50%' }} />}
        </button>

        {/* Properties list link */}
        <Link to="/properties" className="mappage__bar-btn">
          <List size={13} /> القائمة
        </Link>
      </div>

      {/* ── Filter dropdown with click-outside backdrop ─────────── */}
      {filterOpen && (
        <>
          <div
            className="mappage__filter-backdrop"
            onClick={() => setFilterOpen(false)}
          />
          <div className="mappage__filter-dropdown" onClick={e => e.stopPropagation()}>
            {(Object.entries(FILTER_OPTS) as [keyof typeof FILTER_OPTS, {v:string,l:string}[]][]).map(([key, opts]) => (
              <div key={key}>
                <div style={{ fontSize: '.7rem', fontWeight: 600, color: '#8a7a60', marginBottom: 4 }}>
                  {({ status:'الحالة', listingType:'نوع الإعلان', propertyType:'النوع' } as Record<string,string>)[key]}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  <button
                    onClick={() => set(key, '')}
                    style={{
                      padding:'3px 9px', borderRadius:99, border:'1px solid #d4c9b0',
                      background: !filters[key] ? '#2d4a3e' : '#f8f4ec',
                      color: !filters[key] ? '#fff' : '#5c5240',
                      fontSize:'.72rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    }}
                  >الكل</button>
                  {opts.map(o => (
                    <button key={o.v}
                      onClick={() => set(key, o.v)}
                      style={{
                        padding:'3px 9px', borderRadius:99, border:'1px solid #d4c9b0',
                        background: filters[key]===o.v ? '#2d4a3e' : '#f8f4ec',
                        color: filters[key]===o.v ? '#fff' : '#5c5240',
                        fontSize:'.72rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                      }}
                    >{o.l}</button>
                  ))}
                </div>
              </div>
            ))}
            {hasFilters && (
              <button onClick={clearAll} style={{
                fontSize:'.72rem', color:'#b77a3d', background:'none', border:'none',
                cursor:'pointer', display:'flex', alignItems:'center', gap:4,
                fontFamily:'inherit', alignSelf:'flex-end',
              }}>
                <X size={11} /> مسح الكل
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Mobile Property Bottom Sheet & Outside Click Dismissal ── */}
      {selectedProperty && (
        <>
          <div
            className="mappage__backdrop"
            onClick={() => setSelectedProperty(null)}
          />
          <div className="mappage__mobile-card-wrap">
            <div className="mappage__mobile-card" onClick={e => e.stopPropagation()}>
              <div className="mappage__mobile-card-drag" onClick={() => setSelectedProperty(null)} />

              <div className="mappage__mobile-card-top">
                <div className="mappage__mobile-card-img-wrap">
                  <img
                    src={selectedProperty.primaryImageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80'}
                    alt={selectedProperty.title || 'وحدة عقارية'}
                    className="mappage__mobile-card-img"
                    onError={e => {
                      ;(e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80'
                    }}
                  />
                  <div className="mappage__mobile-card-badges">
                    <span className={`mapgl-popup__badge mapgl-popup__badge--${selectedProperty.status}`}>
                      {selectedProperty.status === 'Available' ? 'متاح' : selectedProperty.status === 'Sold' ? 'مباع' : 'محجوز'}
                    </span>
                    {selectedProperty.listingType && (
                      <span className="mapgl-popup__badge mapgl-popup__badge--listing">
                        {selectedProperty.listingType === 'Sale' ? 'للبيع' : 'للإيجار'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mappage__mobile-card-info">
                  <div className="mappage__mobile-card-header">
                    <h4 className="mappage__mobile-card-title">{selectedProperty.title?.trim() || 'وحدة عقارية'}</h4>
                    <button
                      className="mappage__mobile-card-close"
                      onClick={() => setSelectedProperty(null)}
                      aria-label="إغلاق"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {selectedProperty.address && (
                    <div className="mappage__mobile-card-address">
                      📍 {selectedProperty.address}
                    </div>
                  )}

                  <div className="mappage__mobile-card-price">
                    {selectedProperty.price != null
                      ? `${selectedProperty.price.toLocaleString('ar-EG')} جنيه`
                      : 'السعر عند الطلب'}
                  </div>
                </div>
              </div>

              {/* Specs row */}
              <div className="mappage__mobile-card-specs">
                {selectedProperty.areaSqm != null && (
                  <div className="mappage__mobile-card-spec">📐 <span>{selectedProperty.areaSqm} م²</span></div>
                )}
                {selectedProperty.bedrooms != null && (
                  <div className="mappage__mobile-card-spec">🛏️ <span>{selectedProperty.bedrooms} غرف</span></div>
                )}
                {selectedProperty.bathrooms != null && (
                  <div className="mappage__mobile-card-spec">🚿 <span>{selectedProperty.bathrooms} حمام</span></div>
                )}
                {selectedProperty.floorNumber != null ? (
                  <div className="mappage__mobile-card-spec">
                    🏢 <span>{selectedProperty.floorNumber === 0 ? 'الدور الأرضي' : `الدور ${selectedProperty.floorNumber}`}</span>
                  </div>
                ) : selectedProperty.floors && selectedProperty.floors.length > 0 ? (
                  <div className="mappage__mobile-card-spec">
                    🏢 <span>{formatFloorsText(selectedProperty.floors)}</span>
                  </div>
                ) : null}
                {selectedProperty.finishingStatus && (
                  <div className="mappage__mobile-card-spec">
                    🎨 <span>{FINISHING_LABELS[selectedProperty.finishingStatus] || selectedProperty.finishingStatus}</span>
                  </div>
                )}
              </div>

              {/* Action button */}
              <Link
                to={`/properties/${selectedProperty.id}`}
                className="mappage__mobile-card-action"
              >
                عرض التفاصيل الكاملة ←
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── Map (full remaining area) ──────────────────────────── */}
      <div className="mappage__map">
        {data && (
          <MapGLView
            data={data}
            filters={filters}
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
          />
        )}

        {/* Legend */}
        <div className="mappage__legend">
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#3d3424', marginBottom: 4 }}>الحالة:</div>
          {(['Available', 'Sold'] as const).map(s => (
            <div key={s} className="mappage__legend-item">
              <span className={`mappage__legend-dot mappage__legend-dot--${s}`} />
              {{ Available:'متاح', Sold:'مباع' }[s]}
              <span style={{ color:'#b8a87a', fontSize:'.65rem' }}>({counts[s]})</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #e2dac8', margin: '4px 0', paddingTop: 4 }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#3d3424', marginBottom: 3 }}>التشطيب:</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, background: '#78350f', color: '#fef3c7', padding: '1px 5px', borderRadius: 4 }}>عظم</span>
              <span style={{ fontSize: '9px', fontWeight: 800, background: '#0369a1', color: '#e0f2fe', padding: '1px 5px', borderRadius: 4 }}>نص</span>
              <span style={{ fontSize: '9px', fontWeight: 800, background: '#15803d', color: '#f0fdf4', padding: '1px 5px', borderRadius: 4 }}>تشطيب</span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mappage__loading">
            <div className="mappage__loading-spinner" />
            <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'.9rem', color:'#7a6e55' }}>
              جاري تحميل الخريطة…
            </span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mappage__loading">
            <span style={{ fontFamily:"'Cairo',sans-serif", color:'#dc2626', fontSize:'.85rem' }}>
              ❌ {error}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
