import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { MapProperty } from '../../types'
import { statusClass, statusLabel } from './MansheyatMap'

const typeLabels: Record<string, string> = {
  Apartment: 'شقة', Villa: 'فيلا', Studio: 'استوديو', Office: 'مكتب', Shop: 'محل'
}
const listingLabels: Record<string, string> = { Sale: 'للبيع', Rent: 'للإيجار' }

interface Props {
  property: MapProperty
  onClose: () => void
}

export default function PropertyPopup({ property: p, onClose }: Props) {
  const cls = statusClass(p.status)

  return (
    <div className="map-popup__card">
      {/* Image */}
      {p.primaryImageUrl ? (
        <img src={p.primaryImageUrl} alt={p.title ?? ''} className="map-popup__img" loading="lazy" />
      ) : (
        <div className="map-popup__img-placeholder">🏠</div>
      )}

      <div className="map-popup__body">
        {/* Close button (mobile sheet) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.35rem' }}>
          <span className="map-popup__type">
            {typeLabels[p.propertyType ?? ''] ?? p.propertyType ?? 'عقار'}
            {p.listingType && ` · ${listingLabels[p.listingType] ?? p.listingType}`}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', padding: 0, lineHeight: 1 }}>
            <X size={16} />
          </button>
        </div>

        <div className="map-popup__title">{p.title ?? 'وحدة عقارية'}</div>

        {/* Status badge */}
        <span className={`map-popup__status map-popup__status--${cls}`}>
          {statusLabel(p.status)}
        </span>

        {/* Price */}
        {p.price != null && (
          <div className="map-popup__price">
            {p.price.toLocaleString('ar-EG')}
            <span>جنيه</span>
          </div>
        )}

        {/* Area */}
        {p.areaSqm != null && (
          <div style={{ fontSize: '.72rem', color: 'var(--clr-text-muted)', marginBottom: '.55rem' }}>
            المساحة: {p.areaSqm} م²
          </div>
        )}

        {/* CTA */}
        <Link to={`/properties/${p.id}`} className="map-popup__btn">
          عرض التفاصيل ←
        </Link>
      </div>
    </div>
  )
}
