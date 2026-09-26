import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { List, SlidersHorizontal, X } from 'lucide-react'
import { api } from '../api'
import type { CityMap, MapFilters, MapProperty } from '../types'
import { formatFloorsText, getTotalAvailableUnits } from '../utils/formatters'
import { setPageSeo } from '../utils/seo'
import { getPropertyPlaceholder } from '../constants/placeholders'
import MapGLView from '../components/map/MapGLView'
import './MapPage.css'

const CITY_SLUG = 'mansheyat-el-bakry'

const FILTER_OPTS = {
  status:       [{ v: 'Available', l: 'متاح' }, { v: 'Sold', l: 'مباع' }],
  listingType:  [{ v: 'Sale', l: 'للبيع' }, { v: 'Rent', l: 'للإيجار' }],
  propertyType: [
    { v: 'House',     l: 'منازل' },
    { v: 'Apartment', l: 'شقة' },
    { v: 'Land',      l: 'أرض' },
    { v: 'Shop',      l: 'محل' },
  ],
  finishingStatus: [
    { v: 'Core-Shell',      l: 'عظم' },
    { v: 'Semi-Finished',   l: 'نصف تشطيب' },
    { v: 'Lux',             l: 'لوكس' },
    { v: 'Super-Lux',       l: 'سوبر لوكس' },
    { v: 'Ultra-Super-Lux', l: 'ألترا سوبر لوكس' },
    { v: 'High-Lux',        l: 'هاي لوكس' },
    { v: 'Mixed',           l: 'تشطيب متعدد' },
  ],
}

const FINISHING_LABELS: Record<string, string> = {
  'Core-Shell':      'عظم',
  'Semi-Finished':   'نص تشطيب',
  'Finished':        'تشطيب',
  'Lux':             'لوكس',
  'Super-Lux':       'سوبر لوكس',
  'Ultra-Super-Lux': 'ألترا سوبر لوكس',
  'High-Lux':        'هاي لوكس',
  'Mixed':           'تشطيب متعدد',
}

const TYPE_LABELS: Record<string, string> = {
  Apartment:  'شقة',
  House:      'منزل',
  Villa:      'فيلا',
  Land:       'أرض',
  Shop:       'محل',
  Commercial: 'تجاري',
}

const LISTING_LABELS: Record<string, string> = {
  Sale: 'للبيع',
  Rent: 'للإيجار',
}

const STATUS_LABELS: Record<string, string> = {
  Available: 'متاح',
  Reserved:  'محجوز',
  Sold:      'مباع',
}

