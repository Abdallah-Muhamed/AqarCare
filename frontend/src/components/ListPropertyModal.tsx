import { useState, useEffect } from 'react'
import { X, Building2, Phone, CheckCircle2, MessageCircle, Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import './ListPropertyModal.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialRole?: string
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

export default function ListPropertyModal({ isOpen, onClose }: Props) {
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
      setSubmitted(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const cleanPhone = phone.trim()
  const listingTypeText = listingType === 'Sale' ? 'للبيع' : 'للإيجار'

  const buildWhatsAppMessage = () => {
    return [
      `السلام عليكم ورحمة الله، شركة عقار كير،`,
      `أرغب في عرض عقار لديكم على المنصة:`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 *الصفة:* مالك العقار`,
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
              تسويق فوري مع شركة عقار كير
            </span>
            <h2 className="list-modal__title">اعرض عقارك معنا كمالك</h2>
            <p className="list-modal__subtitle">
              نصل بعقارك لآلاف المشترين الجادين بالمحلة الكبرى عبر قنواتنا الرسمية المعتمدة والتواصل يتم حصرياً عبر شركتنا.
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
              تم فتح محادثة مباشرة مع فريق مبيعات وتسويق شركة <strong>عقار كير</strong> عبر واتساب. سيقوم مستشارنا العقاري بالتواصل معك لترتيب المعاينة وتدقيق البيانات.
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

              <Link to="/my-properties" onClick={onClose} className="btn btn-gold list-modal__success-btn">
                <LayoutDashboard size={18} />
                لوحة عقاراتي (إدارة وحداتك)
              </Link>

              <button type="button" className="btn btn-ghost" onClick={onClose}>
                إغلاق النافذة
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="list-modal__form">
            {/* Customer Self-Service Callout */}
            <div className="list-modal__agent-callout" style={{ background: 'rgba(30,58,138,0.06)', border: '1px solid rgba(30,58,138,0.15)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LayoutDashboard size={20} color="var(--clr-primary, #1e3a8a)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                  تريد رفع صور وحدتك والتحكم في بياناتها ومتابعة اعتماد الإدارة؟
                </span>
              </div>
              <Link to="/my-properties" onClick={onClose} className="list-modal__agent-link" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--clr-primary, #1e3a8a)' }}>
                افتح لوحة عقاراتي <ArrowRight size={14} />
              </Link>
            </div>

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
                جميع عمليات التواصل والتسويق والمعاينات تتم رسمياً وبإشراف فريق <strong>شركة عقار كير</strong> لحفظ حقوقك وخصوصيتك دون نشر رقمك الشخصي للعامة.
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
