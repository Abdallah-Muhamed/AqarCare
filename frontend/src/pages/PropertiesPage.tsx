import { useState, useEffect, useCallback } from 'react'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import { api } from '../api'
import type { PropertyListItem, PropertyQuery } from '../types'
import PropertyCard from '../components/PropertyCard'
import Pagination from '../components/Pagination'
import './PropertiesPage.css'

const CITIES        = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الشروق', 'مدينة نصر', 'التجمع الخامس', 'أكتوبر']
const PROP_TYPES    = ['Apartment', 'Villa', 'Studio', 'Office', 'Shop']
const PROP_LABELS   = { Apartment: 'شقة', Villa: 'فيلا', Studio: 'استوديو', Office: 'مكتب', Shop: 'محل' }
const LISTING_TYPES = [{ val: 'Sale', label: 'للبيع' }, { val: 'Rent', label: 'للإيجار' }]

export default function PropertiesPage() {
  const [items, setItems]       = useState<PropertyListItem[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery]       = useState<PropertyQuery>({ pageSize: 12 })

  const fetch = useCallback((q: PropertyQuery, p: number) => {
    setLoading(true)
    api.getProperties({ ...q, page: p })
      .then(r => { setItems(r.items); setTotal(r.totalCount) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch(query, page) }, [query, page, fetch])

  const set = (key: keyof PropertyQuery, val: string | number | undefined) => {
    setQuery(q => ({ ...q, [key]: val || undefined }))
    setPage(1)
  }

  const clearFilters = () => { setQuery({ pageSize: 12 }); setPage(1) }
  const hasFilters   = Object.values(query).some(v => v !== undefined && v !== 12)
  const totalPages   = Math.ceil(total / (query.pageSize ?? 12))

  return (
    <div className="props-page">
      {/* Page header */}
      <div className="props-page__header">
        <div className="container props-page__header-inner">
          <div>
            <h1 className="section-title">العقارات <span>المتاحة</span></h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              {loading ? 'جاري التحميل...' : `${total.toLocaleString('ar-EG')} وحدة عقارية`}
            </p>
          </div>
          <button className={`btn btn-ghost props-page__filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(s => !s)}>
            <SlidersHorizontal size={16} />
            تصفية النتائج
            {hasFilters && <span className="filter-dot" />}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`filter-bar ${showFilters ? 'open' : ''}`}>
        <div className="container filter-bar__inner">
          <div className="filter-row">
            {/* City */}
            <div className="filter-group">
              <label className="filter-label">المدينة</label>
              <select className="filter-select" value={query.city ?? ''} onChange={e => set('city', e.target.value)}>
                <option value="">كل المدن</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="filter-group">
              <label className="filter-label">نوع العقار</label>
              <select className="filter-select" value={query.propertyType ?? ''} onChange={e => set('propertyType', e.target.value)}>
                <option value="">كل الأنواع</option>
                {PROP_TYPES.map(t => <option key={t} value={t}>{PROP_LABELS[t as keyof typeof PROP_LABELS]}</option>)}
              </select>
            </div>

            {/* Listing */}
            <div className="filter-group">
              <label className="filter-label">نوع الإعلان</label>
              <select className="filter-select" value={query.listingType ?? ''} onChange={e => set('listingType', e.target.value)}>
                <option value="">الكل</option>
                {LISTING_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
              </select>
            </div>

            {/* Bedrooms */}
            <div className="filter-group">
              <label className="filter-label">غرف نوم (الحد الأدنى)</label>
              <select className="filter-select" value={query.bedrooms ?? ''} onChange={e => set('bedrooms', Number(e.target.value) || undefined)}>
                <option value="">أي عدد</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ غرف</option>)}
              </select>
            </div>

            {/* Min Price */}
            <div className="filter-group">
              <label className="filter-label">الحد الأدنى للسعر</label>
              <input className="filter-input" type="number" placeholder="0" value={query.minPrice ?? ''} onChange={e => set('minPrice', Number(e.target.value) || undefined)} />
            </div>

            {/* Max Price */}
            <div className="filter-group">
              <label className="filter-label">الحد الأقصى للسعر</label>
              <input className="filter-input" type="number" placeholder="∞" value={query.maxPrice ?? ''} onChange={e => set('maxPrice', Number(e.target.value) || undefined)} />
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-ghost filter-clear" onClick={clearFilters}>
              <X size={14} /> مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container section-sm">
        {loading ? (
          <div className="row">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="col-12 col-md-4 col-lg-4"><div className="skeleton" style={{ height: 380 }} /></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Search size={56} />
            <h3>لا توجد نتائج</h3>
            <p>جرّب تغيير معايير البحث أو مسح الفلاتر</p>
            {hasFilters && <button className="btn btn-outline" style={{ marginTop: 'var(--space-lg)' }} onClick={clearFilters}>مسح الفلاتر</button>}
          </div>
        ) : (
          <>
            <div className="row">
              {items.map(p => <div key={p.id} className="col-12 col-md-4 col-lg-4"><PropertyCard property={p} /></div>)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
