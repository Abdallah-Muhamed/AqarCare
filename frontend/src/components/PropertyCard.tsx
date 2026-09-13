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
            const availableFloors = p.floors && p.floors.length > 0
              ? p.floors.filter(f => f.isAvailable && (f.price != null || f.pricePerMeter != null))
              : [];

            if (availableFloors.length > 0) {
              return (
                <div className="prop-card__floors-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  {availableFloors.map((fl, idx) => {
                    const floorLabel = fl.floorName || (fl.floorNumber ? `الدور ${fl.floorNumber}` : `الدور ${idx + 1}`);
                    return (
                      <div key={idx} style={{ fontSize: '0.82rem', lineHeight: '1.4', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: idx < availableFloors.length - 1 ? '1px dashed rgba(183,121,61,0.2)' : 'none', paddingBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--clr-text)', minWidth: '60px' }}>{floorLabel}:</span>
                        <div style={{ textAlign: 'left' }}>
                          {fl.price != null && (
                            <span style={{ fontWeight: 900, color: '#182821' }}>
                              {fl.price.toLocaleString('ar-EG')} <span style={{ fontSize: '0.7rem' }}>جنيه</span>
                            </span>
                          )}
                          {fl.pricePerMeter != null && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--clr-gold)', display: 'block', fontWeight: 600 }}>
                              ({fl.pricePerMeter.toLocaleString('ar-EG')} ج/م²)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
