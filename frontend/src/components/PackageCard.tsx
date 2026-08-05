import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { PackageListItem } from '../types'
import { getTierColors } from '../constants/tierColors'
import './PackageCard.css'

interface Props { pkg: PackageListItem }

export default function PackageCard({ pkg }: Props) {
  const colors = getTierColors(pkg.slug)

  return (
    <Link to={`/finishing-packages/${pkg.slug}`} className="pkg-card card">
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
  )
}
