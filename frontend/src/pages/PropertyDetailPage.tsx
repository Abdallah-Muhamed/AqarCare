import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, ArrowUpDown, BedDouble, Bath, Building2, Droplets, Flame, Maximize2, MapPin, MessageCircle, Star, Calendar, Tag, CheckCircle2, Zap } from 'lucide-react'
import { api } from '../api'
import type { PropertyDetail } from '../types'
import { groupFloors } from '../utils/formatters'
import { setPageSeo } from '../utils/seo'
import ImageGallery from '../components/ImageGallery'
import './PropertyDetailPage.css'

const typeLabel: Record<string, string>     = { Apartment: 'شقة', House: 'بيت', Villa: 'بيت', Land: 'أرض', Shop: 'محل' }
const listingLabel: Record<string, string>  = { Sale: 'للبيع', Rent: 'للإيجار' }
const finishingLabel: Record<string, string> = {
  'Core-Shell':      'عظم',
  'Semi-Finished':   'نص تشطيب',
  'Finished':        'تشطيب',
  'Lux':             'لوكس',
  'Super-Lux':       'سوبر لوكس',
  'Ultra-Super-Lux': 'ألترا سوبر لوكس',
  'High-Lux':        'هاي لوكس',
  'Mixed':           'تشطيب متعدد',
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

  useEffect(() => {
    if (prop) {
      const loc = [prop.district, prop.city].filter(Boolean).join('، ')
      const desc = prop.description || `${prop.title || 'وحدة عقارية'} في ${loc} مع خيارات كاش وتقسيط على عقار كير.`
      const img = prop.media?.[0]?.url || 'https://aqar-care.vercel.app/logo.png'
      setPageSeo({
        title: `${prop.title || 'عقار'} | عقار كير`,
        description: desc,
        image: img,
        url: window.location.href,
      })
    }
    return () => {
      setPageSeo({
        title: 'عقار كير | شقق وعقارات للبيع والإيجار بالمحلة الكبرى ومنشية البكري',
      })
    }
  }, [prop])

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
  const isHouse = prop.propertyType === 'House' || prop.propertyType === 'Villa'
  const isLand  = prop.propertyType === 'Land'
  const isShop  = prop.propertyType === 'Shop' || prop.propertyType === 'Commercial'

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
                {/* Bedrooms: only for residential (not Land, Shop, or House) */}
                {!isHouse && !isLand && !isShop && (
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
                )}

                {/* Bathrooms: only for residential and commercial (not Land or House) */}
                {!isHouse && !isLand && (
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
                )}

                {/* Area */}
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
                    <small>{isHouse ? 'المساحة الإجمالية م²' : 'م²'}</small>
                  </div>
                </div>

                {prop.propertyType && (
                  <div className="detail-spec"><Tag size={18} /><div><strong>{typeLabel[prop.propertyType] ?? prop.propertyType}</strong><small>النوع</small></div></div>
                )}

                {/* Finishing: not applicable to Land or House */}
                {!isLand && !isHouse && (prop.finishingStatus || prop.floorsFinishing || (prop.floors && prop.floors.some(f => f.finishingStatus))) && (
                  <div className="detail-spec">
                    <span style={{fontSize:'1.1rem'}}>🎨</span>
                    <div>
                      <strong>
                        {finishingLabel[prop.finishingStatus ?? ''] ?? prop.finishingStatus}
                      </strong>
                      <small>التشطيب</small>
                    </div>
                  </div>
                )}
              </div>

              {/* House breakdown specs */}
              {isHouse && (
                <div className="detail-specs" style={{ marginTop: 'var(--space-md)' }}>
                  {(prop.numberOfFloors != null || (prop.floors && prop.floors.length > 0)) && (
                    <div className="detail-spec">
                      <Building2 size={18} />
                      <div>
                        <strong>{prop.numberOfFloors ?? prop.floors?.length} أدوار</strong>
                        <small>عدد الأدوار</small>
                      </div>
                    </div>
                  )}

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
                        <small>كم شقة في الدور</small>
                      </div>
                    </div>
                  )}

                  {prop.finishedApartments != null && prop.finishedApartments > 0 && (
                    <div className="detail-spec" style={{ borderColor: 'rgba(5,150,105,0.3)', background: 'rgba(5,150,105,0.04)' }}>
                      <span style={{ fontSize: '1.1rem' }}>✨</span>
                      <div>
                        <strong style={{ color: '#047857' }}>{prop.finishedApartments} شقق</strong>
                        <small style={{ color: '#065f46' }}>شقق متشطبة</small>
                      </div>
                    </div>
                  )}

                  {prop.semiFinishedApartments != null && prop.semiFinishedApartments > 0 && (
                    <div className="detail-spec" style={{ borderColor: 'rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.04)' }}>
                      <span style={{ fontSize: '1.1rem' }}>🧱</span>
                      <div>
                        <strong style={{ color: '#b45309' }}>{prop.semiFinishedApartments} شقق</strong>
                        <small style={{ color: '#92400e' }}>نص تشطيب</small>
                      </div>
                    </div>
                  )}

                  {prop.coreShellApartments != null && prop.coreShellApartments > 0 && (
                    <div className="detail-spec" style={{ borderColor: 'rgba(71,85,105,0.3)', background: 'rgba(71,85,105,0.04)' }}>
                      <span style={{ fontSize: '1.1rem' }}>🏗️</span>
                      <div>
                        <strong style={{ color: '#475569' }}>{prop.coreShellApartments} شقق</strong>
                        <small style={{ color: '#334155' }}>عظم (بدون تشطيب)</small>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="detail-specs" style={{ marginTop: 'var(--space-md)' }}>
                {/* Apartments per floor: only for Apartment buildings */}
                {!isHouse && !isLand && !isShop && prop.apartmentsPerFloor != null && prop.apartmentsPerFloor > 0 && (
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

                {/* Floor number: only for single unit without floors, not for House, Land, or Shop */}
                {!isHouse && !isLand && !isShop && prop.floorNumber != null && (!prop.floors || prop.floors.length === 0) && (
                  <div className="detail-spec"><Building2 size={18} /><div><strong>{prop.floorNumber === 0 ? 'الأرضي' : prop.floorNumber}</strong><small>رقم الدور</small></div></div>
                )}

                {!isLand && (
                  <div className="detail-spec"><ArrowUpDown size={18} /><div><strong>{prop.elevatorAvailable ? 'متوفر' : 'غير متوفر'}</strong><small>أسانسير</small></div></div>
                )}
                {!isLand ? (
                  <>
                    <div className="detail-spec"><Droplets size={18} /><div><strong>{prop.waterMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد مياه</small></div></div>
                    <div className="detail-spec"><Zap size={18} /><div><strong>{prop.electricityMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد كهرباء</small></div></div>
                    <div className="detail-spec"><Flame size={18} /><div><strong>{prop.gasMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد غاز</small></div></div>
                  </>
                ) : (
                  <>
                    {prop.frontageLength != null && prop.frontageLength > 0 && (
                      <div className="detail-spec" style={{ borderColor: 'rgba(30,58,138,0.3)', background: 'rgba(30,58,138,0.04)' }}>
                        <span style={{ fontSize: '1.1rem' }}>📏</span>
                        <div>
                          <strong style={{ color: '#1e3a8a' }}>{prop.frontageLength} متر</strong>
                          <small>طول الواجهة</small>
                        </div>
                      </div>
                    )}
                    <div className="detail-spec" style={{ borderColor: prop.hasBuildingLicense ? 'rgba(5,150,105,0.3)' : undefined, background: prop.hasBuildingLicense ? 'rgba(5,150,105,0.04)' : undefined }}>
                      <span style={{ fontSize: '1.1rem' }}>📜</span>
                      <div>
                        <strong style={{ color: prop.hasBuildingLicense ? '#047857' : undefined }}>
                          {prop.hasBuildingLicense ? 'يوجد رخصة بناء' : 'بدون رخصة بناء'}
                        </strong>
                        <small>رخصة البناء</small>
                      </div>
                    </div>
                    {prop.streetWidth && (
                      <div className="detail-spec">
                        <span style={{ fontSize: '1.1rem' }}>🛣️</span>
                        <div>
                          <strong>{prop.streetWidth}</strong>
                          <small>عرض الشارع</small>
                        </div>
                      </div>
                    )}
                    {prop.frontageWidth != null && prop.frontageWidth > 0 && (
                      <div className="detail-spec">
                        <span style={{ fontSize: '1.1rem' }}>📐</span>
                        <div>
                          <strong>{prop.frontageWidth} متر</strong>
                          <small>عرض / عمق الأرض</small>
                        </div>
                      </div>
                    )}
                    {prop.hasElectricity && (
                      <div className="detail-spec">
                        <Zap size={18} />
                        <div><strong>متوفر</strong><small>كهرباء</small></div>
                      </div>
                    )}
                    {prop.hasWater && (
                      <div className="detail-spec">
                        <Droplets size={18} />
                        <div><strong>متوفر</strong><small>مياه</small></div>
                      </div>
                    )}
                    {prop.hasSewerage && (
                      <div className="detail-spec">
                        <span style={{ fontSize: '1.1rem' }}>🚽</span>
                        <div><strong>متوفر</strong><small>صرف صحي</small></div>
                      </div>
                    )}
                  </>
                )}
                <div className="detail-spec"><CheckCircle2 size={18} /><div><strong>{prop.installmentAvailable ? 'متاح' : 'غير متاح'}</strong><small>تقسيط</small></div></div>
                {(() => {
                  const availableFloors = !isHouse && !isLand ? (prop.floors?.filter(f => f.isAvailable) ?? []) : [];
                  const floorCashPrices = availableFloors.map(f => f.price).filter((p): p is number => p != null && p > 0);
                  const minCash = floorCashPrices.length > 0 ? Math.min(...floorCashPrices) : prop.price;
                  const maxCash = floorCashPrices.length > 0 ? Math.max(...floorCashPrices) : prop.price;
                  const isCashRange = !isHouse && !isLand && floorCashPrices.length > 1 && minCash !== maxCash;

                  const floorInstPrices = availableFloors.map(f => f.installmentPrice).filter((p): p is number => p != null && p > 0);
                  const minInst = floorInstPrices.length > 0 ? Math.min(...floorInstPrices) : prop.installmentPrice;
                  const maxInst = floorInstPrices.length > 0 ? Math.max(...floorInstPrices) : prop.installmentPrice;
                  const isInstRange = !isHouse && !isLand && floorInstPrices.length > 1 && minInst !== maxInst;

                  const cashLabel = isHouse ? 'سعر البيت كاش' : isLand ? 'سعر الأرض كاش' : isShop ? 'سعر المحل كاش' : 'سعر الكاش';
                  const instLabel = isHouse ? 'سعر البيت تقسيط' : isLand ? 'سعر الأرض تقسيط' : isShop ? 'سعر المحل تقسيط' : 'سعر التقسيط';

                  return (
                    <>
                      {minCash != null && (
                        <div className="detail-spec">
                          <span>💵</span>
                          <div>
                            <strong>
                              {isCashRange ? `يبدأ من ${minCash.toLocaleString('ar-EG')}` : minCash.toLocaleString('ar-EG')} ج
                            </strong>
                            <small>{cashLabel}</small>
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
                            <small>{instLabel}</small>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Multiple Floors / Units Section: not applicable to Land and House */}
              {!isLand && !isHouse && prop.floors && prop.floors.length > 0 && (() => {
                const groups = groupFloors(prop.floors)
                const availableUnits = prop.floors.filter(f => f.isAvailable).length
                const soldUnits = prop.floors.filter(f => !f.isAvailable).length

                return (
                  <div className="detail-floors-card">
                    <div className="detail-floors-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={20} />
                        <span>
                          {isHouse
                            ? `تفاصيل ومواصفات أدوار البيت (${groups.length > 1 ? `${groups.length} أدوار` : groups[0]?.floorTitle})`
                            : `الأدوار والشقق (${groups.length > 1 ? `${groups.length} أدوار` : groups[0]?.floorTitle} — ${availableUnits > 0 ? `${availableUnits} شقق متاحة` : 'جميع الوحدات مباعة'}${soldUnits > 0 ? ` • ${soldUnits} مباع` : ''})`
                          }
                        </span>
                      </div>
                      {isHouse && (
                        <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', fontWeight: 800 }}>
                          🏠 يباع البيت بالكامل كوحدة واحدة
                        </span>
                      )}
                    </div>

                    <div className="detail-floors-groups">
                      {groups.map((group, gIdx) => {
                        const groupAvail = group.items.filter(i => i.isAvailable).length
                        const groupSold = group.items.filter(i => !i.isAvailable).length

                        return (
                          <div key={gIdx} className="floor-group-box">
                            {(groups.length > 1 || group.items.length > 1) && (
                              <div className="floor-group-box__header">
                                <div className="floor-group-box__title">
                                  {isHouse ? '🏠' : '🏢'} <span>{group.floorTitle}</span>
                                </div>
                                {!isHouse && group.items.length > 1 && (
                                  <span className={`floor-group-box__badge ${groupAvail === 0 ? 'floor-group-box__badge--sold' : ''}`}>
                                    {groupAvail > 0 ? `${groupAvail} شقق متاحة بالدور` : 'تم بيع شقق الدور بالكامل'}
                                    {groupSold > 0 && groupAvail > 0 ? ` (${groupSold} مباع)` : ''}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="detail-floors-grid">
                              {group.items.map((item, idx) => {
                                const aptName = isHouse
                                  ? (item.floorName || `الدور ${idx + 1}`)
                                  : (group.items.length > 1
                                      ? (item.floorName && !item.floorName.startsWith('الدور')
                                          ? item.floorName
                                          : `شقة ${idx + 1} (${item.areaSqm ? `${item.areaSqm} م²` : ''})`)
                                      : (item.floorName && item.floorName !== group.floorTitle && !item.floorName.startsWith('الدور')
                                          ? item.floorName
                                          : (item.areaSqm ? `شقة (${item.areaSqm} م²)` : 'شقة بالدور')))

                                return (
                                  <div key={item.id ?? idx} className={`floor-spec-card ${!isHouse && !item.isAvailable ? 'floor-spec-card--sold' : ''}`}>
                                    <div className="floor-spec-card__header">
                                      <span style={{ fontWeight: 800, color: (isHouse || item.isAvailable) ? 'var(--clr-text)' : '#64748b' }}>{aptName}</span>
                                      {item.finishingStatus && (
                                        <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                                          🎨 {finishingLabel[item.finishingStatus] ?? item.finishingStatus}
                                        </span>
                                      )}
                                      {!isHouse && (
                                        <span className={`badge ${item.isAvailable ? 'badge-green' : 'badge-sold'}`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', fontWeight: 800 }}>
                                          {item.isAvailable ? '🟢 متاح' : '🔴 تم البيع'}
                                        </span>
                                      )}
                                    </div>
                                    {!isHouse && (
                                      <>
                                        <div className="floor-spec-card__price">
                                          {item.isAvailable ? (
                                            item.price != null
                                              ? <>💵 كاش: {item.price.toLocaleString('ar-EG')} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>جنيه</span></>
                                              : 'السعر عند الطلب'
                                          ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                              {item.price != null ? (
                                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.92rem' }}>
                                                  💵 {item.price.toLocaleString('ar-EG')} ج
                                                </span>
                                              ) : <span />}
                                              <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.85rem' }}>❌ مباع</span>
                                            </div>
                                          )}
                                        </div>
                                        {item.isAvailable && item.installmentPrice != null && (
                                          <div className="floor-spec-card__price" style={{ color: '#1d4ed8', fontSize: '0.98rem', marginTop: '2px' }}>
                                            💳 تقسيط: {item.installmentPrice.toLocaleString('ar-EG')} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>جنيه</span>
                                          </div>
                                        )}
                                        {(() => {
                                          const itemPpm = item.pricePerMeter ?? (
                                            (item.price ?? item.installmentPrice) && item.areaSqm && item.areaSqm > 0
                                              ? Math.round((item.price ?? item.installmentPrice)! / item.areaSqm)
                                              : null
                                          );
                                          if (itemPpm == null) return null;
                                          return (
                                            <div className="floor-spec-card__sub" style={{ color: item.isAvailable ? 'var(--clr-gold)' : '#94a3b8', fontWeight: 700 }}>
                                              📏 سعر المتر: {itemPpm.toLocaleString('ar-EG')} ج/م²
                                            </div>
                                          );
                                        })()}
                                      </>
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
                        )
                      })}
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
                const availableFloors = !isHouse && !isLand ? (prop.floors?.filter(f => f.isAvailable) ?? []) : [];
                const floorCashPrices = availableFloors.map(f => f.price).filter((p): p is number => p != null && p > 0);
                const minCash = floorCashPrices.length > 0 ? Math.min(...floorCashPrices) : prop.price;
                const maxCash = floorCashPrices.length > 0 ? Math.max(...floorCashPrices) : prop.price;
                const isCashRange = !isHouse && !isLand && floorCashPrices.length > 1 && minCash !== maxCash;

                const floorInstPrices = availableFloors.map(f => f.installmentPrice).filter((p): p is number => p != null && p > 0);
                const minInst = floorInstPrices.length > 0 ? Math.min(...floorInstPrices) : prop.installmentPrice;
                const maxInst = floorInstPrices.length > 0 ? Math.max(...floorInstPrices) : prop.installmentPrice;
                const isInstRange = !isHouse && !isLand && floorInstPrices.length > 1 && minInst !== maxInst;

                const cashLabel = isHouse
                  ? '💵 سعر البيت بالكامل (كاش)'
                  : isLand
                    ? '💵 سعر الأرض بالكامل (كاش)'
                    : isShop
                      ? '💵 سعر المحل (كاش)'
                      : (isCashRange ? '💵 سعر الكاش (يبدأ من)' : '💵 سعر الكاش');

                const instLabel = isHouse
                  ? '💳 سعر البيت (تقسيط)'
                  : isLand
                    ? '💳 سعر الأرض (تقسيط)'
                    : isShop
                      ? '💳 سعر المحل (تقسيط)'
                      : (isInstRange ? '💳 سعر التقسيط (يبدأ من)' : '💳 سعر التقسيط');

                return (
                  <>
                    <p className="price-card__label">{cashLabel}</p>
                    <div className="price-card__amount">
                      {minCash != null
                        ? <>{minCash.toLocaleString('ar-EG')}<span>جنيه كاش</span></>
                        : <span>غير محدد</span>}
                    </div>
                    {minInst != null && (
                      <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.22)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e40af', marginBottom: '2px' }}>
                          {instLabel}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1d4ed8' }}>
                          {minInst.toLocaleString('ar-EG')} <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>جنيه تقسيط</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              {(() => {
                const floorPpms = (!isHouse && !isLand ? (prop.floors || []) : [])
                  .map(f => {
                    if (f.pricePerMeter != null && f.pricePerMeter > 0) return f.pricePerMeter;
                    const base = f.price ?? f.installmentPrice;
                    if (base != null && f.areaSqm != null && f.areaSqm > 0) return Math.round(base / f.areaSqm);
                    return null;
                  })
                  .filter((p): p is number => p != null && p > 0);

                const fallbackPrice = prop.price ?? prop.installmentPrice;
                const singlePpm = (fallbackPrice != null && prop.areaSqm != null && prop.areaSqm > 0)
                  ? Math.round(fallbackPrice / prop.areaSqm)
                  : null;

                const minPpm = floorPpms.length > 0 ? Math.min(...floorPpms) : singlePpm;
                const maxPpm = floorPpms.length > 0 ? Math.max(...floorPpms) : singlePpm;

                if (minPpm == null) return null;

                return (
                  <div className="price-card__per-m">
                    📏 {minPpm === maxPpm
                      ? `${minPpm.toLocaleString('ar-EG')} جنيه / م²`
                      : `يبدأ من ${minPpm.toLocaleString('ar-EG')} جنيه / م²`}
                  </div>
                );
              })()}

              <div className="price-card__divider" />

              <div className="price-card__features">
                <div className="price-card__feature"><CheckCircle2 size={15} />متابعة مستمرة</div>
              </div>

              {(() => {
                const locationText = [prop.district, prop.city].filter(Boolean).join('، ') || 'المحلة الكبرى'
                const waText = encodeURIComponent(
                  `السلام عليكم، أود الاستفسار بخصوص العقار رقم #${prop.id}: "${prop.title || 'وحدة عقارية'}" (${locationText}).`
                )
                const waUrl = `https://wa.me/201055937687?text=${waText}`

                return (
                  <a href={waUrl} target="_blank" rel="noreferrer" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-lg)', background: '#25d366', color: '#fff' }}>
                    <MessageCircle size={16} /> تواصل معنا عبر واتساب
                  </a>
                )
              })()}
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
      {(() => {
        const availableFloors = !isHouse && !isLand ? (prop.floors?.filter(f => f.isAvailable) ?? []) : []
        const floorCashPrices = availableFloors.map(f => f.price).filter((p): p is number => p != null && p > 0)
        const minCash = floorCashPrices.length > 0 ? Math.min(...floorCashPrices) : prop.price
        const maxCash = floorCashPrices.length > 0 ? Math.max(...floorCashPrices) : prop.price
        const isCashRange = !isHouse && !isLand && floorCashPrices.length > 1 && minCash !== maxCash

        const locationText = [prop.district, prop.city].filter(Boolean).join('، ') || 'المحلة الكبرى'
        const waText = encodeURIComponent(
          `السلام عليكم، أود الاستفسار بخصوص العقار رقم #${prop.id}: "${prop.title || 'وحدة عقارية'}" (${locationText}).`
        )
        const waUrl = `https://wa.me/201055937687?text=${waText}`
        const ctaLabel = isHouse ? 'سعر البيت' : isLand ? 'سعر الأرض' : isShop ? 'سعر المحل' : 'سعر الوحدة'

        return (
          <div className="detail-mobile-cta">
            <div className="detail-mobile-cta__price">
              <span className="detail-mobile-cta__label">{ctaLabel}</span>
              <span className="detail-mobile-cta__amount">
                {minCash != null ? (
                  <>
                    {isCashRange ? `يبدأ من ${minCash.toLocaleString('ar-EG')}` : minCash.toLocaleString('ar-EG')}
                    <span>جنيه</span>
                  </>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>السعر عند الطلب</span>
                )}
              </span>
            </div>
            <div className="detail-mobile-cta__btns">
              <a
                href={waUrl}
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
        )
      })()}
    </div>
  )
}