export default function MapPage() {
  const [searchParams]                         = useSearchParams()
  const [data,             setData]             = useState<CityMap | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState<string | null>(null)
  const [filters,          setFilters]          = useState<MapFilters>({})
  const [filterOpen,       setFilterOpen]       = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)

  const targetPropertyId = searchParams.get('propertyId') || searchParams.get('id')

  useEffect(() => {
    setPageSeo({
      title: 'خريطة عقارات منشية البكري التفاعلية | عقار كير',
      description: 'استكشف الوحدات السكنية والتجارية جغرافياً على خريطة منشية البكري والمحلة الكبرى التفاعلية مع تفاصيل الأسعار وحالة الحجز والبيع.',
      url: 'https://aqar-care.vercel.app/map'
    })

    Promise.all([
      api.getMap(CITY_SLUG),
      api.getProperties({ pageSize: 100 }).catch(() => null)
    ])
      .then(([mapData, propList]) => {
        if (mapData && propList?.items) {
          const propMap = new Map(propList.items.map(p => [p.id, p]))
          mapData.properties = mapData.properties.map(mp => {
            const matched = propMap.get(mp.id)
            return {
              ...mp,
              floors: (mp.floors && mp.floors.length > 0) ? mp.floors : matched?.floors,
              numberOfFloors: mp.numberOfFloors ?? matched?.numberOfFloors,
              apartmentsPerFloor: mp.apartmentsPerFloor ?? matched?.apartmentsPerFloor,
              finishedApartments: mp.finishedApartments ?? matched?.finishedApartments,
              semiFinishedApartments: mp.semiFinishedApartments ?? matched?.semiFinishedApartments,
              coreShellApartments: mp.coreShellApartments ?? matched?.coreShellApartments,
            }
          })
        }
        setData(mapData)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  // Auto-select property if propertyId is provided in URL
  useEffect(() => {
    if (data && targetPropertyId) {
      const found = data.properties.find(p => p.id === Number(targetPropertyId))
      if (found) {
        setSelectedProperty(found)
      }
    }
  }, [data, targetPropertyId])

  // Coordinate body class when property sheet is open (e.g. to hide floating chatbot launcher on mobile)
  useEffect(() => {
    if (selectedProperty) {
      document.body.classList.add('map-card-open')
    } else {
      document.body.classList.remove('map-card-open')
    }
    return () => {
      document.body.classList.remove('map-card-open')
    }
  }, [selectedProperty])

  const set = (key: keyof MapFilters, val: string) =>
    setFilters(f => ({ ...f, [key]: val || undefined }))
  const clearAll = () => setFilters({})
  const hasFilters = Object.values(filters).some(Boolean)

  const activeProperties = data ? data.properties.filter(p => {
    if (p.status === 'Reserved') return false
    if (filters.status && p.status !== filters.status) return false
    if (filters.listingType && p.listingType !== filters.listingType) return false
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false
    if (filters.finishingStatus && p.finishingStatus !== filters.finishingStatus) return false
    return true
  }) : []

  const counts = {
    Available: getTotalAvailableUnits(activeProperties, 'Available'),
    Sold:      getTotalAvailableUnits(activeProperties, 'Sold'),
  }

  const totalUnits = getTotalAvailableUnits(activeProperties, filters.status)

  return (
    <div className={`mappage ${selectedProperty ? 'mappage--card-open' : ''}`}>

      {/* ── Floating top bar ──────────────────────────────────── */}
      <div className="mappage__bar">
        <span className="mappage__bar-title">
          🗺 <span>الخريطة التفاعلية</span>
          {data && (
            <span style={{ fontSize: '.72rem', fontWeight: 600, color: '#b77a3d', marginInlineStart: 4 }}>
              {totalUnits === 0 ? (
                filters.status === 'Sold' ? 'لا توجد شقق مباعة' : 'لا توجد شقق متاحة'
              ) : (
                (() => {
                  const countStr = totalUnits.toLocaleString('ar-EG')
                  if (filters.propertyType === 'Land') return `${countStr} أرض متاحة`
                  if (filters.propertyType === 'Shop') return `${countStr} محل متاح`
                  if (filters.propertyType === 'House') return `${countStr} منزل متاح`
                  if (filters.status === 'Sold') return `${countStr} شقة مباعة`
                  return `${countStr} شقة متاحة`
                })()
              )}
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
                  {({ status:'الحالة', listingType:'نوع الإعلان', propertyType:'النوع', finishingStatus:'نوع التشطيب' } as Record<string,string>)[key]}
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
      {selectedProperty && (() => {
        const p = selectedProperty
        const statusLabel = STATUS_LABELS[p.status] ?? p.status
        const typeLabel = TYPE_LABELS[p.propertyType ?? ''] ?? p.propertyType ?? 'عقار'
        const listingLabel = LISTING_LABELS[p.listingType ?? ''] ?? ''
        const finishing = p.finishingStatus ? (FINISHING_LABELS[p.finishingStatus] ?? p.finishingStatus) : ''

        const isHouse = p.propertyType === 'House' || p.propertyType === 'Villa'
        const isLand  = p.propertyType === 'Land'
        const isShop  = p.propertyType === 'Shop' || p.propertyType === 'Commercial'

        // Price calculation considering floors
        const availableFloors = !isHouse && !isLand && p.floors && p.floors.length > 0 ? p.floors.filter(f => f.isAvailable) : []
        const targetFloors = availableFloors.length > 0 ? availableFloors : (!isHouse && !isLand ? (p.floors || []) : [])
        const cashPrices = targetFloors.map(f => f.price).filter((pr): pr is number => pr != null && pr > 0)
        const instPrices = targetFloors.map(f => f.installmentPrice).filter((pr): pr is number => pr != null && pr > 0)

        const minCash = cashPrices.length > 0 ? Math.min(...cashPrices) : (p.price != null && p.price > 0 ? p.price : null)
        const maxCash = cashPrices.length > 0 ? Math.max(...cashPrices) : (p.price != null && p.price > 0 ? p.price : null)

        const minInst = instPrices.length > 0 ? Math.min(...instPrices) : (p.installmentPrice != null && p.installmentPrice > 0 ? p.installmentPrice : null)
        const maxInst = instPrices.length > 0 ? Math.max(...instPrices) : (p.installmentPrice != null && p.installmentPrice > 0 ? p.installmentPrice : null)

        const formatPrice = (min: number | null, max: number | null) => {
          if (min == null) return null
          if (isHouse || isLand || isShop || max == null || min === max) return `${min.toLocaleString('ar-EG')} جنيه`
          return `يبدأ من ${min.toLocaleString('ar-EG')} جنيه`
        }

        const defaultImg = getPropertyPlaceholder(p.propertyType)
        const imgUrl = p.primaryImageUrl || defaultImg

        const hasFloors = !isLand && (((p.floors && p.floors.length > 0)) || p.floorNumber != null)
        const floorsText = !isLand && (p.floors && p.floors.length > 0
          ? formatFloorsText(p.floors, p.propertyType)
          : p.floorNumber != null
            ? (p.floorNumber === 0 ? 'الدور الأرضي' : `الدور ${p.floorNumber}`)
            : null)

        const hasServices = p.waterMeterAvailable || p.electricityMeterAvailable || p.gasMeterAvailable || p.elevatorAvailable || p.installmentAvailable || minInst != null

        return (
          <>
            <div
              className="mappage__backdrop"
              onClick={() => setSelectedProperty(null)}
            />
            <div className="mappage__mobile-card-wrap">
              <div className="mappage__mobile-card" onClick={e => e.stopPropagation()}>
                <div className="mappage__mobile-card-drag" onClick={() => setSelectedProperty(null)} />

                {/* Full-width image header */}
                <div className="mappage__mobile-card-img-wrap">
                  <img
                    src={imgUrl}
                    alt={p.title || 'وحدة عقارية'}
                    className="mappage__mobile-card-img"
                    onError={e => {
                      ;(e.currentTarget as HTMLImageElement).src = defaultImg
                    }}
                  />

                  {/* Close button */}
                  <button
                    className="mappage__mobile-card-close"
                    onClick={() => setSelectedProperty(null)}
                    aria-label="إغلاق"
                  >
                    <X size={14} />
                  </button>

                  {/* Badges on image */}
                  <div className="mappage__mobile-card-badges">
                    <span className={`mapgl-popup__badge mapgl-popup__badge--${p.status}`}>
                      {statusLabel}
                    </span>
                    {listingLabel && (
                      <span className="mapgl-popup__badge mapgl-popup__badge--listing">
                        {listingLabel}
                      </span>
                    )}
                    <span className="mapgl-popup__badge mapgl-popup__badge--type">
                      {typeLabel}
                    </span>
                    {p.isUnderConstruction && (
                      <span className="mapgl-popup__badge" style={{ background: '#b45309', color: '#fff' }}>
                        🏗️ تحت الإنشاء
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="mappage__mobile-card-body">
                  <h3 className="mappage__mobile-card-title">{p.title?.trim() || 'وحدة عقارية'}</h3>

                  {p.address && (
                    <div className="mappage__mobile-card-address">
                      📍 {p.address}
                    </div>
                  )}

                  {/* Pricing line */}
                  <div className="mappage__mobile-card-pricing">
                    {minCash != null ? (
                      <div className="mappage__mobile-card-price-line">
                        <span className="mappage__mobile-card-price-val">
                          {isHouse ? 'سعر البيت كاش' : isLand ? 'سعر الأرض كاش' : isShop ? 'سعر المحل كاش' : 'سعر الكاش'}: {formatPrice(minCash, maxCash)}
                        </span>
                        {!isHouse && !isLand && cashPrices.length > 1 && minCash !== maxCash && (
                          <span className="mappage__mobile-card-badge-sub">حسب الدور</span>
                        )}
                      </div>
                    ) : (
                      <div className="mappage__mobile-card-price-line">
                        <span className="mappage__mobile-card-price-val">السعر عند الطلب</span>
                      </div>
                    )}

                    {minInst != null && (
                      <div className="mappage__mobile-card-price-line mappage__mobile-card-price-inst">
                        <span>💳 {isHouse ? 'سعر التقسيط للبيت' : isLand ? 'سعر التقسيط للأرض' : isShop ? 'سعر التقسيط للمحل' : 'سعر التقسيط'}: {formatPrice(minInst, maxInst)}</span>
                        {!isHouse && !isLand && instPrices.length > 1 && minInst !== maxInst && (
                          <span className="mappage__mobile-card-badge-sub">حسب الدور</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Specs row */}
                  <div className="mappage__mobile-card-specs">
                    {p.areaSqm != null && (
                      <div className="mappage__mobile-card-spec">📐 <span>{p.areaSqm} م²</span></div>
                    )}
                    {isHouse ? (
                      <>
                        <div className="mappage__mobile-card-spec">🏢 <span>{p.numberOfFloors ?? (p.floors?.length || '—')} أدوار</span></div>
                        {p.apartmentsPerFloor != null && p.apartmentsPerFloor > 0 && (
                          <div className="mappage__mobile-card-spec">🚪 <span>{p.apartmentsPerFloor === 1 ? 'شقة بالدور' : p.apartmentsPerFloor === 2 ? 'شقتين بالدور' : `${p.apartmentsPerFloor} شقق بالدور`}</span></div>
                        )}
                        {(p.finishedApartments ?? 0) > 0 && (
                          <div className="mappage__mobile-card-spec" style={{ color: '#047857', fontWeight: 700 }}>✨ <span>{p.finishedApartments} متشطب</span></div>
                        )}
                        {(p.semiFinishedApartments ?? 0) > 0 && (
                          <div className="mappage__mobile-card-spec" style={{ color: '#b45309', fontWeight: 700 }}>🧱 <span>{p.semiFinishedApartments} نص تشطيب</span></div>
                        )}
                        {(p.coreShellApartments ?? 0) > 0 && (
                          <div className="mappage__mobile-card-spec" style={{ color: '#475569', fontWeight: 700 }}>🏗️ <span>{p.coreShellApartments} عظم</span></div>
                        )}
                      </>
                    ) : (
                      <>
                        {!isLand && !isShop && p.bedrooms != null && (
                          <div className="mappage__mobile-card-spec">🛏️ <span>{p.bedrooms} غرف</span></div>
                        )}
                        {!isLand && p.bathrooms != null && (
                          <div className="mappage__mobile-card-spec">🚿 <span>{p.bathrooms} حمام</span></div>
                        )}
                        {hasFloors && floorsText && (
                          <div className="mappage__mobile-card-spec">🏢 <span>{floorsText}</span></div>
                        )}
                        {!isLand && !isShop && p.apartmentsPerFloor != null && p.apartmentsPerFloor > 0 && (
                          <div className="mappage__mobile-card-spec">
                            🏢 <span>{p.apartmentsPerFloor === 1 ? 'شقة بالدور' : p.apartmentsPerFloor === 2 ? 'شقتين بالدور' : `${p.apartmentsPerFloor} شقق بالدور`}</span>
                          </div>
                        )}
                        {!isLand && finishing && (
                          <div className="mappage__mobile-card-spec">🎨 <span>{finishing}</span></div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Services tags */}
                  {hasServices && (
                    <div className="mappage__mobile-card-tags">
                      {p.waterMeterAvailable && (
                        <span className="mapgl-popup__tag">💧 مياه</span>
                      )}
                      {p.electricityMeterAvailable && (
                        <span className="mapgl-popup__tag">⚡ كهرباء</span>
                      )}
                      {p.gasMeterAvailable && (
                        <span className="mapgl-popup__tag">🔥 غاز</span>
                      )}
                      {p.elevatorAvailable && (
                        <span className="mapgl-popup__tag">🛗 أسانسير</span>
                      )}
                      {(p.installmentAvailable || minInst != null) && (
                        <span className="mapgl-popup__tag mapgl-popup__tag--green">💳 تقسيط متاح</span>
                      )}
                    </div>
                  )}

                  {/* Action button */}
                  <Link
                    to={`/properties/${p.id}`}
                    className="mappage__mobile-card-action"
                  >
                    عرض التفاصيل الكاملة ←
                  </Link>
                </div>
              </div>
            </div>
          </>
        )
      })()}

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
