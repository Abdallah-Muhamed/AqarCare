import { useState, useEffect } from 'react';
import './AdminPanelPage.css';
import { API_BASE_URL } from '../constants/api';

interface Property {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  soldPrice?: number | null;
  areaSqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
  listingType: string | null;
  finishingStatus: string | null;
  finishingPackageId?: number | null;
  installmentAvailable: boolean;
  city: string | null;
  district: string | null;
  address: string | null;
  status: string;
  isFeatured: boolean;
  isPublished: boolean;
  waterMeterAvailable?: boolean;
  electricityMeterAvailable?: boolean;
  gasMeterAvailable?: boolean;
  // The admin list endpoint returns a single primary image URL, not a media array.
  primaryImageUrl?: string | null;
}

interface FinishingPackage {
  id: number;
  name: string;
  slug: string;
  pricePerSqm: number;
  shortDescription: string;
}

// ── Security note ─────────────────────────────────────────────────────────────
// The API key is NEVER stored in the source code.
// The user enters it in the login form → it is sent to the server on every
// request → the SERVER validates it (HTTP 401 if wrong).
// We use sessionStorage so the key is cleared when the browser tab closes.
// ─────────────────────────────────────────────────────────────────────────────

// Map English finishingStatus values → Arabic display labels
const FINISHING_OPTIONS = [
  { value: 'Core-Shell',   label: 'عظم' },
  { value: 'Semi-Finished',label: 'نص تشطيب' },
  { value: 'Finished',     label: 'تشطيب' },
  { value: 'Lux',          label: 'لوكس' },
  { value: 'Super-Lux',    label: 'سوبر لوكس' },
  { value: 'High-Lux',     label: 'هاي لوكس' },
];

const finishingLabel = (val: string) =>
  FINISHING_OPTIONS.find(o => o.value === val)?.label ?? val;

