import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Map, Star, TrendingUp, Shield } from 'lucide-react'
import { api } from '../api'
import type { PropertyListItem } from '../types'
// PackageListItem, PackageCard, api.getPackages — kept for future use, currently hidden
import PropertyCard from '../components/PropertyCard'
import './HomePage.css'

export default function HomePage() {
  const [featuredProps, setFeaturedProps] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProperties({ isFeatured: true, pageSize: 3 })
      .then(r => setFeaturedProps(r.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg-glow hero__bg-glow--1" />
        <div className="hero__bg-glow hero__bg-glow--2" />
        <div className="hero__particles" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => <span key={i} className="hero__particle" style={{ '--i': i } as React.CSSProperties} />)}
        </div>
        <div className="container hero__content">
          <img src="/logo-navbar.png" alt="عقار كير" className="hero__brand-logo" />
          <div className="badge badge-gold hero__badge">
            <Star size={12} fill="currentColor" />
            منصة عقارية موثوقة ومتكاملة
          </div>
          <h1 className="hero__title">
            اعثر على
            <span className="hero__title-accent"> عقارك المثالي</span>
            <br />بكل سهولة وأمان
          </h1>
          <p className="hero__subtitle">
            تصفّح وحداتنا السكنية والتجارية المتاحة للبيع والإيجار، واستكشفها على الخريطة التفاعلية بشكل بصري احترافي.
          </p>
          <div className="hero__actions">
            <Link to="/properties" className="btn btn-primary">
              <Building2 size={18} />
              تصفح العقارات
            </Link>
            <Link to="/map" className="btn btn-outline">
              <Map size={18} />
              استكشف الخريطة
            </Link>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-val">أفضل</span>
              <span className="hero__stat-lbl">المواقع</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-val">بيع</span>
              <span className="hero__stat-lbl">وإيجار</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-val">100%</span>
              <span className="hero__stat-lbl">موثوق</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll">
          <div className="hero__scroll-mouse"><div className="hero__scroll-wheel" /></div>
          <span>اسحب للأسفل</span>
        </div>
      </section>

      {/* ── Features strip ───────────────────────────────────────── */}
      <section className="features-strip">
        <div className="container features-strip__grid">
          {[
            { icon: <Shield size={22} />, title: 'بيانات موثوقة', desc: 'معلومات دقيقة لكل وحدة' },
            { icon: <TrendingUp size={22} />, title: 'أسعار تنافسية', desc: 'خيارات تناسب كل ميزانية' },
            { icon: <Map size={22} />, title: 'خريطة تفاعلية', desc: 'تصفح الوحدات جغرافيًا' },
            { icon: <Building2 size={22} />, title: 'تنوع العقارات', desc: 'شقق، بيوت، محلات، أراضي' },
          ].map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-item__icon">{f.icon}</div>
              <div>
                <h3 className="feature-item__title">{f.title}</h3>
                <p className="feature-item__desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Properties ───────────────────────────────────── */}
      {(loading || featuredProps.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="gold-line" />
              <h2 className="section-title">وحدات <span>مميزة</span></h2>
              <p className="section-subtitle">أبرز العقارات المتاحة حالياً للبيع والإيجار</p>
            </div>
            {loading ? (
              <div className="grid-3">
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 380 }} />)}
              </div>
            ) : (
              <>
                <div className="grid-3">
                  {featuredProps.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
                <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                  <Link to="/properties" className="btn btn-outline">
                    عرض كل العقارات <ArrowLeft size={16} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Finishing Packages — Hidden, not removed ──────────────── */}
      {/* To re-enable: remove this comment block and restore the section */}
      {false && (
        <section className="section packages-section">
          {/* Finishing packages section — preserved for future use */}
        </section>
      )}

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__glow" />
            <h2 className="cta-banner__title">مستعد تبدأ رحلتك العقارية؟</h2>
            <p className="cta-banner__sub">استكشف الوحدات المتاحة على قائمتنا أو على الخريطة التفاعلية</p>
            <div className="cta-banner__btns">
              <Link to="/properties" className="btn btn-primary">ابحث عن عقار</Link>
              <Link to="/map" className="btn btn-ghost">
                <Map size={16} /> استكشف الخريطة
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
