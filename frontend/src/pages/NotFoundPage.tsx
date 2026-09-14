import { Link } from 'react-router-dom'
import { Home, Building2, MapPin } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: 480,
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          color: 'var(--clr-gold)',
          lineHeight: 1,
          marginBottom: '1rem'
        }}>
          404
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--clr-text)',
          marginBottom: '0.75rem'
        }}>
          الصفحة غير موجودة
        </h1>
        <p style={{
          color: 'var(--clr-text-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          عذراً، الرابط الذي تحاول الوصول إليه غير متاح أو قد تم نقله أو حذفه.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> الرئيسية
          </Link>
          <Link to="/properties" className="btn btn-outline">
            <Building2 size={16} /> تصفح العقارات
          </Link>
          <Link to="/map" className="btn btn-ghost">
            <MapPin size={16} /> الخريطة
          </Link>
        </div>
      </div>
    </div>
  )
}
