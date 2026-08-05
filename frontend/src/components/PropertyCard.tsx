import { Link } from 'react-router-dom'
import { BedDouble, Bath, Maximize2, MapPin, MessageCircle, Star } from 'lucide-react'
import type { PropertyListItem } from '../types'
import './PropertyCard.css'

interface Props { property: PropertyListItem }

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'

const listingLabel: Record<string, string> = { Sale: 'للبيع', Rent: 'للإيجار' }
const typeLabel: Record<string, string>    = { Apartment: 'شقة', Villa: 'فيلا', Studio: 'استوديو', Office: 'مكتب', Shop: 'محل' }
const statusBadge: Record<string, { label: string; cls: string }> = {
  Available:  { label: 'متاح', cls: 'badge-green' },
  Reserved:   { label: 'محجوز', cls: 'badge-gold' },
  Sold:       { label: 'مباع', cls: 'badge' },
}

export default function PropertyCard({ property: p }: Props) {
  const st = statusBadge[p.status] ?? { label: p.status, cls: 'badge' }
  return (
    <article className="prop-card card">
      <Link to={`/properties/${p.id}`} style={{ display: 'block', color: 'inherit', gridColumn: '1 / -1' }}>
      {/* Image */}
      <div className="prop-card__img-wrap">
        <img src={p.primaryImageUrl ?? PLACEHOLDER} alt={p.title ?? ''} className="prop-card__img" loading="lazy" />
        <div className="prop-card__overlay" />
        {p.isFeatured && (
          <div className="prop-card__featured"><Star size={12} fill="currentColor" />مميز</div>
        )}
        {p.listingType && (
          <div className={`prop-card__listing badge ${p.listingType === 'Sale' ? 'badge-blue' : 'badge-gold'}`}>
            {listingLabel[p.listingType] ?? p.listingType}
          </div>
        )}
        <div className={`prop-card__status badge ${st.cls}`}>{st.label}</div>
      </div>

      {/* Body */}
      <div className="prop-card__body">
        {p.propertyType && <p className="prop-card__type">{typeLabel[p.propertyType] ?? p.propertyType}</p>}
        <h3 className="prop-card__title">{p.title || 'غير محدد'}</h3>
        <div className="prop-card__location">
          <MapPin size={13} />
          <span>{[p.district, p.city].filter(Boolean).join('، ') || 'غير محدد'}</span>
        </div>

        {/* Specs */}
        <div className="prop-card__specs">
          <div className="prop-card__spec"><BedDouble size={15} />{p.bedrooms ?? '—'} غرف</div>
          <div className="prop-card__spec"><Bath size={15} />{p.bathrooms ?? '—'} حمام</div>
          <div className="prop-card__spec"><Maximize2 size={15} />{p.areaSqm ?? '—'} م²</div>
        </div>

        {/* Price */}
        <div className="prop-card__price">
          {p.price != null
            ? <>{p.price.toLocaleString('ar-EG')} <span>جنيه</span></>
            : <span>السعر غير محدد</span>}
        </div>
      </div>
      </Link>
      <a
        href="https://wa.me/201055937687"
        target="_blank"
        rel="noreferrer"
        style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', margin: '0 1.1rem 1.1rem', padding: '.7rem 1rem', borderRadius: '10px', background: '#25d366', color: '#fff', fontSize: '.84rem', fontWeight: 800 }}
      >
        <MessageCircle size={17} /> تواصل معنا
      </a>
    </article>
  )
}
