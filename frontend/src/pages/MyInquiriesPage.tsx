import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getStoredUser } from '../api'
import type { PropertyInquiry } from '../types'
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Building2, ArrowRight } from 'lucide-react'

const statusLabels: Record<string, { label: string; cls: string }> = {
  Pending: { label: 'قيد المراجعة', cls: 'badge-gold' },
  Contacted: { label: 'تم التواصل معك', cls: 'badge-green' },
  Closed: { label: 'مكتملة', cls: 'badge-blue' },
}

export default function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = getStoredUser()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    api.getMyInquiries()
      .then(setInquiries)
      .catch((err: any) => setError(err.message || 'تعذر تحميل قائمة الاستفسارات'))
      .finally(() => setLoading(false))
  }, [])

  if (!user) {
    return (
      <div className="container section-sm" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-xl))' }}>
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
          <MessageSquare size={44} style={{ color: 'var(--clr-gold)', margin: '0 auto var(--space-md)' }} />
          <h2>تسجيل الدخول مطلوب</h2>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: 'var(--space-lg)' }}>
            يجب تسجيل الدخول للاطلاع على طلبات الاستفسار ومتابعة حالتها.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', margin: '0 auto' }}>
            تسجيل الدخول الآن
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container section-sm" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-xl))' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <span className="badge badge-gold">سجل التواصل</span>
          <h1 className="section-title">طلباتي <span>واستفسارات العقارات</span></h1>
          <p className="section-subtitle">تابع هنا جميع طلبات الاستفسار والتواصل التي قمت بإرسالها للمستشارين العقاريين.</p>
        </div>
        <Link to="/properties" className="btn btn-outline">
          <ArrowRight size={16} /> تصفح المزيد من العقارات
        </Link>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--clr-danger)' }}>
          <AlertCircle size={32} style={{ margin: '0 auto var(--space-sm)' }} />
          <p>{error}</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="empty-state card" style={{ padding: 'var(--space-3xl) var(--space-xl)' }}>
          <MessageSquare size={48} style={{ color: 'var(--clr-text-faint)', margin: '0 auto var(--space-md)' }} />
          <h3>لا توجد طلبات استفسار حالية</h3>
          <p>عندما تقوم بإرسال استفسار عن أي عقار معروض على المنصة، ستظهر تفاصيله ومتابعة حالته هنا مباشرة.</p>
          <Link to="/properties" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)', display: 'inline-flex' }}>
            استكشف العقارات المتاحة
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {inquiries.map(inq => {
            const st = statusLabels[inq.status] || { label: inq.status, cls: 'badge' }
            const dateStr = new Date(inq.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div key={inq.id} className="card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: '4px' }}>
                      <Building2 size={16} style={{ color: 'var(--clr-gold)' }} />
                      <Link to={`/properties/${inq.propertyUnitId}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--clr-text)' }}>
                        {inq.propertyTitle || `العقار رقم #${inq.propertyUnitId}`}
                      </Link>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {dateStr}
                    </span>
                  </div>

                  <span className={`badge ${st.cls}`}>
                    {st.cls === 'badge-green' && <CheckCircle2 size={12} />}
                    {st.label}
                  </span>
                </div>

                <div style={{ background: 'var(--clr-bg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-xs)' }}>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--clr-text)' }}>
                    <strong>رسالتك:</strong> {inq.message}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xs)' }}>
                  <Link to={`/properties/${inq.propertyUnitId}`} className="btn btn-ghost" style={{ minHeight: 36, padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
                    عرض تفاصيل العقار
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
