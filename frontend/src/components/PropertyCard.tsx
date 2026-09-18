import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, Bath, Maximize2, MapPin, Star, Play } from 'lucide-react'
import type { PropertyListItem } from '../types'
import { formatFloorsText } from '../utils/formatters'
import './PropertyCard.css'

interface Props { property: PropertyListItem }

const listingLabel: Record<string, string> = { Sale: 'للبيع', Rent: 'للإيجار' }
const typeLabel: Record<string, string>    = { Apartment: 'شقة', House: 'بيت', Villa: 'بيت', Land: 'أرض', Shop: 'محل' }
const finishingLabel: Record<string, string> = {
  'Core-Shell':      'عظم',
  'Semi-Finished':   'نصف تشطيب',
  'Finished':        'تشطيب كامل',
  'Lux':             'لوكس',
  'Super-Lux':       'سوبر لوكس',
  'Ultra-Super-Lux': 'ألترا سوبر لوكس',
  'High-Lux':        'هاي لوكس',
  'Mixed':           'تشطيب متعدد',
}
const statusBadge: Record<string, { label: string; cls: string }> = {
  Available:  { label: 'متاح', cls: 'badge-green' },
  Reserved:   { label: 'محجوز', cls: 'badge-gold' },
  Sold:       { label: 'تم البيع', cls: 'badge-sold' },
}

