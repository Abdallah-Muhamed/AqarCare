import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, Building2, Edit3, Trash2, CheckCircle2, Clock, AlertCircle, Eye, Upload, X, Shield } from 'lucide-react'
import { api, getStoredUser } from '../api'
import type { PropertyListItem } from '../types'
import { getPropertyPlaceholder } from '../constants/placeholders'
import './MyPropertiesPage.css'

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
  'أخرى (المحلة الكبرى)',
]

const FINISHING_OPTIONS = [
  { value: 'Core-Shell', label: 'بدون تشطيب (عظم)' },
  { value: 'Semi-Finished', label: 'نصف تشطيب' },
  { value: 'Lux', label: 'لوكس' },
  { value: 'Super-Lux', label: 'سوبر لوكس' },
  { value: 'Ultra-Super-Lux', label: 'ألترا سوبر لوكس' },
  { value: 'High-Lux', label: 'هاي لوكس' },
]

export default function MyPropertiesPage() {
  const navigate = useNavigate()
  const user = getStoredUser()

  const [properties, setProperties] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [installmentPrice, setInstallmentPrice] = useState('')
  const [installmentAvailable, setInstallmentAvailable] = useState(false)
  const [areaSqm, setAreaSqm] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [floorNumber, setFloorNumber] = useState('')
  const [propertyType, setPropertyType] = useState('Apartment')
  const [listingType, setListingType] = useState('Sale')
  const [finishingStatus, setFinishingStatus] = useState('Finished')
  const [district, setDistrict] = useState('منشية البكري')
  const [address, setAddress] = useState('')
  const [detailedAddress, setDetailedAddress] = useState('')
  const [waterMeterAvailable, setWaterMeterAvailable] = useState(false)
  const [electricityMeterAvailable, setElectricityMeterAvailable] = useState(false)
  const [gasMeterAvailable, setGasMeterAvailable] = useState(false)
  const [elevatorAvailable, setElevatorAvailable] = useState(false)

  // Media upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/my-properties' } } })
      return
    }
    loadProperties()
  }, [])

  const loadProperties = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getMyProperties()
      setProperties(data || [])
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل عقاراتك. يرجى إعادة المحاولة.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setPrice('')
    setInstallmentPrice('')
    setInstallmentAvailable(false)
    setAreaSqm('')
    setBedrooms('')
    setBathrooms('')
    setFloorNumber('')
    setPropertyType('Apartment')
    setListingType('Sale')
    setFinishingStatus('Finished')
    setDistrict('منشية البكري')
    setAddress('')
    setDetailedAddress('')
    setWaterMeterAvailable(false)
    setElectricityMeterAvailable(false)
    setGasMeterAvailable(false)
    setElevatorAvailable(false)
    setSelectedFiles([])
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = async (id: number) => {
    resetForm()
    setEditingId(id)
    setShowModal(true)
    setSubmitting(true)
    try {
      const p = await api.getMyProperty(id)
      setTitle(p.title || '')
      setDescription(p.description || '')
      setPrice(p.price ? String(p.price) : '')
      setInstallmentPrice(p.installmentPrice ? String(p.installmentPrice) : '')
      setInstallmentAvailable(p.installmentAvailable || false)
      setAreaSqm(p.areaSqm ? String(p.areaSqm) : '')
      setBedrooms(p.bedrooms ? String(p.bedrooms) : '')
      setBathrooms(p.bathrooms ? String(p.bathrooms) : '')
      setFloorNumber(p.floorNumber != null ? String(p.floorNumber) : '')
      setPropertyType(p.propertyType || 'Apartment')
      setListingType(p.listingType || 'Sale')
      setFinishingStatus(p.finishingStatus || 'Finished')
      setDistrict(p.district || 'منشية البكري')
      setAddress(p.address || '')
      setDetailedAddress(p.detailedAddress || '')
      setWaterMeterAvailable(p.waterMeterAvailable || false)
      setElectricityMeterAvailable(p.electricityMeterAvailable || false)
      setGasMeterAvailable(p.gasMeterAvailable || false)
      setElevatorAvailable(p.elevatorAvailable || false)
    } catch (err: any) {
      alert(err.message || 'تعذر جلب تفاصيل العقار')
      setShowModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, propTitle?: string | null) => {
    if (!window.confirm(`هل أنت متأكد من حذف عقارك "${propTitle || id}"؟`)) return
    try {
      await api.deleteMyProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
      setSuccessMsg('تم حذف العقار بنجاح')
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err: any) {
      alert(err.message || 'تعذر حذف العقار')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('يرجى إدخال عنوان العقار')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: price ? parseFloat(price) : null,
      installmentPrice: installmentPrice ? parseFloat(installmentPrice) : null,
      installmentAvailable,
      areaSqm: areaSqm ? parseFloat(areaSqm) : null,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
      floorNumber: floorNumber ? parseInt(floorNumber, 10) : null,
      propertyType,
      listingType,
      finishingStatus,
      city: 'المحلة الكبرى',
      district,
      address: address.trim(),
      detailedAddress: detailedAddress.trim(),
      waterMeterAvailable,
      electricityMeterAvailable,
      gasMeterAvailable,
      elevatorAvailable,
    }

    try {
      let savedProp
      if (editingId) {
        savedProp = await api.updateMyProperty(editingId, payload)
        setSuccessMsg('تم حفظ التعديلات بنجاح! سيتم فحصها واعتمادها من الإدارة قبل ظهورها للعامة.')
      } else {
        savedProp = await api.createMyProperty(payload)
        setSuccessMsg('تم إرسال عقارك بنجاح! سيقوم فريق إدارة عقار كير بمراجعته واعتماده ونشره قريباً.')
      }

      // Upload any selected photos
      if (selectedFiles.length > 0 && savedProp?.id) {
        for (const file of selectedFiles) {
          try {
            await api.uploadMyPropertyMedia(savedProp.id, file)
          } catch (uploadErr) {
            console.error('Media upload error:', uploadErr)
          }
        }
      }

      setShowModal(false)
      resetForm()
      loadProperties()
      setTimeout(() => setSuccessMsg(null), 6000)
    } catch (err: any) {
      setError(err.message || 'تعذر حفظ بيانات العقار. يرجى التحقق من المدخلات.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="my-props-page container section-sm">
      {/* Page Header */}
      <div className="my-props-header">
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '6px' }}>
            <Building2 size={13} /> بوابة إدارة العقارات الخاصة بك
          </span>
          <h1 className="my-props-title">عقاراتي المعروضة</h1>
          <p className="my-props-sub">
            أهلاً بك، <strong>{user?.fullName || user?.username}</strong>. يمكنك إضافة عقاراتك وتعديلها ومتابعة حالة اعتمادها من إدارة عقار كير.
          </p>
        </div>

        <button type="button" className="btn btn-primary my-props-add-btn" onClick={openAddModal}>
          <PlusCircle size={18} />
          إضافة عقار جديد
        </button>
      </div>

      {/* Official Communication & Approval Notice */}
      <div className="my-props-notice">
        <div className="my-props-notice__icon">
          <Shield size={24} />
        </div>
        <div className="my-props-notice__content">
          <h4>ملاحظات هامة حول إضافة واعتماد العقارات:</h4>
          <ul>
            <li><strong>مراجعة الإدارة:</strong> أي عقار جديد أو معدل يظل <em>(قيد المراجعة)</em> حتى يتم تدقيقه من إدارة عقار كير واعتماده رسمياً.</li>
            <li><strong>مركزية التواصل:</strong> يتم استقبال كافة اتصالات واستفسارات المشترين حصرياً عبر رقم شركة عقار كير المعتمد <strong>(01055937687)</strong> لحفظ أمان وسرية بياناتك وراحة بالك.</li>
          </ul>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Properties List */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 260 }} />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="my-props-empty">
          <Building2 size={56} />
          <h3>لم تقم بإضافة أي عقارات حتى الآن</h3>
          <p>اعرض شقتك أو منزلك أو أرضك للبيع أو للإيجار وسيتم مراجعتها ونشرها أمام آلاف المشترين بالمحلة الكبرى.</p>
          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            <PlusCircle size={17} /> أضف عقارك الأول الآن
          </button>
        </div>
      ) : (
        <div className="my-props-grid">
          {properties.map(p => {
            const isApproved = p.isPublished === true
            const fallbackImg = getPropertyPlaceholder(p.propertyType)

            return (
              <div key={p.id} className="my-prop-card">
                <div className="my-prop-card__img-wrap">
                  <img
                    src={p.primaryImageUrl || fallbackImg}
                    alt={p.title || 'عقار'}
                    className="my-prop-card__img"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImg }}
                  />
                  <div className="my-prop-card__badges">
                    <span className="badge badge-gold">
                      {p.listingType === 'Sale' ? 'للبيع' : 'للإيجار'}
                    </span>
                    <span className="badge">
                      {p.propertyType === 'Apartment' ? 'شقة' : p.propertyType === 'House' ? 'منزل' : p.propertyType === 'Land' ? 'أرض' : 'محل'}
                    </span>
                  </div>
                </div>

                <div className="my-prop-card__body">
                  {/* Status Banner */}
                  <div className={`my-prop-card__status ${isApproved ? 'status--approved' : 'status--pending'}`}>
                    {isApproved ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>معتمد ومنشور على المنصة</span>
                      </>
                    ) : (
                      <>
                        <Clock size={15} />
                        <span>قيد مراجعة واعتماد الإدارة</span>
                      </>
                    )}
                  </div>

                  <h3 className="my-prop-card__title">{p.title || 'عقار بدون عنوان'}</h3>
                  <p className="my-prop-card__location">{p.district || p.city || 'المحلة الكبرى'}</p>

                  <div className="my-prop-card__metrics">
                    {p.price && (
                      <span className="my-prop-card__price">
                        {p.price.toLocaleString('ar-EG')} ج
                      </span>
                    )}
                    {p.areaSqm && (
                      <span className="my-prop-card__area">
                        {p.areaSqm} م²
                      </span>
                    )}
                  </div>

                  <div className="my-prop-card__actions">
                    <button
                      type="button"
                      className="btn btn-outline my-prop-card__btn"
                      onClick={() => openEditModal(p.id)}
                    >
                      <Edit3 size={15} /> تعديل
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost my-prop-card__del-btn"
                      onClick={() => handleDelete(p.id, p.title)}
                      title="حذف العقار"
                    >
                      <Trash2 size={15} />
                    </button>

                    {isApproved && (
                      <Link
                        to={`/properties/${p.id}`}
                        className="btn btn-ghost my-prop-card__view-btn"
                        title="معاينة الصفحة العامة"
                      >
                        <Eye size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="my-props-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="my-props-modal" onClick={e => e.stopPropagation()}>
            <div className="my-props-modal__header">
              <h3>{editingId ? 'تعديل بيانات العقار' : 'إضافة عقار جديد للعرض'}</h3>
              <button type="button" className="my-props-modal__close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="my-props-form">
              <div className="my-props-form__grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>عنوان الإعلان المختصر <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="مثال: شقة سوبر لوكس للبيع في منشية البكري دور ثالث"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>نوع العقار</label>
                  <select value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                    <option value="Apartment">شقة سكنية</option>
                    <option value="House">منزل / بيت مستقل</option>
                    <option value="Villa">فيلا</option>
                    <option value="Land">أرض فضاء</option>
                    <option value="Shop">محل تجاري / إداري</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>نوع العرض</label>
                  <select value={listingType} onChange={e => setListingType(e.target.value)}>
                    <option value="Sale">للبيع</option>
                    <option value="Rent">للإيجار</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>المنطقة أو الحي</label>
                  <select value={district} onChange={e => setDistrict(e.target.value)}>
                    {DISTRICT_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>المساحة (م²)</label>
                  <input
                    type="number"
                    placeholder="مثال: 135"
                    value={areaSqm}
                    onChange={e => setAreaSqm(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>السعر المطلوب (جنيه مصري)</label>
                  <input
                    type="number"
                    placeholder="مثال: 1250000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>حالة التشطيب</label>
                  <select value={finishingStatus} onChange={e => setFinishingStatus(e.target.value)}>
                    {FINISHING_OPTIONS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {propertyType === 'Apartment' && (
                  <>
                    <div className="form-group">
                      <label>رقم الدور</label>
                      <input
                        type="number"
                        placeholder="مثال: 3"
                        value={floorNumber}
                        onChange={e => setFloorNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>عدد الغرف</label>
                      <input
                        type="number"
                        placeholder="مثال: 3"
                        value={bedrooms}
                        onChange={e => setBedrooms(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>عدد الحمامات</label>
                      <input
                        type="number"
                        placeholder="مثال: 1"
                        value={bathrooms}
                        onChange={e => setBathrooms(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>العنوان والشارع</label>
                  <input
                    type="text"
                    placeholder="مثال: شارع عبد الحي شاهين متفرع من شارع الجمهورية"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                {/* Utilities Checkboxes */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ marginBottom: '8px' }}>الخدمات والمرافق المتوفرة:</label>
                  <div className="my-props-checkbox-grid">
                    <label className="checkbox-pill">
                      <input
                        type="checkbox"
                        checked={waterMeterAvailable}
                        onChange={e => setWaterMeterAvailable(e.target.checked)}
                      />
                      عداد مياه
                    </label>
                    <label className="checkbox-pill">
                      <input
                        type="checkbox"
                        checked={electricityMeterAvailable}
                        onChange={e => setElectricityMeterAvailable(e.target.checked)}
                      />
                      عداد كهرباء
                    </label>
                    <label className="checkbox-pill">
                      <input
                        type="checkbox"
                        checked={gasMeterAvailable}
                        onChange={e => setGasMeterAvailable(e.target.checked)}
                      />
                      غاز طبيعي
                    </label>
                    <label className="checkbox-pill">
                      <input
                        type="checkbox"
                        checked={elevatorAvailable}
                        onChange={e => setElevatorAvailable(e.target.checked)}
                      />
                      أسانسير (مصعد)
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>وصف العقار وملاحظات إضافية</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب مواصفات العقار، حصة الأرض، اتجاه الواجهة بحري أو قبلي..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {/* Image Upload Input */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>صور العقار (يمكن اختيار عدة صور)</label>
                  <div className="my-props-upload-box" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={24} />
                    <span>انقر لاختيار صور من جهازك</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="my-props-file-list">
                      {selectedFiles.map((f, i) => (
                        <span key={i} className="my-props-file-tag">
                          📸 {f.name} ({(f.size / 1024).toFixed(0)} KB)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="my-props-form__footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : editingId ? 'تحديث العقار' : 'إرسال العقار للمراجعة والاعتماد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
