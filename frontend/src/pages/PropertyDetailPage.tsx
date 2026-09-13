import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, ArrowUpDown, BedDouble, Bath, Building2, Droplets, Flame, Maximize2, MapPin, MessageCircle, Star, Calendar, Tag, CheckCircle2, Zap } from 'lucide-react'
import { api } from '../api'
import type { PropertyDetail } from '../types'
import { groupFloors } from '../utils/formatters'
import ImageGallery from '../components/ImageGallery'
import './PropertyDetailPage.css'

const typeLabel: Record<string, string>     = { Apartment: 'شقة', House: 'بيت', Villa: 'بيت', Land: 'أرض', Shop: 'محل' }
const listingLabel: Record<string, string>  = { Sale: 'للبيع', Rent: 'للإيجار' }
const finishingLabel: Record<string, string> = {
  'Core-Shell':   'عظم',
  'Semi-Finished': 'نص تشطيب',
  'Finished':     'تشطيب',
  'Lux':          'لوكس',
  'Super-Lux':    'سوبر لوكس',
  'High-Lux':     'هاي لوكس',
}
const statusLabel: Record<string, { label: string; cls: string }> = {
  Available: { label: 'متاح', cls: 'badge-green' },
  Reserved:  { label: 'محجوز', cls: 'badge-gold' },
  Sold:      { label: 'مباع', cls: 'badge' },
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [prop, setProp]     = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true); setError(false)
    api.getProperty(Number(id))
      .then(setProp)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="detail-page">
      <div className="container section">
        <div className="skeleton" style={{ height: 420, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-xl)' }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  )

  if (error || !prop) return (
    <div className="detail-page">
      <div className="container section">
        <div className="empty-state">
          <h3>العقار غير موجود</h3>
          <p>تعذّر تحميل بيانات هذا العقار</p>
          <Link to="/properties" className="btn btn-outline" style={{ marginTop: 'var(--space-lg)' }}>
            <ArrowRight size={16} /> العودة للعقارات
          </Link>
        </div>
      </div>
    </div>
  )

  const st = statusLabel[prop.status] ?? { label: prop.status, cls: 'badge' }

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="detail-page__breadcrumb">
        <div className="container detail-page__breadcrumb-inner">
          <Link to="/">الرئيسية</Link>
          <span>/</span>
          <Link to="/properties">العقارات</Link>
          <span>/</span>
          <span>{prop.title || 'غير محدد'}</span>
        </div>
      </div>

      <div className="container section-sm">
        <div className="detail-layout">
          {/* Left — gallery + description */}
          <div className="detail-main">
            <ImageGallery media={prop.media} />

            <div className="detail-card">
              <h1 className="detail-title">{prop.title || 'غير محدد'}</h1>
              <div className="detail-meta">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
                  <div className="detail-location">
                    <MapPin size={15} />
                    {prop.address || [prop.district, prop.city].filter(Boolean).join('، ') || 'غير محدد'}
                  </div>
                  <Link
                    to={`/map?propertyId=${prop.id}`}
                    className="detail-map-link-badge"
                  >
                    🗺️ عرض على الخريطة
                  </Link>
                </div>
                {prop.district && (
                  <div className="detail-district">
                    <MapPin size={15} />
                    <span>الحي: {prop.district}</span>
                  </div>
                )}
                {prop.detailedAddress && (
                  <div className="detail-detailed-address">
                    <MapPin size={15} />
                    <span>{prop.detailedAddress}</span>
                  </div>
                )}
                <div className="detail-id">
                  <Tag size={15} />
                  <span>رقم الوحدة: {prop.id}</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                  {prop.isUnderConstruction && <span className="badge badge-amber">🏗️ تحت الإنشاء</span>}
                  {prop.listingType && (
                    <span className={`badge ${prop.listingType === 'Sale' ? 'badge-blue' : 'badge-gold'}`}>
                      {listingLabel[prop.listingType] ?? prop.listingType}
                    </span>
                  )}
                  {prop.isFeatured && <span className="badge badge-gold"><Star size={11} fill="currentColor" />مميز</span>}
                </div>
              </div>

              <div className="detail-specs">
                <div className="detail-spec">
                  <BedDouble size={18} />
                  <div>
                    <strong>
                      {(() => {
                        const floorBeds = (prop.floors || []).map(f => f.bedrooms).filter((b): b is number => b != null && b > 0);
                        const bedVal = prop.bedrooms ?? (floorBeds.length > 0 ? (
                          Math.min(...floorBeds) === Math.max(...floorBeds)
                            ? Math.min(...floorBeds)
                            : `${Math.min(...floorBeds)} - ${Math.max(...floorBeds)}`
                        ) : null);
                        return bedVal ?? '—';
                      })()}
                    </strong>
                    <small>غرف نوم</small>
                  </div>
                </div>
                <div className="detail-spec">
                  <Bath size={18} />
                  <div>
                    <strong>
                      {(() => {
                        const floorBaths = (prop.floors || []).map(f => f.bathrooms).filter((b): b is number => b != null && b > 0);
                        const bathVal = prop.bathrooms ?? (floorBaths.length > 0 ? (
                          Math.min(...floorBaths) === Math.max(...floorBaths)
                            ? Math.min(...floorBaths)
                            : `${Math.min(...floorBaths)} - ${Math.max(...floorBaths)}`
                        ) : null);
                        return bathVal ?? '—';
                      })()}
                    </strong>
                    <small>حمامات</small>
                  </div>
                </div>
                <div className="detail-spec">
                  <Maximize2 size={18} />
                  <div>
                    <strong>
                      {(() => {
                        const floorAreas = (prop.floors || []).map(f => f.areaSqm).filter((a): a is number => a != null && a > 0);
                        const areaVal = prop.areaSqm ?? (floorAreas.length > 0 ? (
                          Math.min(...floorAreas) === Math.max(...floorAreas)
                            ? Math.min(...floorAreas)
                            : `${Math.min(...floorAreas)} - ${Math.max(...floorAreas)}`
                        ) : null);
                        return areaVal ?? '—';
                      })()}
                    </strong>
                    <small>م²</small>
                  </div>
                </div>
                {prop.propertyType && (
                  <div className="detail-spec"><Tag size={18} /><div><strong>{typeLabel[prop.propertyType] ?? prop.propertyType}</strong><small>النوع</small></div></div>
                )}
                {prop.finishingStatus && (
                  <div className="detail-spec"><span style={{fontSize:'1.1rem'}}>🎨</span><div><strong>{finishingLabel[prop.finishingStatus] ?? prop.finishingStatus}</strong><small>التشطيب</small></div></div>
                )}
              </div>

              <div className="detail-specs" style={{ marginTop: 'var(--space-md)' }}>
                {prop.apartmentsPerFloor != null && prop.apartmentsPerFloor > 0 && (
                  <div className="detail-spec">
                    <Building2 size={18} />
                    <div>
                      <strong>
                        {prop.apartmentsPerFloor === 1
                          ? 'شقة واحدة'
                          : prop.apartmentsPerFloor === 2
                            ? 'شقتين'
                            : `${prop.apartmentsPerFloor} شقق`}
                      </strong>
                      <small>بالدور</small>
                    </div>
                  </div>
                )}
                {prop.floorNumber != null && (!prop.floors || prop.floors.length === 0) && (
                  <div className="detail-spec"><Building2 size={18} /><div><strong>{prop.floorNumber}</strong><small>رقم الدور</small></div></div>
                )}
                <div className="detail-spec"><ArrowUpDown size={18} /><div><strong>{prop.elevatorAvailable ? 'متوفر' : 'غير متوفر'}</strong><small>أسانسير</small></div></div>
                <div className="detail-spec"><Droplets size={18} /><div><strong>{prop.waterMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد مياه</small></div></div>
                <div className="detail-spec"><Zap size={18} /><div><strong>{prop.electricityMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد كهرباء</small></div></div>
                <div className="detail-spec"><Flame size={18} /><div><strong>{prop.gasMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد غاز</small></div></div>
                <div className="detail-spec"><CheckCircle2 size={18} /><div><strong>{prop.installmentAvailable ? 'متاح' : 'غير متاح'}</strong><small>تقسيط</small></div></div>
                {(() => {
                  const availableFloors = prop.floors?.filter(f => f.isAvailable) ?? [];
                  const floorCashPrices = availableFloors.map(f => f.price).filter((p): p is number => p != null && p > 0);
                  const minCash = floorCashPrices.length > 0 ? Math.min(...floorCashPrices) : prop.price;
                  const maxCash = floorCashPrices.length > 0 ? Math.max(...floorCashPrices) : prop.price;
                  const isCashRange = floorCashPrices.length > 1 && minCash !== maxCash;

                  const floorInstPrices = availableFloors.map(f => f.installmentPrice).filter((p): p is number => p != null && p > 0);
                  const minInst = floorInstPrices.length > 0 ? Math.min(...floorInstPrices) : prop.installmentPrice;
                  const maxInst = floorInstPrices.length > 0 ? Math.max(...floorInstPrices) : prop.installmentPrice;
                  const isInstRange = floorInstPrices.length > 1 && minInst !== maxInst;

                  return (
                    <>
                      {minCash != null && (
                        <div className="detail-spec">
                          <span>💵</span>
                          <div>
                            <strong>
                              {isCashRange ? `يبدأ من ${minCash.toLocaleString('ar-EG')}` : minCash.toLocaleString('ar-EG')} ج
                            </strong>
                            <small>سعر الكاش</small>
                          </div>
                        </div>
                      )}
                      {minInst != null && (
                        <div className="detail-spec">
                          <span>💳</span>
                          <div>
                            <strong>
                              {isInstRange ? `يبدأ من ${minInst.toLocaleString('ar-EG')}` : minInst.toLocaleString('ar-EG')} ج
                            </strong>
                            <small>سعر التقسيط</small>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Multiple Floors / Units Section */}
              {prop.floors && prop.floors.length > 0 && (() => {
                const groups = groupFloors(prop.floors)
                const totalUnits = prop.floors.length

                return (
                  <div className="detail-floors-card">
                    <div className="detail-floors-title">
                      <Building2 size={20} />
                      <span>الأدوار والشقق المتاحة ({groups.length > 1 ? `${groups.length} أدوار` : groups[0]?.floorTitle} — {totalUnits} شقق متاحة)</span>
                    </div>

                    <div className="detail-floors-groups">
                      {groups.map((group, gIdx) => (
                        <div key={gIdx} className="floor-group-box">
                          {(groups.length > 1 || group.items.length > 1) && (
                            <div className="floor-group-box__header">
                              <div className="floor-group-box__title">
                                🏢 <span>{group.floorTitle}</span>
                              </div>
                              {group.items.length > 1 && (
                                <span className="floor-group-box__badge">
                                  {group.items.length} شقق متاحة بالدور
                                </span>
                              )}
                            </div>
                          )}

                          <div className="detail-floors-grid">
                            {group.items.map((item, idx) => {
                              const aptName = group.items.length > 1
                                ? (item.floorName && !item.floorName.startsWith('الدور')
                                    ? item.floorName
                                    : `شقة ${idx + 1} (${item.areaSqm ? `${item.areaSqm} م²` : ''})`)
                                : (item.floorName || group.floorTitle)

                              return (
                                <div key={item.id ?? idx} className="floor-spec-card">
                                  <div className="floor-spec-card__header">
                                    <span style={{ fontWeight: 800, color: 'var(--clr-text)' }}>{aptName}</span>
                                    <span className={`badge ${item.isAvailable ? 'badge-green' : 'badge'}`} style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                                      {item.isAvailable ? 'متاح' : 'مباع'}
                                    </span>
                                  </div>
                                  <div className="floor-spec-card__price">
                                    {item.price != null
                                      ? <>💵 كاش: {item.price.toLocaleString('ar-EG')} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>جنيه</span></>
                                      : 'السعر عند الطلب'}
                                  </div>
                                  {item.installmentPrice != null && (
                                    <div className="floor-spec-card__price" style={{ color: '#1d4ed8', fontSize: '0.98rem', marginTop: '2px' }}>
                                      💳 تقسيط: {item.installmentPrice.toLocaleString('ar-EG')} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>جنيه</span>
                                    </div>
                                  )}
                                  {item.pricePerMeter != null && (
                                    <div className="floor-spec-card__sub" style={{ color: 'var(--clr-gold)', fontWeight: 700 }}>
                                      📏 سعر المتر: {item.pricePerMeter.toLocaleString('ar-EG')} ج/م²
                                    </div>
                                  )}
                                  {item.areaSqm != null && (
                                    <div className="floor-spec-card__sub">
                                      📐 المساحة: {item.areaSqm} م²
                                    </div>
                                  )}
                                  {item.bedrooms != null && (
                                    <div className="floor-spec-card__sub">
                                      🛏️ غرف النوم: {item.bedrooms} غرف
                                    </div>
                                  )}
                                  {item.bathrooms != null && (
                                    <div className="floor-spec-card__sub">
                                      🚿 الحمامات: {item.bathrooms} حمام
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {prop.description && (
                <div className="detail-description">
                  <h2 className="detail-section-title">وصف العقار</h2>
                  <p>{prop.description}</p>
                </div>
              )}

              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <Calendar size={14} />
                  <span>تاريخ الإضافة: {new Date(prop.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="detail-info-item">
                  <MapPin size={14} />
                  <span>{[prop.city, prop.district].filter(Boolean).join(' — ') || 'الموقع غير محدد'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — price card */}
          <div className="detail-sidebar">
            <div className="price-card">
              <div className="price-card__glow" />
              {(() => {
                const availableFloors = prop.floors?.filter(f => f.isAvailable) ?? [];
                const floorCashPrices = availableFloors.map(f => f.price).filter((p): p is number => p != null && p > 0);
                const minCash = floorCashPrices.length > 0 ? Math.min(...floorCashPrices) : prop.price;
                const maxCash = floorCashPrices.length > 0 ? Math.max(...floorCashPrices) : prop.price;
                const isCashRange = floorCashPrices.length > 1 && minCash !== maxCash;

                const floorInstPrices = availableFloors.map(f => f.installmentPrice).filter((p): p is number => p != null && p > 0);
                const minInst = floorInstPrices.length > 0 ? Math.min(...floorInstPrices) : prop.installmentPrice;
                const maxInst = floorInstPrices.length > 0 ? Math.max(...floorInstPrices) : prop.installmentPrice;
                const isInstRange = floorInstPrices.length > 1 && minInst !== maxInst;

                return (
                  <>
                    <p className="price-card__label">
                      💵 {isCashRange ? 'سعر الكاش (يبدأ من)' : 'سعر الكاش'}
                    </p>
                    <div className="price-card__amount">
                      {minCash != null
                        ? <>{minCash.toLocaleString('ar-EG')}<span>جنيه كاش</span></>
                        : <span>غير محدد</span>}
                    </div>
                    {minInst != null && (
                      <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.22)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e40af', marginBottom: '2px' }}>
                          💳 {isInstRange ? 'سعر التقسيط (يبدأ من)' : 'سعر التقسيط'}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1d4ed8' }}>
                          {minInst.toLocaleString('ar-EG')} <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>جنيه تقسيط</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              {prop.floors && prop.floors.length > 0 ? (() => {
                const groups = groupFloors(prop.floors)
                return (
                  <div style={{ marginTop: '0.85rem', padding: '0.75rem 0.85rem', background: 'rgba(24,40,33,0.04)', borderRadius: '12px', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--clr-text)', fontSize: '0.86rem' }}>
                      🏢 تفاصيل أسعار الأدوار والشقق:
                    </div>
                    {groups.map((g, gIdx) => (
                      <div key={gIdx} style={{ marginBottom: gIdx < groups.length - 1 ? '10px' : '0', borderBottom: gIdx < groups.length - 1 ? '1px dashed #d5cdbf' : 'none', paddingBottom: '8px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--clr-gold)', fontSize: '0.82rem', marginBottom: '4px' }}>
                          🏢 {g.floorTitle}:
                        </div>
                        {g.items.map((fl, i) => {
                          const label = g.items.length > 1
                            ? (fl.floorName && !fl.floorName.startsWith('الدور')
                                ? fl.floorName
                                : `شقة ${i + 1} (${fl.areaSqm ? `${fl.areaSqm}م²` : ''})`)
                            : (fl.floorName || g.floorTitle)
                          return (
                            <div key={fl.id ?? i} style={{ paddingInlineStart: '6px', marginBottom: '6px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--clr-text)', fontSize: '0.82rem' }}>• {label}</div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '0.76rem', marginInlineStart: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
                                {fl.price != null && (
                                  <span style={{ color: '#1e2922', fontWeight: 700, background: '#eef4ee', padding: '2px 7px', borderRadius: '4px' }}>
                                    💵 كاش: {fl.price.toLocaleString('ar-EG')} ج
                                    {fl.pricePerMeter != null && <span style={{ color: 'var(--clr-gold)', fontSize: '0.7rem', marginInlineStart: '3px' }}>({fl.pricePerMeter.toLocaleString('ar-EG')} ج/م²)</span>}
                                  </span>
                                )}
                                {fl.installmentPrice != null && (
                                  <span style={{ color: '#1d4ed8', fontWeight: 700, background: '#eff6ff', padding: '2px 7px', borderRadius: '4px' }}>
                                    💳 تقسيط: {fl.installmentPrice.toLocaleString('ar-EG')} ج
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )
              })() : (
                prop.price != null && prop.areaSqm != null && prop.areaSqm > 0 && (
                  <div className="price-card__per-m">
                    {(prop.price / prop.areaSqm).toLocaleString('ar-EG', { maximumFractionDigits: 0 })} جنيه / م²
                  </div>
                )
              )}

              <div className="price-card__divider" />

              <div className="price-card__features">
                <div className="price-card__feature"><CheckCircle2 size={15} />متابعة مستمرة</div>
              </div>

              <a href="https://wa.me/201055937687" target="_blank" rel="noreferrer" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-lg)', background: '#25d366', color: '#fff' }}>
                <MessageCircle size={16} /> تواصل معنا
              </a>
              <Link to={`/map?propertyId=${prop.id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
                🗺️ عرض الوحدة على الخريطة
              </Link>
              <Link to="/properties" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
                <ArrowRight size={15} />
                العودة للعقارات
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Mobile CTA Bar ─────────────────────────────────── */}
      <div className="detail-mobile-cta">
        <div className="detail-mobile-cta__price">
          <span className="detail-mobile-cta__label">سعر الوحدة</span>
          <span className="detail-mobile-cta__amount">
            {prop.price != null
              ? <>{prop.price.toLocaleString('ar-EG')}<span>جنيه</span></>
              : <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>السعر عند الطلب</span>}
          </span>
        </div>
        <div className="detail-mobile-cta__btns">
          <a
            href="https://wa.me/201055937687"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ background: '#25d366', color: '#fff', minHeight: 42, padding: '0 1rem' }}
          >
            <MessageCircle size={16} /> تواصل
          </a>
          <Link
            to={`/map?propertyId=${prop.id}`}
            className="btn btn-outline"
            style={{ minHeight: 42, padding: '0 0.9rem', fontSize: '0.82rem' }}
          >
            🗺️ الخريطة
          </Link>
        </div>
      </div>
    </div>
  )
}
