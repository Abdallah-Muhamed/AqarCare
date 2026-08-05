import { useState, useEffect } from 'react';
import './AdminPanelPage.css';
import { API_BASE_URL } from '../constants/api';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  soldPrice?: number;
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  listingType: string;
  finishingStatus: string;
  finishingPackageId?: number;
  installmentAvailable: boolean;
  city: string;
  district: string;
  address: string;
  status: string;
  isFeatured: boolean;
  isPublished: boolean;
  media: Array<{ id: number; mediaType: string; url: string; sortOrder: number }>;
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

export default function AdminPanelPage() {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [packages, setPackages] = useState<FinishingPackage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    finishingStatus: 'Semi-Finished',
    finishingPackageId: '',
    installmentAvailable: false,
    city: '',
    district: '',
    address: '',
    status: 'Available',
    isFeatured: false,
    isPublished: true,
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────────

  /** Build auth headers using the key stored in state. */
  const auth = (key: string) => ({ 'X-Api-Key': key });

  const adminFetch = (path: string, options: RequestInit = {}, key = apiKey) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...options.headers as Record<string, string>, 'X-Api-Key': key },
    });

  // ── login ─────────────────────────────────────────────────────────────────────

  /** Verify the key by sending it to the server — server is the only judge. */
  const handleLogin = async () => {
    if (!apiKey.trim()) { setError('من فضلك أدخل مفتاح API'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/properties?pageSize=1`, {
        headers: auth(apiKey),
      });
      if (res.ok) {
        sessionStorage.setItem('adminApiKey', apiKey); // cleared when tab closes
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

  // Restore session if the tab is still open
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
          price: parseFloat(formData.price),
          soldPrice: formData.soldPrice ? parseFloat(formData.soldPrice) : null,
          areaSqm: parseFloat(formData.areaSqm),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
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
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      soldPrice: property.soldPrice?.toString() || '',
      areaSqm: property.areaSqm.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      propertyType: property.propertyType,
      listingType: property.listingType,
      finishingStatus: property.finishingStatus,
      finishingPackageId: property.finishingPackageId?.toString() || '',
      installmentAvailable: property.installmentAvailable,
      city: property.city,
      district: property.district,
      address: property.address,
      status: property.status,
      isFeatured: property.isFeatured,
      isPublished: property.isPublished,
    });
    setShowForm(true);
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
      finishingStatus: 'Semi-Finished',
      finishingPackageId: '',
      installmentAvailable: false,
      city: '',
      district: '',
      address: '',
      status: 'Available',
      isFeatured: false,
      isPublished: true,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminApiKey');
    setApiKey('');
    setProperties([]);
  };

  // ── render ────────────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h2>لوحة التحكم</h2>
          <input
            type="password"
            placeholder="أدخل مفتاح API"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>لوحة التحكم — عقار كير</h1>
        <div className="admin-header__actions">
          <button className="admin-add-btn" onClick={openAddForm}>
            <span>+ إضافة عقار</span>
            <span aria-hidden="true">+</span>
          </button>
          <button onClick={handleLogout} className="logout-btn">خروج</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-main">
          {showForm ? (
            <div className="property-form-container">
              <h2>{editingProperty ? 'تعديل العقار' : 'إضافة عقار جديد'}</h2>
              <form onSubmit={handleSubmit} className="property-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>العنوان</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>السعر (جنيه)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>سعر البيع (إن وُجد)</label>
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
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>غرف النوم</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>الحمامات</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      required
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
                      <option value="Semi-Finished">نصف تشطيب</option>
                      <option value="Finished">مشطب</option>
                      <option value="Super-Lux">سوبر لوكس</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>باقة التشطيب</label>
                    <select
                      value={formData.finishingPackageId}
                      onChange={(e) => setFormData({ ...formData, finishingPackageId: e.target.value })}
                    >
                      <option value="">بدون</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - {pkg.pricePerSqm} EGP/m²
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>المدينة</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>الحي</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>العنوان التفصيلي</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
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

                  <div className="form-group full-width">
                    <label>الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>الصور والفيديو</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                    />
                    {uploading && <p className="uploading">جاري رفع الوسائط...</p>}
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.installmentAvailable}
                        onChange={(e) => setFormData({ ...formData, installmentAvailable: e.target.checked })}
                      />
                      متاح بالتقسيط
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      عقار مميز
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      />
                      منشور
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : editingProperty ? 'تحديث' : 'إضافة'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingProperty(null); }}>
                    إلغاء
                  </button>
                </div>

                {error && <p className="error">{error}</p>}
              </form>
            </div>
          ) : (
            <div className="properties-list">
              <h2>العقارات ({properties.length})</h2>
              <div className="properties-grid">
                {properties.map((property) => (
                  <div key={property.id} className="admin-property-card">
                    <div className="property-image">
                      {property.media.length > 0 ? (
                        <img src={property.media[0].url} alt={property.title} />
                      ) : (
                        <div className="no-image">لا توجد صورة</div>
                      )}
                    </div>
                    <div className="property-info">
                      <h3>{property.title}</h3>
                      <p className="price">{property.price.toLocaleString('ar-EG')} جنيه</p>
                      <p className="location">{property.city}، {property.district}</p>
                      <p className="details">
                        {property.bedrooms} غرف • {property.bathrooms} حمام • {property.areaSqm} م²
                      </p>
                      <div className="property-badges">
                        <span className={`admin-badge ${property.listingType.toLowerCase()}`}>
                          {property.listingType === 'Sale' ? 'بيع' : 'إيجار'}
                        </span>
                        <span className={`admin-badge ${property.status.toLowerCase()}`}>
                          {property.status === 'Available' ? 'متاح' :
                           property.status === 'Sold' ? 'مباع' :
                           property.status === 'Rented' ? 'مؤجر' : 'محجوز'}
                        </span>
                        {property.isFeatured && <span className="admin-badge featured">مميز</span>}
                      </div>
                      <div className="property-actions">
                        <button onClick={() => handleEdit(property)}>تعديل</button>
                        <button onClick={() => handleDelete(property.id)} className="delete-btn">
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!showForm && (
        <button className="admin-fab" onClick={openAddForm} aria-label="إضافة عقار">
          +
        </button>
      )}
    </div>
  );
}
