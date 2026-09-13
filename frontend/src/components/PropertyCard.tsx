import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, Bath, Maximize2, MapPin, Star, Play } from 'lucide-react'
import type { PropertyListItem } from '../types'
import './PropertyCard.css'

interface Props { property: PropertyListItem }

const listingLabel: Record<string, string> = { Sale: 'للبيع', Rent: 'للإيجار' }
const typeLabel: Record<string, string>    = { Apartment: 'شقة', House: 'بيت', Villa: 'بيت', Land: 'أرض', Shop: 'محل' }
const statusBadge: Record<string, { label: string; cls: string }> = {
  Available:  { label: 'متاح', cls: 'badge-green' },
  Reserved:   { label: 'محجوز', cls: 'badge-gold' },
  Sold:       { label: 'مباع', cls: 'badge' },
}

export default function PropertyCard({ property: p }: Props) {
  const st = statusBadge[p.status] ?? { label: p.status, cls: 'badge' }
  const isVideo = p.primaryImageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || false
  const [imgError, setImgError] = useState(false)
  const placeholderImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'
  
  return (
    <Link to={`/properties/${p.id}`} className="prop-card card">
      {/* Image */}
      <div className="prop-card__img-wrap">
        <img 
          src={imgError || !p.primaryImageUrl ? placeholderImage : p.primaryImageUrl} 
          alt={p.title ?? ''} 
          className="prop-card__img" 
          loading="lazy" 
          onError={() => setImgError(true)}
        />
        {isVideo && (
          <div className="prop-card__video-indicator">
            <Play size={24} fill="white" />
          </div>
        )}
        <div className="prop-card__overlay" />
        {p.isFeatured && (
          <div className="prop-card__featured"><Star size={12} fill="currentColor" />مميز</div>
        )}
        {p.isUnderConstruction && (
          <div className="prop-card__featured" style={{ right: p.isFeatured ? '74px' : '12px', background: '#fffbeb', color: '#b45309' }}>
            🏗️ تحت الإنشاء
          </div>
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
          {(() => {
            const floorPrices = p.floors?.filter(f => f.isAvailable && f.price != null).map(f => f.price as number) ?? [];
            if (floorPrices.length > 0) {
              const minPrice = Math.min(...floorPrices);
              return (
                <div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>يبدأ من </span>
                    {minPrice.toLocaleString('ar-EG')} <span>جنيه</span>
                  </div>
                  <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--clr-gold)', fontWeight: 700 }}>
                    🏢 {p.floors!.length} أدوار بأسعار مختلفة
                  </small>
                </div>
              );
            }

            return (
              <div>
                {p.price != null ? (
                  <>{p.price.toLocaleString('ar-EG')} <span>جنيه</span></>
                ) : (
                  <span>السعر غير محدد</span>
                )}
                {p.installmentPrice != null && (
                  <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--clr-gold)', fontWeight: 700 }}>
                    💳 تقسيط: {p.installmentPrice.toLocaleString('ar-EG')} ج
                  </small>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </Link>
  )
}
