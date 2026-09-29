import { useState, useEffect } from 'react'
import { X, Building2, UserCheck, Briefcase, Phone, CheckCircle2, MessageCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './ListPropertyModal.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialRole?: 'owner' | 'agent'
}

const DISTRICT_OPTIONS = [
  'منشية البكري',
  'الشعبية',
  'شكري القوتلي',
  'الجمهورية',
  'الرجبي',
  'محلة البرج',
  'الوابورات',
  'سكة زفتى',
  'الزهراء',
  'أخرى (داخل المحلة الكبرى)',
  'خارج المحلة',
]

export default function ListPropertyModal({ isOpen, onClose, initialRole = 'owner' }: Props) {
  const [role, setRole] = useState<'owner' | 'agent'>(initialRole)
  const [listingType, setListingType] = useState<'Sale' | 'Rent'>('Sale')
  const [propertyType, setPropertyType] = useState('شقة سكنية')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('منشية البكري')
  const [price, setPrice] = useState('')
  const [area, setArea] = useState('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole)
      setSubmitted(false)
    }
  }, [isOpen, initialRole])

  if (!isOpen) return null

  const cleanPhone = phone.trim()
  const roleText = role === 'owner' ? 'مالك العقار' : 'وسيط عقاري'
  const listingTypeText = listingType === 'Sale' ? 'للبيع' : 'للإيجار'

  const buildWhatsAppMessage = () => {
    return [
      `السلام عليكم ورحمة الله، شركة عقار كير،`,
      `أرغب في عرض عقار لديكم على المنصة:`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 *الصفة:* ${roleText}`,
      `🏷️ *الاسم:* ${fullName.trim() || 'غير محدد'}`,
      `📞 *رقم التواصل:* ${cleanPhone || 'غير محدد'}`,
      `📌 *نوع العرض:* ${listingTypeText}`,
      `🏢 *نوع العقار:* ${propertyType}`,
      `📍 *المنطقة / الحي:* ${district}`,
      area.trim() ? `📐 *المساحة التقريبية:* ${area.trim()} م²` : null,
      price.trim() ? `💰 *السعر المطلوب:* ${price.trim()} جنيه` : null,
      details.trim() ? `📝 *تفاصيل ومواصفات:* ${details.trim()}` : null,
      `━━━━━━━━━━━━━━━━━━`,
      `أرجو التواصل معي للتقييم والمعاينة. شكرًا لكم.`
    ].filter(Boolean).join('\n')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !phone.trim()) {
      alert('يرجى كتابة الاسم ورقم الهاتف على الأقل')
      return
    }

    const message = buildWhatsAppMessage()
    const waUrl = `https://wa.me/201055937687?text=${encodeURIComponent(message)}`
    
    // Open official AqarCare WhatsApp directly
    window.open(waUrl, '_blank', 'noopener,noreferrer')
    setSubmitted(true)
  }

  return (
    <div className="list-modal-overlay" onClick={onClose}>
      <div className="list-modal-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="list-modal__header">
          <div className="list-modal__title-box">
            <span className="list-modal__badge">
              <Sparkles size={13} />
              تسويق فوري مع عقار كير
            </span>
            <h2 className="list-modal__title">اعرض عقارك معنا</h2>
            <p className="list-modal__subtitle">
              نصل بعقارك لآلاف المشترين الجادين بالمحلة الكبرى عبر قنواتنا الرسمية المعتمدة.
            </p>
          </div>
          <button type="button" className="list-modal__close" onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="list-modal__success">
            <div className="list-modal__success-icon">
              <CheckCircle2 size={54} />
            </div>
            <h3 className="list-modal__success-title">تم إرسال بيانات عقارك بنجاح!</h3>
            <p className="list-modal__success-desc">
              تم فتح محادثة مباشرة مع فريق مبيعات وتسويق شركة <strong>عقار كير</strong> عبر واتساب. سيقوم مستشارنا العقاري بالتواصل معك لترتيب المعاينة وإدراج الوحدة.
            </p>

            <div className="list-modal__success-actions">
              <button
                type="button"
                className="btn btn-primary list-modal__success-btn"
                onClick={() => {
                  const message = buildWhatsAppMessage()
                  window.open(`https://wa.me/201055937687?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
                }}
              >
                <MessageCircle size={18} />
                إعادة فتح واتساب عقار كير
              </button>

              <a href="tel:+201055937687" className="btn btn-outline list-modal__success-btn">
                <Phone size={18} />
                اتصال هاتفي مباشر (01055937687)
              </a>

              <button type="button" className="btn btn-ghost" onClick={onClose}>
                إغلاق النافذة
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="list-modal__form">
            {/* Role Switcher Tabs */}
            <div className="list-modal__role-tabs">
              <button
                type="button"
                className={`list-modal__role-tab ${role === 'owner' ? 'active' : ''}`}
                onClick={() => setRole('owner')}
              >
                <UserCheck size={18} />
                <div className="list-modal__role-text">
                  <strong>أنا مالك العقار</strong>
                  <span>بيع أو تأجير عقارك بأعلى عائد</span>
                </div>
              </button>

              <button
                type="button"
                className={`list-modal__role-tab ${role === 'agent' ? 'active' : ''}`}
                onClick={() => setRole('agent')}
              >
                <Briefcase size={18} />
                <div className="list-modal__role-text">
                  <strong>أنا وسيط عقاري</strong>
                  <span>سوّق وحداتك لعملاء موثوقين</span>
                </div>
              </button>
            </div>

            {/* Quick Agent Banner */}
            {role === 'agent' && (
              <div className="list-modal__agent-callout">
                <span>هل أنت وسيط عقاري وتريد إضافة وإدارة عقاراتك بنفسك؟</span>
                <Link to="/login" onClick={onClose} className="list-modal__agent-link">
                  سجّل حساب وسيط مجاناً <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="list-modal__grid">
              <div className="list-modal__field">
                <label>الاسم بالكامل <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="مثال: محمد مصطفى"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="list-modal__field">
                <label>رقم الهاتف / واتساب <span className="req">*</span></label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="list-modal__field">
                <label>نوع العرض</label>
                <div className="list-modal__pill-group">
                  <button
                    type="button"
                    className={`list-modal__pill ${listingType === 'Sale' ? 'active' : ''}`}
                    onClick={() => setListingType('Sale')}
                  >
                    للبيع
                  </button>
                  <button
                    type="button"
                    className={`list-modal__pill ${listingType === 'Rent' ? 'active' : ''}`}
                    onClick={() => setListingType('Rent')}
                  >
                    للإيجار
                  </button>
                </div>
              </div>

              <div className="list-modal__field">
                <label>نوع العقار</label>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                  <option value="شقة سكنية">شقة سكنية</option>
                  <option value="منزل / بيت مستقل">منزل / بيت مستقل</option>
                  <option value="فيلا">فيلا</option>
                  <option value="محل تجاري / إداري">محل تجاري / إداري</option>
                  <option value="أرض فضاء / للبناء">أرض فضاء / للبناء</option>
                  <option value="عمارة كاملة">عمارة كاملة</option>
                </select>
              </div>

              <div className="list-modal__field">
                <label>المنطقة أو الحي</label>
                <select value={district} onChange={e => setDistrict(e.target.value)}>
                  {DISTRICT_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="list-modal__field">
                <label>المساحة التقريبية (م²)</label>
                <input
                  type="number"
                  placeholder="مثال: 135"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                />
              </div>

              <div className="list-modal__field" style={{ gridColumn: '1 / -1' }}>
                <label>السعر المطلوب أو المتوقع (جنيه مصري)</label>
                <input
                  type="text"
                  placeholder="مثال: 1,200,000 ج أو قابل للتفاوض"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>

              <div className="list-modal__field" style={{ gridColumn: '1 / -1' }}>
                <label>تفاصيل إضافية / مميزات العقار</label>
                <textarea
                  rows={3}
                  placeholder="مثال: الدور الثالث، أسانسير، تشطيب سوبر لوكس، شارع 10 متر، حصة في الأرض..."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                />
              </div>
            </div>

            {/* Company Assurance Notice */}
            <div className="list-modal__trust-box">
              <Building2 size={16} />
              <span>
                جميع عمليات التواصل والتسويق تتم بإشراف وإدارة فريق <strong>شركة عقار كير الرسمي</strong> لضمان أقصى درجات المصداقية والجدية.
              </span>
            </div>

            {/* Actions */}
            <div className="list-modal__actions">
              <button type="submit" className="list-modal__submit-btn">
                <MessageCircle size={18} />
                <span>إرسال تفاصيل العقار وتأكيد العرض</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
