import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, MessageCircle } from 'lucide-react'
import type { PackageListItem } from '../types'
import { getTierColors } from '../constants/tierColors'
import './PackageCard.css'

interface Props { pkg: PackageListItem }

export default function PackageCard({ pkg }: Props) {
  const colors = getTierColors(pkg.slug)

  return (
    <article className="pkg-card card">
      <Link to={`/finishing-packages/${pkg.slug}`} style={{ display: 'block', color: 'inherit' }}>
      <div className="pkg-card__glow" style={{ background: `radial-gradient(ellipse at top, ${colors.dim}, transparent 70%)` }} />

      {/* Header band */}
      <div className="pkg-card__band" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
        <span className="pkg-card__band-name">{pkg.name}</span>
        <span className="pkg-card__price-label">
          {pkg.pricePerSqm.toLocaleString('ar-EG')}
          <small> جنيه/م²</small>
        </span>
      </div>

      {/* Body */}
      <div className="pkg-card__body">
        <p className="pkg-card__desc">{pkg.shortDescription}</p>

        <div className="pkg-card__features">
          <div className="pkg-card__feature"><CheckCircle2 size={14} />إشراف هندسي {pkg.supervisionPercent}%</div>
          <div className="pkg-card__feature"><CheckCircle2 size={14} />مواد معتمدة</div>
          <div className="pkg-card__feature"><CheckCircle2 size={14} />نظام دفع مرحلي</div>
        </div>

        <div
          className="pkg-card__cta"
          style={{ '--tier-accent': colors.accent, '--tier-dim': colors.dim } as React.CSSProperties}
        >
          تفاصيل الباقة <ArrowLeft size={15} />
        </div>
      </div>
      </Link>
      <a
        href="https://wa.me/201055937687"
        target="_blank"
        rel="noreferrer"
        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', margin: '0 1.4rem 1.4rem', padding: '.7rem 1rem', borderRadius: '10px', background: '#25d366', color: '#fff', fontSize: '.84rem', fontWeight: 800 }}
      >
        <MessageCircle size={17} /> تواصل معنا
      </a>
    </article>
  )
}
