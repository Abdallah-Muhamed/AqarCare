import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, ArrowUpDown, BedDouble, Bath, Building2, Droplets, Flame, Maximize2, MapPin, MessageCircle, Star, Calendar, Tag, CheckCircle2, Zap } from 'lucide-react'
import { api } from '../api'
import type { PropertyDetail } from '../types'
import ImageGallery from '../components/ImageGallery'
import './PropertyDetailPage.css'

const typeLabel: Record<string, string>     = { Apartment: 'شقة', Villa: 'فيلا', Studio: 'استوديو', Office: 'مكتب', Shop: 'محل' }
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
                <div className="detail-location">
                  <MapPin size={15} />
                  {prop.address || [prop.district, prop.city].filter(Boolean).join('، ') || 'غير محدد'}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                  {prop.listingType && (
                    <span className={`badge ${prop.listingType === 'Sale' ? 'badge-blue' : 'badge-gold'}`}>
                      {listingLabel[prop.listingType] ?? prop.listingType}
                    </span>
                  )}
                  {prop.isFeatured && <span className="badge badge-gold"><Star size={11} fill="currentColor" />مميز</span>}
                </div>
              </div>

              <div className="detail-specs">
                <div className="detail-spec"><BedDouble size={18} /><div><strong>{prop.bedrooms ?? '—'}</strong><small>غرف نوم</small></div></div>
                <div className="detail-spec"><Bath size={18} /><div><strong>{prop.bathrooms ?? '—'}</strong><small>حمامات</small></div></div>
                <div className="detail-spec"><Maximize2 size={18} /><div><strong>{prop.areaSqm ?? '—'}</strong><small>م²</small></div></div>
                {prop.propertyType && (
                  <div className="detail-spec"><Tag size={18} /><div><strong>{typeLabel[prop.propertyType] ?? prop.propertyType}</strong><small>النوع</small></div></div>
                )}
                {prop.finishingStatus && (
                  <div className="detail-spec"><span style={{fontSize:'1.1rem'}}>🎨</span><div><strong>{finishingLabel[prop.finishingStatus] ?? prop.finishingStatus}</strong><small>التشطيب</small></div></div>
                )}
              </div>

              <div className="detail-specs" style={{ marginTop: 'var(--space-md)' }}>
                {prop.floorNumber != null && (
                  <div className="detail-spec"><Building2 size={18} /><div><strong>{prop.floorNumber}</strong><small>رقم الدور</small></div></div>
                )}
                <div className="detail-spec"><ArrowUpDown size={18} /><div><strong>{prop.elevatorAvailable ? 'متوفر' : 'غير متوفر'}</strong><small>أسانسير</small></div></div>
                <div className="detail-spec"><Droplets size={18} /><div><strong>{prop.waterMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد مياه</small></div></div>
                <div className="detail-spec"><Zap size={18} /><div><strong>{prop.electricityMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد كهرباء</small></div></div>
                <div className="detail-spec"><Flame size={18} /><div><strong>{prop.gasMeterAvailable ? 'متاح' : 'غير متاح'}</strong><small>عداد غاز</small></div></div>
                <div className="detail-spec"><CheckCircle2 size={18} /><div><strong>{prop.installmentAvailable ? 'متاح' : 'غير متاح'}</strong><small>تقسيط</small></div></div>
              </div>

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
                <div className="detail-info-item">
                  <Tag size={14} />
                  <span>رقم الوحدة: {prop.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — price card */}
          <div className="detail-sidebar">
            <div className="price-card">
              <div className="price-card__glow" />
              <p className="price-card__label">سعر الوحدة</p>
              <div className="price-card__amount">
                {prop.price != null
                  ? <>{prop.price.toLocaleString('ar-EG')}<span>جنيه</span></>
                  : <span>غير محدد</span>}
              </div>
              {prop.price != null && prop.areaSqm != null && prop.areaSqm > 0 && (
                <div className="price-card__per-m">
                  {(prop.price / prop.areaSqm).toLocaleString('ar-EG', { maximumFractionDigits: 0 })} جنيه / م²
                </div>
              )}

              <div className="price-card__divider" />

              <div className="price-card__features">
                <div className="price-card__feature"><CheckCircle2 size={15} />متابعة مستمرة</div>
                <div className="price-card__feature"><CheckCircle2 size={15} />توثيق قانوني</div>
                <div className="price-card__feature"><CheckCircle2 size={15} />إمكانية التشطيب</div>
              </div>

              <Link to="/finishing-packages" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
                استعرض باقات التشطيب
              </Link>
              <a href="https://wa.me/201055937687" target="_blank" rel="noreferrer" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)', background: '#25d366', color: '#fff' }}>
                <MessageCircle size={16} /> تواصل معنا
              </a>
              <Link to="/properties" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
                <ArrowRight size={15} />
                العودة للعقارات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
