import { useState, useEffect } from 'react'
import { api, getStoredUser } from '../api'
import { X, Send, CheckCircle2, AlertCircle, Phone, User, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import './InquiryModal.css'

interface InquiryModalProps {
  propertyId: number
  propertyTitle?: string | null
  isOpen: boolean
  onClose: () => void
}

export default function InquiryModal({ propertyId, propertyTitle, isOpen, onClose }: InquiryModalProps) {
  const user = getStoredUser()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setCustomerName(user.fullName || user.username)
        // If stored user object has details
      }
      setMessage(`أود الاستفسار عن مزيد من التفاصيل وموعد المعاينة للعقار رقم #${propertyId} (${propertyTitle || 'وحدة عقارية'}).`)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, propertyId, propertyTitle, user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await api.createInquiry(propertyId, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        message: message.trim(),
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال الاستفسار، برجاء المحاولة مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="inquiry-modal-overlay" onClick={onClose}>
      <div className="inquiry-modal" onClick={e => e.stopPropagation()}>
        <button className="inquiry-modal__close" onClick={onClose} aria-label="إغلاق">
          <X size={20} />
        </button>

        {success ? (
          <div className="inquiry-modal__success">
            <CheckCircle2 size={54} className="success-icon" />
            <h3>تم إرسال طلبك بنجاح!</h3>
            <p>
              تم تسجيل استفسارك عن <strong>{propertyTitle || `العقار #${propertyId}`}</strong>.
              سيتواصل معك أحد مستشارينا في أقرب وقت عبر رقم الهاتف المسجل.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
              {user ? (
                <Link to="/my-inquiries" className="btn btn-primary" onClick={onClose}>
                  متابعة حالة استفساراتي
                </Link>
              ) : (
                <button className="btn btn-primary" onClick={onClose}>
                  حسناً، تم
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="inquiry-form">
            <div className="inquiry-modal__header">
              <span className="badge badge-gold">طلب استفسار مباشر</span>
              <h3>استفسار عن العقار</h3>
              <p className="property-ref">
                الوحدة: <strong>{propertyTitle || `#${propertyId}`}</strong>
              </p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error" style={{ marginBottom: 'var(--space-sm)' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>الاسم بالكامل *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="أدخل اسمك"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>رقم الهاتف للتواصل *</label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  type="tel"
                  placeholder="مثال: 01012345678"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>البريد الإلكتروني (اختياري)</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>تفاصيل الاستفسار أو موعد المعاينة *</label>
              <div className="input-with-icon">
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-xs)' }} disabled={submitting}>
              {submitting ? 'جاري الإرسال...' : <><Send size={16} /> إرسال الاستفسار الآن</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
