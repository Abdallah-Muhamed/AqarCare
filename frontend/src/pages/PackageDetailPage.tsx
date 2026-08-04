import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Layers, CreditCard, FileText, Percent } from 'lucide-react'
import { api } from '../api'
import type { PackageDetail } from '../types'
import { getTierColors } from '../constants/tierColors'
import ImageGallery from '../components/ImageGallery'
import './PropertyDetailPage.css'
import './PackageDetailPage.css'

export default function PackageDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [pkg, setPkg]     = useState<PackageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true); setError(false)
    api.getPackage(slug)
      .then(setPkg)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="detail-page">
      <div className="container section">
        <div className="skeleton" style={{ height: 420, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-xl)' }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  )

  if (error || !pkg) return (
    <div className="detail-page">
      <div className="container section">
        <div className="empty-state">
          <h3>الباقة غير موجودة</h3>
          <p>تعذّر تحميل بيانات هذه الباقة</p>
          <Link to="/finishing-packages" className="btn btn-outline" style={{ marginTop: 'var(--space-lg)' }}>
            <ArrowRight size={16} /> العودة للباقات
          </Link>
        </div>
      </div>
    </div>
  )

  const colors = getTierColors(pkg.slug)

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="detail-page__breadcrumb">
        <div className="container detail-page__breadcrumb-inner">
          <Link to="/">الرئيسية</Link>
          <span>/</span>
          <Link to="/finishing-packages">باقات التشطيب</Link>
          <span>/</span>
          <span>{pkg.name}</span>
        </div>
      </div>

      <div className="container section-sm">
        <div className="detail-layout">
          {/* Left — content */}
          <div className="detail-main">
            {/* Header card */}
            <div className="pkg-detail-header" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
              <div className="pkg-detail-header__content">
                <h1 className="pkg-detail-header__name">{pkg.name}</h1>
                <p className="pkg-detail-header__desc">{pkg.shortDescription}</p>
              </div>
              <div className="pkg-detail-header__price">
                <span className="pkg-detail-header__price-amount">
                  {pkg.pricePerSqm.toLocaleString('ar-EG')}
                  <small>جنيه/م²</small>
                </span>
                <span className="pkg-detail-header__price-sup">
                  إشراف {pkg.supervisionPercent}%
                </span>
              </div>
            </div>

            {/* Gallery */}
            {pkg.media.length > 0 && <ImageGallery media={pkg.media} />}

            {/* Description */}
            <div className="detail-card">
              <h2 className="detail-section-title">نبذة عن الباقة</h2>
              <p>{pkg.description || 'لا يوجد وصف متاح لهذه الباقة.'}</p>
            </div>

            {/* Sections */}
            {pkg.sections.length > 0 && (
              <div className="detail-card">
                <h2 className="detail-section-title">
                  <Layers size={18} />
                  تفاصيل التشطيب
                </h2>
                <div className="pkg-sections">
                  {pkg.sections.sort((a, b) => a.sortOrder - b.sortOrder).map(section => (
                    <div key={section.id} className="pkg-section">
                      <h3 className="pkg-section__title">{section.title}</h3>
                      <div className="pkg-section__features">
                        {section.featureItems.sort((a, b) => a.sortOrder - b.sortOrder).map(item => (
                          <div key={item.id} className="pkg-section__feature">
                            <CheckCircle2 size={14} />
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Phases */}
            {pkg.paymentPhases.length > 0 && (
              <div className="detail-card">
                <h2 className="detail-section-title">
                  <CreditCard size={18} />
                  نظام الدفع المرحلي
                </h2>
                <div className="pkg-phases">
                  {pkg.paymentPhases.sort((a, b) => a.sortOrder - b.sortOrder).map(phase => (
                    <div key={phase.id} className="pkg-phase">
                      <div className="pkg-phase__percent">
                        <Percent size={14} />
                        {phase.percentage}%
                      </div>
                      <div className="pkg-phase__desc">{phase.phaseDescription}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {pkg.notes.length > 0 && (
              <div className="detail-card">
                <h2 className="detail-section-title">
                  <FileText size={18} />
                  ملاحظات هامة
                </h2>
                <div className="pkg-notes">
                  {pkg.notes.sort((a, b) => a.sortOrder - b.sortOrder).map(note => (
                    <div key={note.id} className="pkg-note">
                      {note.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — sidebar */}
          <div className="detail-sidebar">
            <div
              className="price-card"
              style={{ '--tier-accent': colors.accent, '--tier-dim': colors.dim } as React.CSSProperties}
            >
              <div className="price-card__glow" />
              <p className="price-card__label">سعر الباقة</p>
              <div className="price-card__amount">
                {pkg.pricePerSqm.toLocaleString('ar-EG')}
                <span>جنيه/م²</span>
              </div>
              <div className="price-card__per-m">
                نسبة الإشراف: {pkg.supervisionPercent}%
              </div>

              <div className="price-card__divider" />

              <div className="price-card__features">
                <div className="price-card__feature"><CheckCircle2 size={15} />إشراف هندسي متكامل</div>
                <div className="price-card__feature"><CheckCircle2 size={15} />مواد معتمدة من الشركات</div>
                <div className="price-card__feature"><CheckCircle2 size={15} />نظام دفع مرحلي مرن</div>
                <div className="price-card__feature"><CheckCircle2 size={15} />متابعة مستمرة للتنفيذ</div>
              </div>

              <Link to="/properties" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
                استعرض العقارات
              </Link>
              <Link to="/finishing-packages" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
                <ArrowRight size={15} />
                العودة للباقات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