export default function AdminPanelPage() {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [packages, setPackages] = useState<FinishingPackage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'sold'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    soldPrice: '',
    areaSqm: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
    finishingStatus: 'Core-Shell',
    finishingPackageId: '',
    installmentAvailable: false,
    city: '',
    district: '',
    address: '',
    status: 'Available',
    isFeatured: false,
    isPublished: true,
    waterMeterAvailable: false,
    electricityMeterAvailable: false,
    gasMeterAvailable: false,
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────────

  const auth = (key: string) => ({ 'X-Api-Key': key });

  const adminFetch = (path: string, options: RequestInit = {}, key = apiKey) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...options.headers as Record<string, string>, 'X-Api-Key': key },
    });

  // ── login ─────────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!apiKey.trim()) { setError('من فضلك أدخل مفتاح API'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/properties?pageSize=1`, {
        headers: auth(apiKey),
      });
      if (res.ok) {
        sessionStorage.setItem('adminApiKey', apiKey);
        setIsAuthenticated(true);
        fetchProperties(apiKey);
        fetchPackages();
      } else if (res.status === 401) {
        setError('مفتاح API غير صحيح');
      } else {
        setError(`خطأ في الخادم: ${res.status}`);
      }
    } catch {
      setError('تعذّر الاتصال بالخادم. تحقق من اتصالك.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('adminApiKey');
    if (saved) {
      setApiKey(saved);
      setIsAuthenticated(true);
      fetchProperties(saved);
      fetchPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── data fetching ─────────────────────────────────────────────────────────────

  const fetchProperties = async (key = apiKey) => {
    try {
      const res = await adminFetch('/api/admin/properties', {}, key);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.items ?? []);
      }
    } catch {
      setError('فشل تحميل العقارات');
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/finishing-packages`);
      if (res.ok) setPackages(await res.json());
    } catch {
      console.error('Failed to fetch packages');
    }
  };

  // ── media upload ──────────────────────────────────────────────────────────────

  const handleMediaUpload = async (propertyId: number, key = apiKey) => {
    if (mediaFiles.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'properties');

        const uploadRes = await fetch(`${API_BASE_URL}/api/admin/media/upload`, {
          method: 'POST',
          headers: auth(key),
          body: fd,
        });

        if (uploadRes.ok) {
          const result = await uploadRes.json();
          await fetch(`${API_BASE_URL}/api/admin/properties/${propertyId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...auth(key) },
            body: JSON.stringify({
              mediaType: result.mediaType,
              cloudinaryPublicId: result.publicId,
              url: result.url,
              sortOrder: i,
            }),
          });
        }
      }
    } catch {
      setError('فشل رفع الوسائط');
    } finally {
      setUploading(false);
    }
  };

  // ── form handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = editingProperty
        ? `/api/admin/properties/${editingProperty.id}`
        : '/api/admin/properties';
      const method = editingProperty ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          soldPrice: formData.soldPrice ? parseFloat(formData.soldPrice) : null,
          areaSqm: formData.areaSqm ? parseFloat(formData.areaSqm) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          finishingPackageId: formData.finishingPackageId
            ? parseInt(formData.finishingPackageId) : null,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (mediaFiles.length > 0) await handleMediaUpload(result.id);
        setShowForm(false);
        setEditingProperty(null);
        resetForm();
        setMediaFiles([]);
        fetchProperties();
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.title ?? 'فشل حفظ العقار');
      }
    } catch {
      setError('فشل حفظ العقار');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) return;
    try {
      const res = await adminFetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProperties();
      else setError('فشل حذف العقار');
    } catch {
      setError('فشل حذف العقار');
    }
  };

  const openAddForm = () => {
    setShowForm(true);
    setEditingProperty(null);
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title ?? '',
      description: property.description ?? '',
      price: property.price?.toString() ?? '',
      soldPrice: property.soldPrice?.toString() ?? '',
      areaSqm: property.areaSqm?.toString() ?? '',
      bedrooms: property.bedrooms?.toString() ?? '',
      bathrooms: property.bathrooms?.toString() ?? '',
      propertyType: property.propertyType ?? 'Apartment',
      listingType: property.listingType ?? 'Sale',
      finishingStatus: property.finishingStatus ?? 'Core-Shell',
      finishingPackageId: property.finishingPackageId?.toString() || '',
      installmentAvailable: property.installmentAvailable,
      city: property.city ?? '',
      district: property.district ?? '',
      address: property.address ?? '',
      status: property.status ?? 'Available',
      isFeatured: property.isFeatured,
      isPublished: property.isPublished,
      waterMeterAvailable: property.waterMeterAvailable ?? false,
      electricityMeterAvailable: property.electricityMeterAvailable ?? false,
      gasMeterAvailable: property.gasMeterAvailable ?? false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      soldPrice: '',
      areaSqm: '',
      bathrooms: '',
      bedrooms: '',
      propertyType: 'Apartment',
      listingType: 'Sale',
      finishingStatus: 'Core-Shell',
      finishingPackageId: '',
      installmentAvailable: false,
      city: '',
      district: '',
      address: '',
      status: 'Available',
      isFeatured: false,
      isPublished: true,
      waterMeterAvailable: false,
      electricityMeterAvailable: false,
      gasMeterAvailable: false,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminApiKey');
    setApiKey('');
    setProperties([]);
  };

  // ── stats ─────────────────────────────────────────────────────────────────────

  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'Available').length,
    sold: properties.filter(p => p.status === 'Sold').length,
    rented: properties.filter(p => p.status === 'Rented').length,
    featured: properties.filter(p => p.isFeatured).length,
  };

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'available') return p.status === 'Available';
    if (activeTab === 'sold') return p.status === 'Sold' || p.status === 'Rented';
    return true;
  });

  // ── render ────────────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <div className="login-card__icon">🔐</div>
          <h2>لوحة تحكم عقار كير</h2>
          <p className="login-card__sub">أدخل مفتاح الوصول للمتابعة</p>
          <input
            type="password"
            placeholder="مفتاح API"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? (
              <><span className="btn-spinner" />جاري التحقق...</>
            ) : 'دخول →'}
          </button>
          {error && <p className="error-msg">⚠ {error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* ── Header ── */}
      <header className="admin-header">
        <div className="admin-header__brand">
          <span className="admin-header__logo">🏠</span>
          <div>
            <h1>لوحة التحكم</h1>
            <span className="admin-header__sub">عقار كير — نظام الإدارة</span>
          </div>
        </div>
        <div className="admin-header__actions">
          <button className="admin-add-btn" onClick={openAddForm}>
            <span>＋</span> إضافة عقار
          </button>
          <button onClick={handleLogout} className="logout-btn">خروج ↩</button>
        </div>
      </header>

      <div className="admin-body">
        {/* ── Stats Dashboard ── */}
        {!showForm && (
          <div className="admin-stats">
            <div className="stat-card stat-card--total">
              <div className="stat-card__icon">🏢</div>
              <div className="stat-card__val">{stats.total}</div>
              <div className="stat-card__lbl">إجمالي العقارات</div>
            </div>
            <div className="stat-card stat-card--available">
              <div className="stat-card__icon">✅</div>
              <div className="stat-card__val">{stats.available}</div>
              <div className="stat-card__lbl">متاحة</div>
            </div>
            <div className="stat-card stat-card--sold">
              <div className="stat-card__icon">🔑</div>
              <div className="stat-card__val">{stats.sold}</div>
              <div className="stat-card__lbl">مُباعة</div>
            </div>
            <div className="stat-card stat-card--rented">
              <div className="stat-card__icon">🏷️</div>
              <div className="stat-card__val">{stats.rented}</div>
              <div className="stat-card__lbl">مُؤجرة</div>
            </div>
            <div className="stat-card stat-card--featured">
              <div className="stat-card__icon">⭐</div>
              <div className="stat-card__val">{stats.featured}</div>
              <div className="stat-card__lbl">مميزة</div>
            </div>
          </div>
        )}

        <div className="admin-content">
          {showForm ? (
            /* ── Property Form ── */
            <div className="property-form-container">
              <div className="form-header">
                <h2>{editingProperty ? '✏️ تعديل العقار' : '➕ إضافة عقار جديد'}</h2>
                <button
                  type="button"
                  className="form-close-btn"
                  onClick={() => { setShowForm(false); setEditingProperty(null); }}
                >✕ إغلاق</button>
              </div>

              <form onSubmit={handleSubmit} className="property-form">

                {/* Section: Basic Info */}
                <div className="form-section">
                  <h3 className="form-section__title">📋 المعلومات الأساسية</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>عنوان العقار</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="مثال: شقة 3 غرف مدينة نصر"
                      />
                    </div>

                    <div className="form-group">
                      <label>نوع العقار</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      >
                        <option value="Apartment">شقة</option>
                        <option value="Villa">فيلا</option>
                        <option value="Commercial">تجاري</option>
                        <option value="Land">أرض</option>
                        <option value="Studio">استوديو</option>
                        <option value="Office">مكتب</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>نوع الإعلان</label>
                      <select
                        value={formData.listingType}
                        onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                      >
                        <option value="Sale">بيع</option>
                        <option value="Rent">إيجار</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>حالة التشطيب</label>
                      <select
                        value={formData.finishingStatus}
                        onChange={(e) => setFormData({ ...formData, finishingStatus: e.target.value })}
                      >
                        {FINISHING_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>باقة التشطيب</label>
                      <select
                        value={formData.finishingPackageId}
                        onChange={(e) => setFormData({ ...formData, finishingPackageId: e.target.value })}
                      >
                        <option value="">بدون باقة</option>
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} — {pkg.pricePerSqm.toLocaleString('ar-EG')} ج/م²
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>الحالة</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Available">متاح</option>
                        <option value="Sold">مباع</option>
                        <option value="Rented">مؤجر</option>
                        <option value="Reserved">محجوز</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Pricing */}
                <div className="form-section">
                  <h3 className="form-section__title">💰 التسعير والمساحة</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>السعر (جنيه)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>سعر البيع الفعلي</label>
                      <input
                        type="number"
                        value={formData.soldPrice}
                        onChange={(e) => setFormData({ ...formData, soldPrice: e.target.value })}
                        placeholder="اتركه فارغاً إن لم يُبَع"
                      />
                    </div>

                    <div className="form-group">
                      <label>المساحة (م²)</label>
                      <input
                        type="number"
                        value={formData.areaSqm}
                        onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>غرف النوم</label>
                      <input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>الحمامات</label>
                      <input
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Location */}
                <div className="form-section">
                  <h3 className="form-section__title">📍 الموقع</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>المدينة</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="مثال: القاهرة"
                      />
                    </div>

                    <div className="form-group">
                      <label>الحي</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="مثال: مدينة نصر"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>العنوان التفصيلي</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="مثال: شارع عباس العقاد، بجوار..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Utility Meters */}
                <div className="form-section">
                  <h3 className="form-section__title">🔢 العدادات</h3>
                  <div className="checkbox-row">
                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.waterMeterAvailable}
                        onChange={(e) => setFormData({ ...formData, waterMeterAvailable: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">💧</span>
                      <span>عداد مياه متاح</span>
                    </label>

                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.electricityMeterAvailable}
                        onChange={(e) => setFormData({ ...formData, electricityMeterAvailable: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">⚡</span>
                      <span>عداد كهرباء متاح</span>
                    </label>

                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.gasMeterAvailable}
                        onChange={(e) => setFormData({ ...formData, gasMeterAvailable: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">🔥</span>
                      <span>عداد غاز متاح</span>
                    </label>
                  </div>
                </div>

                {/* Section: Description & Media */}
                <div className="form-section">
                  <h3 className="form-section__title">📝 الوصف والوسائط</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>الوصف</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={5}
                        placeholder="اكتب وصفاً تفصيلياً للعقار..."
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>الصور والفيديو</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                          id="media-upload"
                          className="file-upload-input"
                        />
                        <label htmlFor="media-upload" className="file-upload-label">
                          <span>📁</span>
                          {mediaFiles.length > 0
                            ? `${mediaFiles.length} ملف تم اختياره`
                            : 'اضغط لاختيار الصور أو الفيديو'}
                        </label>
                      </div>
                      {uploading && <p className="uploading">⏳ جاري رفع الوسائط...</p>}
                    </div>
                  </div>
                </div>

                {/* Section: Flags */}
                <div className="form-section">
                  <h3 className="form-section__title">⚙️ الإعدادات</h3>
                  <div className="checkbox-row">
                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.installmentAvailable}
                        onChange={(e) => setFormData({ ...formData, installmentAvailable: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">💳</span>
                      <span>متاح بالتقسيط</span>
                    </label>
                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">⭐</span>
                      <span>عقار مميز</span>
                    </label>
                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">📢</span>
                      <span>منشور</span>
                    </label>
                  </div>
                </div>

                {error && <p className="error-msg">⚠ {error}</p>}

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-save">
                    {loading ? (
                      <><span className="btn-spinner" /> جاري الحفظ...</>
                    ) : editingProperty ? '💾 تحديث العقار' : '✅ إضافة العقار'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => { setShowForm(false); setEditingProperty(null); }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ── Properties List ── */
            <div className="properties-section">
              <div className="properties-section__header">
                <h2>العقارات</h2>
                <div className="filter-tabs">
                  <button
                    className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    الكل ({stats.total})
                  </button>
                  <button
                    className={`filter-tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                  >
                    متاحة ({stats.available})
                  </button>
                  <button
                    className={`filter-tab ${activeTab === 'sold' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sold')}
                  >
                    مباعة/مؤجرة ({stats.sold + stats.rented})
                  </button>
                </div>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="empty-admin">
                  <span>🏠</span>
                  <p>لا توجد عقارات في هذه الفئة</p>
                  <button className="admin-add-btn" onClick={openAddForm}>+ إضافة أول عقار</button>
                </div>
              ) : (
                <div className="properties-grid">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="admin-property-card">
                      <div className="property-image">
                        {property.primaryImageUrl ? (
                          <img src={property.primaryImageUrl} alt={property.title} />
                        ) : (
                          <div className="no-image">🏠<span>لا توجد صورة</span></div>
                        )}
                        <div className="property-image__badges">
                          {property.listingType && (
                            <span className={`admin-badge admin-badge--${property.listingType.toLowerCase()}`}>
                              {property.listingType === 'Sale' ? 'بيع' : 'إيجار'}
                            </span>
                          )}
                          {property.isFeatured && <span className="admin-badge admin-badge--featured">⭐ مميز</span>}
                        </div>
                      </div>
                      <div className="property-info">
                        <h3>{property.title || 'غير محدد'}</h3>
                        <p className="price">
                          {property.price != null
                            ? `${property.price.toLocaleString('ar-EG')} جنيه`
                            : 'السعر غير محدد'}
                        </p>
                        <p className="location">
                          📍 {[property.city, property.district].filter(Boolean).join('، ') || 'غير محدد'}
                        </p>
                        <p className="details">
                          🛏 {property.bedrooms ?? '—'} غرف &nbsp;•&nbsp;
                          🚿 {property.bathrooms ?? '—'} حمام &nbsp;•&nbsp;
                          📐 {property.areaSqm ?? '—'} م²
                        </p>
                        {property.finishingStatus && (
                          <p className="finishing">
                            🎨 {finishingLabel(property.finishingStatus)}
                          </p>
                        )}

                        {/* Available meters */}
                        {(property.waterMeterAvailable || property.electricityMeterAvailable || property.gasMeterAvailable) && (
                          <div className="meter-numbers">
                            {property.waterMeterAvailable && (
                              <span className="meter-num meter-num--water">💧 مياه</span>
                            )}
                            {property.electricityMeterAvailable && (
                              <span className="meter-num meter-num--electricity">⚡ كهرباء</span>
                            )}
                            {property.gasMeterAvailable && (
                              <span className="meter-num meter-num--gas">🔥 غاز</span>
                            )}
                          </div>
                        )}

                        <div className="property-badges">
                          <span className={`admin-badge admin-badge--status-${property.status.toLowerCase()}`}>
                            {property.status === 'Available' ? 'متاح' :
                             property.status === 'Sold' ? 'مباع' :
                             property.status === 'Rented' ? 'مؤجر' : 'محجوز'}
                          </span>
                          {!property.isPublished && <span className="admin-badge admin-badge--draft">مسودة</span>}
                        </div>

                        <div className="property-actions">
                          <button className="btn-edit" onClick={() => handleEdit(property)}>✏️ تعديل</button>
                          <button className="btn-delete" onClick={() => handleDelete(property.id)}>🗑 حذف</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!showForm && (
        <button className="admin-fab" onClick={openAddForm} aria-label="إضافة عقار">
          ＋
        </button>
      )}
    </div>
  );
}
