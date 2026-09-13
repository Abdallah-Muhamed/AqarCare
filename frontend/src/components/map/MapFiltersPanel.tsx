import { SlidersHorizontal, X } from 'lucide-react'
import type { MapFilters } from '../../types'

const LISTING_TYPES = [{ val: 'Sale', label: 'للبيع' }, { val: 'Rent', label: 'للإيجار' }]
const PROP_TYPES    = [
  { val: 'Apartment', label: 'شقة' },
  { val: 'House',     label: 'بيت' },
  { val: 'Land',      label: 'أرض' },
  { val: 'Shop',      label: 'محل' },
]
const STATUSES = [
  { val: 'Available', label: 'متاح' },
  { val: 'Sold',      label: 'مباع' },
]
const FINISHING_TYPES = [
  { val: 'Core-Shell',    label: 'عظم' },
  { val: 'Semi-Finished', label: 'نصف تشطيب' },
  { val: 'Finished',      label: 'تشطيب كامل' },
  { val: 'Lux',           label: 'لوكس' },
  { val: 'Super-Lux',     label: 'سوبر لوكس' },
]

interface Props {
  filters: MapFilters
  onChange: (f: MapFilters) => void
  open: boolean
  onToggle: () => void
}

export default function MapFiltersPanel({ filters, onChange, open, onToggle }: Props) {
  const set = (key: keyof MapFilters, val: string | number | undefined) =>
    onChange({ ...filters, [key]: val || undefined })

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '')
  const clear = () => onChange({})

  return (
    <div className="map-filters">
      <button
        className={`map-filters__btn ${open ? 'active' : ''}`}
        onClick={onToggle}
        aria-label="الفلاتر"
      >
        <SlidersHorizontal size={14} />
        فلاتر
        {hasFilters && <span className="map-filters__dot" />}
      </button>

      {open && (
        <div className="map-filters__panel">
          {/* Listing type */}
          <div className="map-filters__group">
            <label className="map-filters__label">نوع الإعلان</label>
            <select className="map-filters__select" value={filters.listingType ?? ''}
              onChange={e => set('listingType', e.target.value)}>
              <option value="">الكل</option>
              {LISTING_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
            </select>
          </div>

          {/* Property type */}
          <div className="map-filters__group">
            <label className="map-filters__label">النوع</label>
            <select className="map-filters__select" value={filters.propertyType ?? ''}
              onChange={e => set('propertyType', e.target.value)}>
              <option value="">كل الأنواع</option>
              {PROP_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="map-filters__group">
            <label className="map-filters__label">الحالة</label>
            <select className="map-filters__select" value={filters.status ?? ''}
              onChange={e => set('status', e.target.value)}>
              <option value="">الكل</option>
              {STATUSES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
            </select>
          </div>

          {/* Finishing */}
          <div className="map-filters__group">
            <label className="map-filters__label">نوع التشطيب</label>
            <select className="map-filters__select" value={filters.finishingStatus ?? ''}
              onChange={e => set('finishingStatus', e.target.value)}>
              <option value="">كل أنواع التشطيب</option>
              {FINISHING_TYPES.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
            </select>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button className="map-filters__clear" onClick={clear}>
              <X size={12} style={{ marginInlineEnd: 3 }} />
              مسح الفلاتر
            </button>
          )}
        </div>
      )}
    </div>
  )
}
