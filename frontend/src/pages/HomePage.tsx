import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Layers, Star, TrendingUp, Shield } from 'lucide-react'
import { api } from '../api'
import type { PropertyListItem, PackageListItem } from '../types'
import PropertyCard from '../components/PropertyCard'
import PackageCard from '../components/PackageCard'
import './HomePage.css'

export default function HomePage() {
  const [featuredProps, setFeaturedProps] = useState<PropertyListItem[]>([])
  const [packages, setPackages] = useState<PackageListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getProperties({ isFeatured: true, pageSize: 3 }),
      api.getPackages(),
    ]).then(([props, pkgs]) => {
      setFeaturedProps(props.items)
      setPackages(pkgs)
    }).catch(console.error)
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
            منصة عقارية موثوقة في مصر
          </div>
          <h1 className="hero__title">
            ابحث عن
            <span className="hero__title-accent"> عقارك المثالي</span>
            <br />وشطّبه بأعلى المعايير
          </h1>
          <p className="hero__subtitle">
            نوفر لك أفضل الوحدات السكنية مع باقات تشطيب متدرجة تناسب كل ميزانية، بأسعار تنافسية وجودة مضمونة.
          </p>
          <div className="hero__actions">
            <Link to="/properties" className="btn btn-primary">
              <Building2 size={18} />
              تصفح العقارات
            </Link>
            <Link to="/finishing-packages" className="btn btn-outline">
              <Layers size={18} />
              باقات التشطيب
            </Link>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-val">6</span>
              <span className="hero__stat-lbl">باقات تشطيب</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-val">17.5%</span>
              <span className="hero__stat-lbl">نسبة إشراف هندسي</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-val">100%</span>
              <span className="hero__stat-lbl">مواد معتمدة</span>
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
            { icon: <Shield size={22} />, title: 'جودة مضمونة', desc: 'مواد معتمدة وضمان على الأعمال' },
            { icon: <TrendingUp size={22} />, title: 'أسعار تنافسية', desc: 'باقات مرنة تناسب كل ميزانية' },
            { icon: <Star size={22} />, title: 'إشراف هندسي', desc: 'متابعة مستمرة حتى التسليم' },
            { icon: <Building2 size={22} />, title: 'تنوع العقارات', desc: 'شقق، فيلات، مكاتب وأكثر' },
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
              <div className="row">
                {[1,2,3].map(i => <div key={i} className="col-12 col-md-4"><div className="skeleton" style={{ height: 380 }} /></div>)}
              </div>
            ) : (
              <>
                <div className="row">
                  {featuredProps.map(p => <div key={p.id} className="col-12 col-md-4"><PropertyCard property={p} /></div>)}
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

      {/* ── Finishing Packages ────────────────────────────────────── */}
      <section className="section packages-section">
        <div className="packages-section__bg" />
        <div className="container">
          <div className="section-header">
            <span className="gold-line" />
            <h2 className="section-title">باقات <span>التشطيب</span></h2>
            <p className="section-subtitle">6 باقات تشطيب متدرجة تناسب احتياجاتك وميزانيتك</p>
          </div>
          {loading ? (
            <div className="row">
              {[1,2,3].map(i => <div key={i} className="col-12 col-md-4"><div className="skeleton" style={{ height: 300 }} /></div>)}
            </div>
          ) : (
            <>
              <div className="row">
                {packages.map(p => <div key={p.id} className="col-12 col-md-4"><PackageCard pkg={p} /></div>)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                <Link to="/finishing-packages" className="btn btn-primary">
                  <Layers size={16} />
                  تفاصيل كل الباقات
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__glow" />
            <h2 className="cta-banner__title">مستعد تبدأ رحلة سكنك المثالي؟</h2>
            <p className="cta-banner__sub">اختر عقارك، اختر باقتك، ونحن نتكفل بالباقي</p>
            <div className="cta-banner__btns">
              <Link to="/properties" className="btn btn-primary">ابحث عن عقار</Link>
              <Link to="/finishing-packages" className="btn btn-ghost">استعرض الباقات</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
