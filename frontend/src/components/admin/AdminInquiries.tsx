import { useState, useEffect } from 'react'
import { api } from '../../api'
import type { PropertyInquiry } from '../../types'
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
  MessageCircle,
  Building2,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './AdminInquiries.css'

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Contacted' | 'Closed'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadInquiries = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getInquiries(statusFilter === 'All' ? undefined : statusFilter)
      setInquiries(data)
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل استفسارات العملاء')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInquiries()
  }, [statusFilter])

  const handleStatusChange = async (inquiryId: number, newStatus: string) => {
    setUpdatingId(inquiryId)
    try {
      const updated = await api.updateInquiryStatus(inquiryId, newStatus)
      setInquiries(prev => prev.map(item => item.id === inquiryId ? updated : item))
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الاستفسار')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = inquiries.filter(item => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      item.customerName?.toLowerCase().includes(q) ||
      item.customerPhone?.includes(q) ||
      item.propertyTitle?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q)
    )
  })

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'Pending').length,
    contacted: inquiries.filter(i => i.status === 'Contacted').length,
    closed: inquiries.filter(i => i.status === 'Closed').length,
  }

  return (
    <div className="admin-inquiries">
      <div className="admin-inquiries__header">
        <div>
          <h2>📬 استفسارات وطلبات العملاء</h2>
          <p className="admin-inquiries__sub">إدارة ومتابعة طلبات التواصل والمعاينة الواردة من العملاء</p>
        </div>
        <button
          type="button"
          onClick={loadInquiries}
          className="admin-inquiries__refresh-btn"
          disabled={loading}
          title="تحديث القائمة"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          تحديث
        </button>
      </div>

      {/* Mini stats */}
      <div className="admin-inquiries__stats">
        <div className="inq-stat-card inq-stat-card--total" onClick={() => setStatusFilter('All')}>
          <span className="inq-stat-val">{stats.total}</span>
          <span className="inq-stat-lbl">إجمالي الاستفسارات</span>
        </div>
        <div className="inq-stat-card inq-stat-card--pending" onClick={() => setStatusFilter('Pending')}>
          <span className="inq-stat-val">{stats.pending}</span>
          <span className="inq-stat-lbl">⏳ قيد الانتظار</span>
        </div>
        <div className="inq-stat-card inq-stat-card--contacted" onClick={() => setStatusFilter('Contacted')}>
          <span className="inq-stat-val">{stats.contacted}</span>
          <span className="inq-stat-lbl">📞 تم التواصل</span>
        </div>
        <div className="inq-stat-card inq-stat-card--closed" onClick={() => setStatusFilter('Closed')}>
          <span className="inq-stat-val">{stats.closed}</span>
          <span className="inq-stat-lbl">✅ مكتملة / مغلقة</span>
        </div>
      </div>

      {/* Search and filters bar */}
      <div className="admin-inquiries__filters">
        <div className="inq-search-box">
          <Search size={16} className="inq-search-icon" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الهاتف، أو اسم العقار..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="inq-tabs">
          {(['All', 'Pending', 'Contacted', 'Closed'] as const).map(st => (
            <button
              key={st}
              type="button"
              className={`inq-tab ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'All' ? 'الكل' : st === 'Pending' ? 'قيد الانتظار' : st === 'Contacted' ? 'تم التواصل' : 'مغلق'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="auth-alert auth-alert--error" style={{ margin: '1rem 0' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-inquiries">
          <MessageSquare size={48} />
          <h3>لا توجد استفسارات مطابقة</h3>
          <p>لم يتم العثور على طلبات استفسار في هذا التصنيف أو حسب عبارة البحث.</p>
        </div>
      ) : (
        <div className="inquiries-list">
          {filtered.map(inq => {
            const dateStr = new Date(inq.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            // Format phone for WhatsApp link
            const rawPhone = inq.customerPhone.replace(/[^0-9]/g, '')
            const waPhone = rawPhone.startsWith('0') ? `2${rawPhone}` : rawPhone
            const waText = encodeURIComponent(`مرحباً أستاذ ${inq.customerName}، بخصوص استفسارك على منصة عقار كير بشأن ${inq.propertyTitle || `الوحدة #${inq.propertyUnitId}`}:`)
            const waUrl = `https://wa.me/${waPhone}?text=${waText}`

            return (
              <div key={inq.id} className={`inquiry-card status--${inq.status.toLowerCase()}`}>
                <div className="inquiry-card__header">
                  <div className="inquiry-card__lead">
                    <span className="inquiry-card__name">{inq.customerName}</span>
                    <span className="inquiry-card__date">
                      <Clock size={12} /> {dateStr}
                    </span>
                  </div>

                  <div className="inquiry-card__actions">
                    <select
                      className={`status-select status-select--${inq.status.toLowerCase()}`}
                      value={inq.status}
                      disabled={updatingId === inq.id}
                      onChange={e => handleStatusChange(inq.id, e.target.value)}
                    >
                      <option value="Pending">⏳ قيد الانتظار</option>
                      <option value="Contacted">📞 تم التواصل</option>
                      <option value="Closed">✅ مكتمل ومغلق</option>
                    </select>
                  </div>
                </div>

                {/* Property reference */}
                <div className="inquiry-card__property">
                  <Building2 size={15} />
                  <span>العقار المعني:</span>
                  <Link
                    to={`/properties/${inq.propertyUnitId}`}
                    target="_blank"
                    className="property-link"
                  >
                    {inq.propertyTitle || `العقار #${inq.propertyUnitId}`}
                    <ExternalLink size={12} />
                  </Link>
                </div>

                {/* Customer Message */}
                <div className="inquiry-card__message">
                  <p>{inq.message}</p>
                </div>

                {/* Contact shortcuts footer */}
                <div className="inquiry-card__footer">
                  <div className="inquiry-contact-links">
                    <a href={`tel:${inq.customerPhone}`} className="contact-chip contact-chip--tel">
                      <Phone size={13} />
                      {inq.customerPhone}
                    </a>

                    <a href={waUrl} target="_blank" rel="noreferrer" className="contact-chip contact-chip--wa">
                      <MessageCircle size={13} />
                      مراسلة واتساب
                    </a>

                    {inq.customerEmail && (
                      <a href={`mailto:${inq.customerEmail}`} className="contact-chip contact-chip--email">
                        <Mail size={13} />
                        {inq.customerEmail}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
