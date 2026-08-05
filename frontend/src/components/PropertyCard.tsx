import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, Bath, Maximize2, MapPin, Star, Play, Building2 } from 'lucide-react'
import type { PropertyListItem } from '../types'
import './PropertyCard.css'

interface Props { property: PropertyListItem }

const listingLabel: Record<string, string> = { Sale: 'للبيع', Rent: 'للإيجار' }
const typeLabel: Record<string, string>    = { Apartment: 'شقة', Villa: 'فيلا', Studio: 'استوديو', Office: 'مكتب', Shop: 'محل' }
const statusBadge: Record<string, { label: string; cls: string }> = {
  Available:  { label: 'متاح', cls: 'badge-green' },
  Reserved:   { label: 'محجوز', cls: 'badge-gold' },
  Sold:       { label: 'مباع', cls: 'badge' },
}

export default function PropertyCard({ property: p }: Props) {
  const st = statusBadge[p.status] ?? { label: p.status, cls: 'badge' }
  const isVideo = p.primaryImageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || false
  const [imgError, setImgError] = useState(false)
  
  return (
    <Link to={`/properties/${p.id}`} className="prop-card card">
      {/* Image */}
      <div className="prop-card__img-wrap">
        {imgError || !p.primaryImageUrl ? (
          <div className="prop-card__placeholder">
            <Building2 size={48} />
            <span>صورة غير متوفرة</span>
          </div>
        ) : (
          <img 
            src={p.primaryImageUrl} 
            alt={p.title ?? ''} 
            className="prop-card__img" 
            loading="lazy" 
            onError={() => setImgError(true)}
          />
        )}
        {isVideo && (
          <div className="prop-card__video-indicator">
            <Play size={24} fill="white" />
          </div>
        )}
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
  )
}
