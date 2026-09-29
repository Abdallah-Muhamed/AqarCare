import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Building2, Map, Star, TrendingUp, Shield, Sparkles, PlusCircle, UserCheck, CheckCircle } from 'lucide-react'
import { api, getStoredUser } from '../api'
import type { PropertyListItem } from '../types'
import { setPageSeo } from '../utils/seo'
// PackageListItem, PackageCard, api.getPackages — kept for future use, currently hidden
import PropertyCard from '../components/PropertyCard'
import HeroSearchBar from '../components/home/HeroSearchBar'
import ListPropertyModal from '../components/ListPropertyModal'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredProps, setFeaturedProps] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [listModalOpen, setListModalOpen] = useState(false)

  const handleListProperty = () => {
    const user = getStoredUser()
    if (user?.role === 'Admin') {
      navigate('/admin')
    } else if (user) {
      navigate('/my-properties?action=add')
    } else {
      navigate('/login', { state: { from: { pathname: '/my-properties', search: '?action=add' } } })
    }
  }

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
            ابحث عن عقارك المثالي
            <span className="hero__title-accent"> للبيع أو الإيجار</span>
          </h1>
          <p className="hero__subtitle">
            تصفّح وحداتنا السكنية والتجارية، الأراضي والمنازل، واستكشفها بدقة على الخريطة التفاعلية.
          </p>

          {/* ── Search Bar like Property Finder / Bayut ───────────── */}
          <HeroSearchBar />

          {/* ── Actions: Browse Properties & Explore Map & List CTA ── */}
          <div className="hero__actions" style={{ marginBottom: '1.5rem' }}>
            <Link to="/properties" className="btn btn-primary">
              <Building2 size={18} />
              تصفح العقارات
            </Link>
            <Link to="/map" className="btn btn-outline">
              <Map size={18} />
              استكشف الخريطة
            </Link>
            <button
              type="button"
              className="btn btn-gold hero__list-btn"
              onClick={handleListProperty}
            >
              <PlusCircle size={18} />
              اعرض عقارك معنا
            </button>
          </div>

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

      {/* ── Owner & Customer Marketing Section ──────────────────────── */}
      <section className="section owner-agent-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="gold-line" style={{ margin: '0 auto 10px' }} />
            <h2 className="section-title">اعرض عقارك معنا في <span>عقار كير</span></h2>
            <p className="section-subtitle">
              منصة متخصصة تدعم ملاك العقارات والعملاء بالمحلة الكبرى لتحقيق أسرع بيع وأفضل عائد بإشراف رسمي كامل
            </p>
          </div>

          <div className="owner-agent-grid">
            {/* Card 1: For Owners - Quick WhatsApp Request */}
            <div className="owner-card">
              <div className="owner-card__badge">
                <UserCheck size={14} />
                <span>طلب معاينة وتقييم سريع</span>
              </div>
              <h3 className="owner-card__title">هل تملك عقاراً وترغب في بيعه أو تأجيره؟</h3>
              <p className="owner-card__desc">
                تواصل مباشرة مع فريق شركة عقار كير لترتيب المعاينة والتقييم السعري. نقوم بتسويق وحدتك دون إزعاج وبحفظ كامل لخصوصيتك.
              </p>

              <ul className="owner-card__features">
                <li>
                  <CheckCircle size={16} />
                  <span><strong>تسويق احترافي مجاني:</strong> تصوير عالي الدقة وإبراز مميزات عقارك على منصتنا وقنواتنا الرسمية.</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span><strong>تقييم سعري واقعي:</strong> نساعدك في تحديد السعر العادل بناءً على حركة السوق الفعلية بالمحلة.</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span><strong>إشراف رسمي موثوق:</strong> جميع المعاينات والمفاوضات تتم بإشراف فريق الشركة لضمان الجدية.</span>
                </li>
              </ul>

              <div className="owner-card__cta">
                <button
                  type="button"
                  className="btn btn-primary owner-card__btn"
                  onClick={handleListProperty}
                >
                  <PlusCircle size={17} />
                  اعرض عقارك كمالك (إضافة وحدة)
                </button>
              </div>
            </div>

            {/* Card 2: Customer Self-Service Properties Panel */}
            <div className="agent-card">
              <div className="agent-card__badge" style={{ background: 'rgba(30,58,138,0.1)', color: '#1e3a8a', borderColor: 'rgba(30,58,138,0.2)' }}>
                <Sparkles size={14} />
                <span>لوحة عقاراتي (إدارة ذاتية)</span>
              </div>
              <h3 className="agent-card__title">أضف وتحكّم في عقاراتك بنفسك من حسابك</h3>
              <p className="agent-card__desc">
                أنشئ حساب عميل مجاناً وتمتع بلوحة تحكم خاصة لعرض عقاراتك وتعديل الأسعار وإرفاق الصور. تخضع جميع الوحدات لمراجعة واعتماد الإدارة قبل نشرها رسمياً.
              </p>

              <ul className="owner-card__features">
                <li>
                  <CheckCircle size={16} />
                  <span><strong>حساب عميل مجاني:</strong> تسجيل فوري وبسيط لإدارة كافة وحداتك المعروضة في مكان واحد.</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span><strong>اعتماد ومراجعة رسمية:</strong> تراجع الإدارة بيانات العقار قبل النشر لضمان المصداقية العالية.</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span><strong>التواصل حصرياً عبر شركتنا:</strong> فريق عقار كير يتولى الرد والتفاوض نيابةً عنك لحمايتك التامة.</span>
                </li>
              </ul>

              <div className="agent-card__cta">
                <Link to="/my-properties" className="btn btn-gold owner-card__btn">
                  <PlusCircle size={17} />
                  الدخول إلى لوحة عقاراتي
                </Link>
                <Link to="/login" className="agent-card__login-link">
                  ليس لديك حساب؟ أنشئ حسابك كعميل الآن مجاناً ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__glow" />
            <h2 className="cta-banner__title">مستعد تبدأ رحلتك العقارية؟</h2>
            <p className="cta-banner__sub">استكشف الوحدات المتاحة على قائمتنا أو اعرض عقارك معنا اليوم</p>
            <div className="cta-banner__btns">
              <Link to="/properties" className="btn btn-primary">ابحث عن عقار</Link>
              <button
                type="button"
                className="btn btn-gold"
                onClick={handleListProperty}
              >
                اعرض عقارك كمالك
              </button>
              <Link to="/map" className="btn btn-ghost">
                <Map size={16} /> استكشف الخريطة
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ListPropertyModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
      />
    </div>
  )
}
