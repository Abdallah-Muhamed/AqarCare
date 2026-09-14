import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SlidersHorizontal, X, Search, Map, List, Check, RotateCcw } from 'lucide-react'
import { api } from '../api'
import type { PropertyListItem, PropertyQuery } from '../types'
import PropertyCard from '../components/PropertyCard'
import Pagination from '../components/Pagination'
import './PropertiesPage.css'

const CITIES = ['المحلة الكبرى', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الشروق', 'مدينة نصر', 'التجمع الخامس', 'أكتوبر']
const DISTRICTS = ['الشعبية', 'منشية البكري', 'الرجبي', 'شكري القوتلي', 'الجمهورية', 'الزهراء', 'الوابورات']
const PROP_TYPES = ['Apartment', 'House', 'Land', 'Shop']
const PROP_LABELS: Record<string, string> = { Apartment: 'شقة', House: 'بيت / فيلا', Land: 'أرض', Shop: 'محل / تجاري' }
const LISTING_TYPES = [{ val: 'Sale', label: 'للبيع' }, { val: 'Rent', label: 'للإيجار' }]
const FINISHING_OPTS = [
  { val: 'Core-Shell',    label: 'بدون تشطيب (عظم)' },
  { val: 'Semi-Finished', label: 'نصف تشطيب' },
  { val: 'Lux',           label: 'لوكس' },
  { val: 'Super-Lux',     label: 'سوبر لوكس' },
  { val: 'High-Lux',      label: 'هاي لوكس' },
]
const SORT_OPTS = [
  { val: 'newest',     label: 'الأحدث أولاً' },
  { val: 'price_asc',  label: 'السعر: من الأقل للأعلى' },
  { val: 'price_desc', label: 'السعر: من الأعلى للأقل' },
  { val: 'area_desc',  label: 'المساحة: من الأكبر للأصغر' },
  { val: 'area_asc',   label: 'المساحة: من الأصغر للأكبر' },
]

const PAGE_SIZE = 12

export default function PropertiesPage() {
  const [rawItems, setRawItems] = useState<PropertyListItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery]       = useState<PropertyQuery>({ sortBy: 'newest' })

  // Fetch properties from backend
  const fetchProperties = useCallback(() => {
    setLoading(true)
    // Request up to 100 properties to allow rich, instant client-side filtering
    api.getProperties({ pageSize: 100 })
      .then(r => {
        setRawItems(r.items || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const set = (key: keyof PropertyQuery, val: string | number | boolean | undefined) => {
    setQuery(q => ({ ...q, [key]: val !== '' && val !== null ? val : undefined }))
    setPage(1)
  }

  const toggle = (key: keyof PropertyQuery) => {
    setQuery(q => ({ ...q, [key]: !q[key] ? true : undefined }))
    setPage(1)
  }

  const clearFilters = () => {
    setQuery({ sortBy: 'newest' })
    setPage(1)
  }

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (query.city) count++
    if (query.district) count++
    if (query.propertyType) count++
    if (query.listingType) count++
    if (query.finishingStatus) count++
    if (query.minPrice) count++
    if (query.maxPrice) count++
    if (query.minArea) count++
    if (query.maxArea) count++
    if (query.bedrooms) count++
    if (query.bathrooms) count++
    if (query.elevatorAvailable) count++
    if (query.installmentAvailable) count++
    if (query.isUnderConstruction != null) count++
    if (query.waterMeterAvailable) count++
    if (query.electricityMeterAvailable) count++
    if (query.gasMeterAvailable) count++
    if (query.search) count++
    if (query.sortBy && query.sortBy !== 'newest') count++
    return count
  }, [query])

  const hasFilters = activeFilterCount > 0

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return rawItems.filter(p => {
      // City
      if (query.city && p.city !== query.city) return false

      // District (checks district or address)
      if (query.district) {
        const matchesDistrict = p.district?.includes(query.district)
        const matchesAddress = p.address?.includes(query.district) || p.detailedAddress?.includes(query.district)
        if (!matchesDistrict && !matchesAddress) return false
      }

      // Property Type
      if (query.propertyType) {
        if (query.propertyType === 'House' && (p.propertyType === 'House' || p.propertyType === 'Villa')) {
          // match
        } else if (query.propertyType === 'Shop' && (p.propertyType === 'Shop' || p.propertyType === 'Commercial')) {
          // match
        } else if (p.propertyType !== query.propertyType) {
          return false
        }
      }

      // Listing Type
      if (query.listingType && p.listingType !== query.listingType) return false

      // Finishing Status
      if (query.finishingStatus && p.finishingStatus !== query.finishingStatus) return false

      // Prices (checks property price and floor prices)
      const floorPrices = (p.floors || []).map(f => f.price).filter((pr): pr is number => pr != null && pr > 0)
      const minP = floorPrices.length > 0 ? Math.min(...floorPrices) : (p.price ?? 0)
      const maxP = floorPrices.length > 0 ? Math.max(...floorPrices) : (p.price ?? 0)

      if (query.minPrice != null && maxP < query.minPrice) return false
      if (query.maxPrice != null && minP > query.maxPrice) return false

      // Area (checks property area and floor areas)
      const floorAreas = (p.floors || []).map(f => f.areaSqm).filter((a): a is number => a != null && a > 0)
      const minA = floorAreas.length > 0 ? Math.min(...floorAreas) : (p.areaSqm ?? 0)
      const maxA = floorAreas.length > 0 ? Math.max(...floorAreas) : (p.areaSqm ?? 0)

      if (query.minArea != null && maxA < query.minArea) return false
      if (query.maxArea != null && minA > query.maxArea) return false

      // Bedrooms
      const floorBeds = (p.floors || []).map(f => f.bedrooms).filter((b): b is number => b != null && b > 0)
      const maxBeds = floorBeds.length > 0 ? Math.max(...floorBeds) : (p.bedrooms ?? 0)
      if (query.bedrooms != null && maxBeds < query.bedrooms) return false

      // Bathrooms
      const floorBaths = (p.floors || []).map(f => f.bathrooms).filter((b): b is number => b != null && b > 0)
      const maxBaths = floorBaths.length > 0 ? Math.max(...floorBaths) : (p.bathrooms ?? 0)
      if (query.bathrooms != null && maxBaths < query.bathrooms) return false

      // Amenities & Features
      if (query.elevatorAvailable && !p.elevatorAvailable) return false
      if (query.installmentAvailable) {
        const hasInst = Boolean(p.installmentAvailable || (p.installmentPrice != null && p.installmentPrice > 0) || (p.floors || []).some(f => f.installmentPrice != null && f.installmentPrice > 0))
        if (!hasInst) return false
      }
      if (query.waterMeterAvailable && !p.waterMeterAvailable) return false
      if (query.electricityMeterAvailable && !p.electricityMeterAvailable) return false
      if (query.gasMeterAvailable && !p.gasMeterAvailable) return false
      if (query.isUnderConstruction != null && p.isUnderConstruction !== query.isUnderConstruction) return false

      // Search keyword
      if (query.search && query.search.trim()) {
        const s = query.search.trim().toLowerCase()
        const matchTitle = p.title?.toLowerCase().includes(s)
        const matchAddr  = p.address?.toLowerCase().includes(s)
        const matchDet   = p.detailedAddress?.toLowerCase().includes(s)
        const matchDist  = p.district?.toLowerCase().includes(s)
        if (!matchTitle && !matchAddr && !matchDet && !matchDist) return false
      }

      return true
    }).sort((a, b) => {
      switch (query.sortBy) {
        case 'price_asc': {
          const pA = a.price ?? 0
          const pB = b.price ?? 0
          return pA - pB
        }
        case 'price_desc': {
          const pA = a.price ?? 0
          const pB = b.price ?? 0
          return pB - pA
        }
        case 'area_desc': {
          const aA = a.areaSqm ?? 0
          const aB = b.areaSqm ?? 0
          return aB - aA
        }
        case 'area_asc': {
          const aA = a.areaSqm ?? 0
          const aB = b.areaSqm ?? 0
          return aA - aB
        }
        default:
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return b.id - a.id
      }
    })
  }, [rawItems, query])

  const total = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paginatedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="props-page">
      {/* Page header */}
      <div className="props-page__header">
        <div className="container props-page__header-inner">
          <div>
            <h1 className="section-title">العقارات <span>المتاحة</span></h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              {loading ? 'جاري التحميل...' : `${total.toLocaleString('ar-EG')} وحدة عقارية مطابقة`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View-mode tabs */}
            <div className="props-view-tabs">
              <button className="props-view-tab active">
                <List size={15} /> القائمة
              </button>
              <Link to="/map" className="props-view-tab">
                <Map size={15} /> الخريطة
              </Link>
            </div>
            {/* Filter toggle */}
            <button
              className={`btn btn-ghost props-page__filter-toggle ${showFilters || hasFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(s => !s)}
            >
              <SlidersHorizontal size={16} />
              تصفية وبحث
              {hasFilters && <span className="filter-badge-count">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`filter-bar ${showFilters ? 'open' : ''}`}>
        <div className="container filter-bar__inner">

          {/* Quick Search */}
          <div className="filter-search-box">
            <Search size={18} className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="ابحث باسم العقار، الشارع، أو الحي (مثال: الشعبية، المأمون، الفلل)..."
              value={query.search ?? ''}
              onChange={e => set('search', e.target.value)}
            />
            {query.search && (
              <button className="filter-search-clear" onClick={() => set('search', '')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Primary Filters Row */}
          <div className="filter-row">
            {/* City */}
            <div className="filter-group">
              <label className="filter-label">المدينة</label>
              <select className="filter-select" value={query.city ?? ''} onChange={e => set('city', e.target.value)}>
                <option value="">كل المدن</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* District */}
            <div className="filter-group">
              <label className="filter-label">الحي / المنطقة</label>
              <select className="filter-select" value={query.district ?? ''} onChange={e => set('district', e.target.value)}>
                <option value="">كل المناطق</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="filter-group">
              <label className="filter-label">نوع العقار</label>
              <select className="filter-select" value={query.propertyType ?? ''} onChange={e => set('propertyType', e.target.value)}>
                <option value="">كل الأنواع</option>
                {PROP_TYPES.map(t => <option key={t} value={t}>{PROP_LABELS[t]}</option>)}
              </select>
            </div>

            {/* Listing */}
            <div className="filter-group">
              <label className="filter-label">نوع الإعلان</label>
              <select className="filter-select" value={query.listingType ?? ''} onChange={e => set('listingType', e.target.value)}>
                <option value="">الكل (بيع وإيجار)</option>
                {LISTING_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
              </select>
            </div>

            {/* Finishing Status */}
            <div className="filter-group">
              <label className="filter-label">نوع التشطيب</label>
              <select className="filter-select filter-select--highlight" value={query.finishingStatus ?? ''} onChange={e => set('finishingStatus', e.target.value)}>
                <option value="">كل أنواع التشطيب</option>
                {FINISHING_OPTS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
              </select>
            </div>

            {/* Sorting */}
            <div className="filter-group">
              <label className="filter-label">الترتيب حسب</label>
              <select className="filter-select" value={query.sortBy ?? 'newest'} onChange={e => set('sortBy', e.target.value)}>
                {SORT_OPTS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Secondary Numeric Filters Row */}
          <div className="filter-row filter-row--secondary">
            {/* Bedrooms */}
            <div className="filter-group">
              <label className="filter-label">غرف النوم (الحد الأدنى)</label>
              <select className="filter-select" value={query.bedrooms ?? ''} onChange={e => set('bedrooms', Number(e.target.value) || undefined)}>
                <option value="">أي عدد غرف</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ غرف</option>)}
              </select>
            </div>

            {/* Bathrooms */}
            <div className="filter-group">
              <label className="filter-label">الحمامات (الحد الأدنى)</label>
              <select className="filter-select" value={query.bathrooms ?? ''} onChange={e => set('bathrooms', Number(e.target.value) || undefined)}>
                <option value="">أي عدد حمامات</option>
                {[1,2,3].map(n => <option key={n} value={n}>{n}+ حمام</option>)}
              </select>
            </div>

            {/* Min Price */}
            <div className="filter-group">
              <label className="filter-label">الحد الأدنى للسعر (ج)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="من 0"
                value={query.minPrice ?? ''}
                onChange={e => set('minPrice', Number(e.target.value) || undefined)}
              />
            </div>

            {/* Max Price */}
            <div className="filter-group">
              <label className="filter-label">الحد الأقصى للسعر (ج)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="إلى أقصى سعر"
                value={query.maxPrice ?? ''}
                onChange={e => set('maxPrice', Number(e.target.value) || undefined)}
              />
            </div>

            {/* Min Area */}
            <div className="filter-group">
              <label className="filter-label">أقل مساحة (م²)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="مثلاً: 80"
                value={query.minArea ?? ''}
                onChange={e => set('minArea', Number(e.target.value) || undefined)}
              />
            </div>

            {/* Max Area */}
            <div className="filter-group">
              <label className="filter-label">أكبر مساحة (م²)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="مثلاً: 200"
                value={query.maxArea ?? ''}
                onChange={e => set('maxArea', Number(e.target.value) || undefined)}
              />
            </div>
          </div>

          {/* Quick Feature Chips & Amenities */}
          <div className="filter-chips-section">
            <span className="filter-chips-label">المواصفات والخدمات:</span>
            <div className="filter-chips">
              <button
                type="button"
                className={`filter-chip ${query.installmentAvailable ? 'active' : ''}`}
                onClick={() => toggle('installmentAvailable')}
              >
                {query.installmentAvailable && <Check size={13} />}
                💳 متاح تقسيط
              </button>

              <button
                type="button"
                className={`filter-chip ${query.elevatorAvailable ? 'active' : ''}`}
                onClick={() => toggle('elevatorAvailable')}
              >
                {query.elevatorAvailable && <Check size={13} />}
                🛗 متوفر أسانسير
              </button>

              <button
                type="button"
                className={`filter-chip ${query.waterMeterAvailable ? 'active' : ''}`}
                onClick={() => toggle('waterMeterAvailable')}
              >
                {query.waterMeterAvailable && <Check size={13} />}
                💧 عداد مياه
              </button>

              <button
                type="button"
                className={`filter-chip ${query.electricityMeterAvailable ? 'active' : ''}`}
                onClick={() => toggle('electricityMeterAvailable')}
              >
                {query.electricityMeterAvailable && <Check size={13} />}
                ⚡ عداد كهرباء
              </button>

              <button
                type="button"
                className={`filter-chip ${query.gasMeterAvailable ? 'active' : ''}`}
                onClick={() => toggle('gasMeterAvailable')}
              >
                {query.gasMeterAvailable && <Check size={13} />}
                🔥 عداد غاز
              </button>

              <button
                type="button"
                className={`filter-chip ${query.isUnderConstruction === true ? 'active' : ''}`}
                onClick={() => set('isUnderConstruction', query.isUnderConstruction === true ? undefined : true)}
              >
                {query.isUnderConstruction === true && <Check size={13} />}
                🏗️ تحت الإنشاء
              </button>

              <button
                type="button"
                className={`filter-chip ${query.isUnderConstruction === false ? 'active' : ''}`}
                onClick={() => set('isUnderConstruction', query.isUnderConstruction === false ? undefined : false)}
              >
                {query.isUnderConstruction === false && <Check size={13} />}
                🔑 جاهز للاستلام
              </button>
            </div>

            {hasFilters && (
              <button className="btn btn-ghost filter-clear" onClick={clearFilters}>
                <RotateCcw size={13} /> مسح كل الفلاتر ({activeFilterCount})
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Results */}
      <div className="container section-sm">
        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)}
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="empty-state">
            <Search size={56} />
            <h3>لا توجد نتائج مطابقة</h3>
            <p>جرّب تغيير معايير البحث أو تقليل الفلاتر المختارة</p>
            {hasFilters && (
              <button className="btn btn-outline" style={{ marginTop: 'var(--space-lg)' }} onClick={clearFilters}>
                مسح الفلاتر والبدء من جديد
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid-3">
              {paginatedItems.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
