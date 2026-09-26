import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Map, Star, TrendingUp, Shield, Sparkles } from 'lucide-react'
import { api } from '../api'
import type { PropertyListItem } from '../types'
import { setPageSeo } from '../utils/seo'
// PackageListItem, PackageCard, api.getPackages — kept for future use, currently hidden
import PropertyCard from '../components/PropertyCard'
import HeroSearchBar from '../components/home/HeroSearchBar'
import './HomePage.css'

export default function HomePage() {
  const [featuredProps, setFeaturedProps] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPageSeo({
      title: 'عقار كير | شقق وعقارات للبيع والإيجار بالمحلة الكبرى ومنشية البكري',
      description: 'منصة عقار كير - تصفح وحداتنا السكنية والتجارية المتاحة للبيع والتقسيط في المحلة الكبرى ومنشية البكري مع خريطة تفاعلية متطورة.',
      url: 'https://aqar-care.vercel.app/'
    })

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
            منصة عقارية موثوقة ومتكاملة بالمحلة الكبرى
          </div>
          <h1 className="hero__title">
            استكشف بيتك الجديد
            <span className="hero__title-accent"> للبيع أو الإيجار</span>
          </h1>
          <p className="hero__subtitle">
            تصفّح وحداتنا السكنية والتجارية، الأراضي والمنازل، واستكشفها بدقة على الخريطة التفاعلية.
          </p>

          {/* ── Search Bar like Property Finder / Bayut ───────────── */}
          <HeroSearchBar />

          {/* Quick Filter Suggestions */}
          <div className="hero__quick-filters">
            <span className="hero__quick-filters-label">
              <Sparkles size={14} style={{ color: 'var(--clr-gold)' }} />
              اقتراحات سريعة:
            </span>
            <div className="hero__quick-filters-list">
              <Link to="/properties?type=House" className="hero__quick-tag">
                🏠 منازل
              </Link>
              <Link to="/properties?type=Apartment" className="hero__quick-tag">
                🏢 شقق سكنية
              </Link>
              <Link to="/properties?filter=finished" className="hero__quick-tag">
                ✨ شقق متشطبة
              </Link>
              <Link to="/properties?filter=core-shell" className="hero__quick-tag">
                🧱 عظم (طوب أحمر)
              </Link>
              <Link to="/properties?filter=installment" className="hero__quick-tag">
                💳 متاح تقسيط
              </Link>
              <Link to="/properties?filter=near-floor" className="hero__quick-tag">
                🪜 دور قريب
              </Link>
              <Link to="/properties?filter=under-1.5m" className="hero__quick-tag">
                💰 أقل من 1.5 مليون
              </Link>
              <Link to="/properties?filter=under-construction" className="hero__quick-tag">
                🏗️ تحت الإنشاء
              </Link>
              <Link to="/properties?type=Land" className="hero__quick-tag">
                🌿 أراضي
              </Link>
              <Link to="/properties?type=Shop" className="hero__quick-tag">
                🏪 محلات
              </Link>
            </div>
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