export default function PropertyCard({ property: p }: Props) {
  const isSold = p.status?.toLowerCase() === 'sold' || (p.floors && p.floors.length > 0 && p.floors.every(f => f.isAvailable === false))
  const st = isSold 
    ? { label: 'تم البيع', cls: 'badge-sold' } 
    : (statusBadge[p.status] ?? { label: p.status, cls: 'badge' })
  const isVideo = p.primaryImageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || false
  const [imgError, setImgError] = useState(false)
  const placeholderImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'

  const optimizeCloudinaryUrl = (url?: string | null) => {
    if (!url) return placeholderImage
    if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/f_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto,w_600,c_fill/')
    }
    return url
  }

  // Full detailed location
  const detailedLoc = p.detailedAddress || p.address
  const generalLoc = [p.district, p.city].filter(Boolean).join('، ')
  const fullLocation = detailedLoc
    ? (generalLoc && !detailedLoc.includes(p.district || '') ? `${detailedLoc} — ${generalLoc}` : detailedLoc)
    : (generalLoc || 'غير محدد')

  const isHouse = p.propertyType === 'House' || p.propertyType === 'Villa'
  const isLand  = p.propertyType === 'Land'
  const isShop  = p.propertyType === 'Shop' || p.propertyType === 'Commercial'

  // Price per meter calculation
  const floorPpms = (!isHouse && !isLand ? (p.floors || []) : [])
    .map(f => {
      if (f.pricePerMeter != null && f.pricePerMeter > 0) return f.pricePerMeter
      const basePrice = f.price ?? f.installmentPrice
      if (basePrice != null && f.areaSqm != null && f.areaSqm > 0) return Math.round(basePrice / f.areaSqm)
      return null
    })
    .filter((ppm): ppm is number => ppm != null && ppm > 0)

  const propBasePrice = p.price ?? p.installmentPrice
  const unitPpm = (propBasePrice != null && p.areaSqm != null && p.areaSqm > 0)
    ? Math.round(propBasePrice / p.areaSqm)
    : null

  const minPpm = floorPpms.length > 0 ? Math.min(...floorPpms) : unitPpm
  const maxPpm = floorPpms.length > 0 ? Math.max(...floorPpms) : unitPpm
  const ppmText = minPpm != null
    ? (isHouse || isLand || isShop || minPpm === maxPpm ? `${minPpm.toLocaleString('ar-EG')} ج/م²` : `يبدأ من ${minPpm.toLocaleString('ar-EG')} ج/م²`)
    : null
  
  return (
    <Link to={`/properties/${p.id}`} className={`prop-card card ${isSold ? 'prop-card--sold' : ''}`}>
      {/* Image */}
      <div className="prop-card__img-wrap">
        {isVideo && !imgError ? (
          <video
            src={p.primaryImageUrl!}
            className="prop-card__img"
            muted
            playsInline
            preload="metadata"
            onError={() => setImgError(true)}
          />
        ) : (
          <img 
            src={imgError || !p.primaryImageUrl ? placeholderImage : optimizeCloudinaryUrl(p.primaryImageUrl)} 
            alt={p.title ?? ''} 
            className="prop-card__img" 
            loading="lazy" 
            onError={() => setImgError(true)}
          />
        )}
        {isSold && (
          <>
            <div className="prop-card__sold-overlay" />
            <div className="prop-card__sold-stamp">
              <span>تم البيع</span>
            </div>
          </>
        )}
        {isVideo && !isSold && (
          <div className="prop-card__video-indicator">
            <Play size={24} fill="white" />
          </div>
        )}
        <div className="prop-card__overlay" />
        {p.isFeatured && !isSold && (
          <div className="prop-card__featured"><Star size={12} fill="currentColor" />مميز</div>
        )}
        {p.isUnderConstruction && !isSold && (
          <div className="prop-card__featured" style={{ right: p.isFeatured ? '74px' : '12px', background: '#fffbeb', color: '#b45309' }}>
            🏗️ تحت الإنشاء
          </div>
        )}
        {!isSold && p.listingType && (
          <div className={`prop-card__listing badge ${p.listingType === 'Sale' ? 'badge-blue' : 'badge-gold'}`}>
            {listingLabel[p.listingType] ?? p.listingType}
          </div>
        )}
        <div className={`prop-card__status badge ${st.cls}`}>{st.label}</div>
      </div>

      {/* Body */}
      <div className="prop-card__body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
          {p.propertyType && <span className="prop-card__type">{typeLabel[p.propertyType] ?? p.propertyType}</span>}
          {!isLand && !isHouse && (p.finishingStatus || p.floorsFinishing || (p.floors && p.floors.some(f => f.finishingStatus))) && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2d4a3e', background: 'rgba(45,74,62,0.08)', border: '1px solid rgba(45,74,62,0.18)', padding: '1px 8px', borderRadius: '99px' }}>
              🎨 {finishingLabel[p.finishingStatus ?? ''] ?? p.finishingStatus}
            </span>
          )}
        </div>
        <h3 className="prop-card__title">{p.title || 'غير محدد'}</h3>
        <div className="prop-card__location" title={fullLocation}>
          <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{fullLocation}</span>
        </div>

        {/* Specs */}
        <div className="prop-card__specs">
          {isHouse ? (
            <>
              {(p.numberOfFloors != null || (p.floors && p.floors.length > 0)) && (
                <div className="prop-card__spec" style={{ fontWeight: 700, color: '#2d4a3e' }} title="عدد الأدوار">
                  🏢 {p.numberOfFloors ?? p.floors?.length} أدوار
                </div>
              )}
              {p.apartmentsPerFloor != null && p.apartmentsPerFloor > 0 && (
                <div className="prop-card__spec" style={{ fontWeight: 700, color: '#1e3a8a' }}>
                  🚪 {p.apartmentsPerFloor === 1 ? 'شقة بالدور' : p.apartmentsPerFloor === 2 ? 'شقتين بالدور' : `${p.apartmentsPerFloor} شقق بالدور`}
                </div>
              )}
              {p.finishedApartments != null && p.finishedApartments > 0 && (
                <div className="prop-card__spec" style={{ color: '#047857', fontWeight: 700 }}>
                  ✨ {p.finishedApartments} متشطب
                </div>
              )}
              {p.semiFinishedApartments != null && p.semiFinishedApartments > 0 && (
                <div className="prop-card__spec" style={{ color: '#b45309', fontWeight: 700 }}>
                  🧱 {p.semiFinishedApartments} نص تشطيب
                </div>
              )}
              {p.coreShellApartments != null && p.coreShellApartments > 0 && (
                <div className="prop-card__spec" style={{ color: '#475569', fontWeight: 700 }}>
                  🏗️ {p.coreShellApartments} عظم
                </div>
              )}
              <div className="prop-card__spec">
                <Maximize2 size={15} />
                {p.areaSqm ?? '—'} م²
              </div>
            </>
          ) : (
            <>
              {!isLand && (p.floors && p.floors.length > 0 ? (
                <div className="prop-card__spec" style={{ fontWeight: 700, color: '#2d4a3e' }} title="الأدوار المتاحة">
                  🏢 {formatFloorsText(p.floors, p.propertyType)}
                </div>
              ) : p.floorNumber != null ? (
                <div className="prop-card__spec">
                  🏢 {p.floorNumber === 0 ? 'الدور الأرضي' : `الدور ${p.floorNumber}`}
                </div>
              ) : null)}

              {!isLand && !isShop && (
                <div className="prop-card__spec">
                  <BedDouble size={15} />
                  {(() => {
                    const floorBeds = (p.floors || []).map(f => f.bedrooms).filter((b): b is number => b != null && b > 0);
                    const bedVal = p.bedrooms ?? (floorBeds.length > 0 ? (
                      Math.min(...floorBeds) === Math.max(...floorBeds)
                        ? Math.min(...floorBeds)
                        : `${Math.min(...floorBeds)} - ${Math.max(...floorBeds)}`
                    ) : null);
                    return `${bedVal ?? '—'} غرف`;
                  })()}
                </div>
              )}

              {!isLand && (
                <div className="prop-card__spec">
                  <Bath size={15} />
                  {(() => {
                    const floorBaths = (p.floors || []).map(f => f.bathrooms).filter((b): b is number => b != null && b > 0);
                    const bathVal = p.bathrooms ?? (floorBaths.length > 0 ? (
                      Math.min(...floorBaths) === Math.max(...floorBaths)
                        ? Math.min(...floorBaths)
                        : `${Math.min(...floorBaths)} - ${Math.max(...floorBaths)}`
                    ) : null);
                    return `${bathVal ?? '—'} حمام`;
                  })()}
                </div>
              )}

              <div className="prop-card__spec">
                <Maximize2 size={15} />
                {(() => {
                  const floorAreas = (p.floors || []).map(f => f.areaSqm).filter((a): a is number => a != null && a > 0);
                  const areaVal = p.areaSqm ?? (floorAreas.length > 0 ? (
                    Math.min(...floorAreas) === Math.max(...floorAreas)
                      ? Math.min(...floorAreas)
                      : `${Math.min(...floorAreas)} - ${Math.max(...floorAreas)}`
                  ) : null);
                  return `${areaVal ?? '—'} م²`;
                })()}
              </div>

              {!isLand && (p.finishingStatus || p.floorsFinishing || (p.floors && p.floors.some(f => f.finishingStatus))) && (
                <div className="prop-card__spec" title="نوع التشطيب">
                  🎨 {finishingLabel[p.finishingStatus ?? ''] ?? p.finishingStatus}
                </div>
              )}
            </>
          )}
        </div>

        {/* Price */}
        <div className="prop-card__price">
          {(() => {
            if (isSold) {
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '2px 0' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🔴</span> تم البيع بالكامل
                  </span>
                  {p.price != null && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', textDecoration: 'line-through' }}>
                      {p.price.toLocaleString('ar-EG')} ج.م
                    </span>
                  )}
                </div>
              );
            }

            const availableFloors = !isHouse && !isLand && p.floors && p.floors.length > 0
              ? p.floors.filter(f => f.isAvailable)
              : [];

            const cashPrices = availableFloors
              .map(f => f.price)
              .filter((pr): pr is number => pr != null && pr > 0);

            const installmentPrices = availableFloors
              .map(f => f.installmentPrice)
              .filter((pr): pr is number => pr != null && pr > 0);

            // If apartment floors with individual prices exist
            if (cashPrices.length > 0 || installmentPrices.length > 0) {
              const minCash = cashPrices.length > 0 ? Math.min(...cashPrices) : null;
              const maxCash = cashPrices.length > 0 ? Math.max(...cashPrices) : null;
              const minInst = installmentPrices.length > 0 ? Math.min(...installmentPrices) : null;
              const maxInst = installmentPrices.length > 0 ? Math.max(...installmentPrices) : null;

              const formatPrice = (min: number | null, max: number | null) => {
                if (min == null) return null;
                if (max == null || min === max) return `${min.toLocaleString('ar-EG')} جنيه`;
                return `يبدأ من ${min.toLocaleString('ar-EG')} جنيه`;
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
                  {minCash != null && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#182821' }}>
                        سعر الكاش : {formatPrice(minCash, maxCash)}
                      </span>
                      {cashPrices.length > 1 && minCash !== maxCash && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--clr-gold)', fontWeight: 700, background: 'rgba(183,121,61,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                          حسب الدور
                        </span>
                      )}
                    </div>
                  )}
                  {minInst != null && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb' }}>
                        💳 سعر التقسيط : {formatPrice(minInst, maxInst)}
                      </span>
                      {installmentPrices.length > 1 && minInst !== maxInst && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--clr-gold)', fontWeight: 700, background: 'rgba(183,121,61,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                          حسب الدور
                        </span>
                      )}
                    </div>
                  )}
                  {ppmText && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--clr-gold)', fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📏 سعر المتر:</span>
                      <span>{ppmText}</span>
                    </div>
                  )}
                </div>
              );
            }

            const cashLabel = isHouse ? 'سعر البيت كاش' : isLand ? 'سعر الأرض كاش' : isShop ? 'سعر المحل كاش' : 'سعر الكاش';
            const instLabel = isHouse ? 'سعر التقسيط للبيت' : isLand ? 'سعر التقسيط للأرض' : isShop ? 'سعر التقسيط للمحل' : 'سعر التقسيط';

            // Fallback for single unit / House / Land / Shop
            return (
              <div>
                {p.price != null ? (
                  <div>
                    {cashLabel} : {p.price.toLocaleString('ar-EG')} <span>جنيه</span>
                  </div>
                ) : (
                  <span>السعر غير محدد</span>
                )}
                {p.installmentPrice != null && (
                  <small style={{ display: 'block', fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                    💳 {instLabel} : {p.installmentPrice.toLocaleString('ar-EG')} جنيه
                  </small>
                )}
                {ppmText && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-gold)', fontWeight: 700, marginTop: '3px' }}>
                    📏 سعر المتر: {ppmText}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </Link>
  )
}
