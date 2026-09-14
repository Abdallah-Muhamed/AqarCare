import { useState, useEffect } from 'react';
import './AdminPanelPage.css';
import { API_BASE_URL } from '../constants/api';
import MapPickerModal from '../components/admin/MapPickerModal';
import type { PropertyFloor } from '../types';
import { formatFloorsText } from '../utils/formatters';

interface Property {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  installmentPrice?: number | null;
  soldPrice?: number | null;
  areaSqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
  listingType: string | null;
  finishingStatus: string | null;
  finishingPackageId?: number | null;
  installmentAvailable: boolean;
  floorNumber?: number | null;
  apartmentsPerFloor?: number | null;
  city: string | null;
  district: string | null;
  address: string | null;
  detailedAddress?: string | null;
  status: string;
  isFeatured: boolean;
  isUnderConstruction?: boolean;
  isPublished: boolean;
  waterMeterAvailable?: boolean;
  electricityMeterAvailable?: boolean;
  gasMeterAvailable?: boolean;
  elevatorAvailable?: boolean;
  // The admin list endpoint returns a single primary image URL, not a media array.
  primaryImageUrl?: string | null;
  floors?: PropertyFloor[];
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
  const [mapPickerProperty, setMapPickerProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'sold'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    installmentPrice: '',
    soldPrice: '',
    areaSqm: '',
    floorNumber: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
    finishingStatus: 'Core-Shell',
    finishingPackageId: '',
    installmentAvailable: false,
    city: 'المحلة الكبرى',
    district: '',
    address: '',
    detailedAddress: '',
    status: 'Available',
    isFeatured: false,
    isUnderConstruction: false,
    isPublished: true,
    waterMeterAvailable: false,
    electricityMeterAvailable: false,
    gasMeterAvailable: false,
    elevatorAvailable: false,
    apartmentsPerFloor: '',
  });

  const [floors, setFloors] = useState<PropertyFloor[]>([]);

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

  // ── floor helpers ─────────────────────────────────────────────────────────────

  const addFloor = () => {
    const lastFloor = floors.length > 0 ? floors[floors.length - 1] : null;
    const defaultArea = lastFloor?.areaSqm ?? (formData.areaSqm ? parseFloat(formData.areaSqm) : null);
    const defaultBedrooms = lastFloor?.bedrooms ?? (formData.bedrooms ? parseInt(formData.bedrooms) : null);
    const defaultBathrooms = lastFloor?.bathrooms ?? (formData.bathrooms ? parseInt(formData.bathrooms) : null);

    setFloors(prev => [
      ...prev,
      {
        floorNumber: prev.length + 1,
        floorName: `الدور ${prev.length + 1}`,
        price: null,
        pricePerMeter: null,
        installmentPrice: null,
        areaSqm: defaultArea,
        bedrooms: defaultBedrooms,
        bathrooms: defaultBathrooms,
        isAvailable: true,
        sortOrder: prev.length,
      }
    ]);
  };

  const duplicateLastFloor = () => {
    if (floors.length === 0) {
      addFloor();
      return;
    }
    const last = floors[floors.length - 1];
    setFloors(prev => [
      ...prev,
      {
        floorNumber: prev.length + 1,
        floorName: `الدور ${prev.length + 1}`,
        price: last.price,
        pricePerMeter: last.pricePerMeter,
        installmentPrice: last.installmentPrice,
        soldPrice: null,
        areaSqm: last.areaSqm,
        bedrooms: last.bedrooms,
        bathrooms: last.bathrooms,
        isAvailable: true,
        sortOrder: prev.length,
      }
    ]);
  };

  const updateFloor = (index: number, patch: Partial<PropertyFloor>) => {
    setFloors(prev => prev.map((f, i) => {
      if (i !== index) return f;
      const updated = { ...f, ...patch };

      // Effective area for this floor (fallback to general area)
      const effectiveArea = (updated.areaSqm && updated.areaSqm > 0)
        ? updated.areaSqm
        : (formData.areaSqm ? parseFloat(formData.areaSqm) : 0);

      // If price was updated
      if ('price' in patch) {
        if (updated.price && effectiveArea > 0) {
          updated.pricePerMeter = Math.round(updated.price / effectiveArea);
        } else if (!updated.price) {
          updated.pricePerMeter = null;
        }
      }
      // If pricePerMeter was updated
      else if ('pricePerMeter' in patch) {
        if (updated.pricePerMeter && effectiveArea > 0) {
          updated.price = Math.round(updated.pricePerMeter * effectiveArea);
        } else if (!updated.pricePerMeter) {
          updated.price = null;
        }
      }
      // If areaSqm was updated
      else if ('areaSqm' in patch) {
        if (updated.areaSqm && updated.areaSqm > 0) {
          if (updated.pricePerMeter && updated.pricePerMeter > 0) {
            updated.price = Math.round(updated.pricePerMeter * updated.areaSqm);
          } else if (updated.price && updated.price > 0) {
            updated.pricePerMeter = Math.round(updated.price / updated.areaSqm);
          }
        }
      }

      return updated;
    }));
  };

  const removeFloor = (index: number) => {
    setFloors(prev => prev.filter((_, i) => i !== index));
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
          installmentPrice: formData.installmentPrice ? parseFloat(formData.installmentPrice) : null,
          soldPrice: formData.soldPrice ? parseFloat(formData.soldPrice) : null,
          areaSqm: (floors.find(f => f.areaSqm && f.areaSqm > 0)?.areaSqm)
            ?? (formData.areaSqm ? parseFloat(formData.areaSqm) : null),
          floorNumber: (floors.length === 1 && floors[0].floorNumber != null ? floors[0].floorNumber : null)
            ?? (formData.floorNumber ? parseInt(formData.floorNumber) : null),
          bedrooms: (floors.find(f => f.bedrooms != null)?.bedrooms)
            ?? (formData.bedrooms ? parseInt(formData.bedrooms) : null),
          bathrooms: (floors.find(f => f.bathrooms != null)?.bathrooms)
            ?? (formData.bathrooms ? parseInt(formData.bathrooms) : null),
          finishingPackageId: formData.finishingPackageId
            ? parseInt(formData.finishingPackageId) : null,
          apartmentsPerFloor: formData.apartmentsPerFloor ? parseInt(formData.apartmentsPerFloor) : null,
          isUnderConstruction: formData.isUnderConstruction,
          floors: floors.map((f, i) => ({
            id: f.id,
            floorNumber: f.floorNumber,
            floorName: f.floorName,
            price: f.price,
            pricePerMeter: f.pricePerMeter,
            installmentPrice: f.installmentPrice,
            soldPrice: f.soldPrice,
            areaSqm: f.areaSqm,
            bedrooms: f.bedrooms,
            bathrooms: f.bathrooms,
            isAvailable: f.isAvailable,
            sortOrder: i,
          })),
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
    setFloors([{
      floorNumber: 1,
      floorName: 'الدور 1',
      price: null,
      pricePerMeter: null,
      installmentPrice: null,
      soldPrice: null,
      areaSqm: null,
      isAvailable: true,
      sortOrder: 0,
    }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title ?? '',
      description: property.description ?? '',
      price: property.price?.toString() ?? '',
      installmentPrice: property.installmentPrice?.toString() ?? '',
      soldPrice: property.soldPrice?.toString() ?? '',
      areaSqm: property.areaSqm?.toString() ?? '',
      floorNumber: property.floorNumber?.toString() ?? '',
      bedrooms: property.bedrooms?.toString() ?? '',
      bathrooms: property.bathrooms?.toString() ?? '',
      propertyType: property.propertyType ?? 'Apartment',
      listingType: property.listingType ?? 'Sale',
      finishingStatus: property.finishingStatus ?? 'Core-Shell',
      finishingPackageId: property.finishingPackageId?.toString() || '',
      installmentAvailable: property.installmentAvailable,
      city: property.city ?? 'المحلة الكبرى',
      district: property.district ?? '',
      address: property.address ?? '',
      detailedAddress: property.detailedAddress ?? '',
      status: property.status ?? 'Available',
      isFeatured: property.isFeatured,
      isUnderConstruction: property.isUnderConstruction ?? false,
      isPublished: property.isPublished,
      waterMeterAvailable: property.waterMeterAvailable ?? false,
      electricityMeterAvailable: property.electricityMeterAvailable ?? false,
      gasMeterAvailable: property.gasMeterAvailable ?? false,
      elevatorAvailable: property.elevatorAvailable ?? false,
      apartmentsPerFloor: property.apartmentsPerFloor?.toString() ?? '',
    });

    if (property.floors && property.floors.length > 0) {
      setFloors(property.floors);
    } else {
      fetch(`${API_BASE_URL}/api/properties/${property.id}`)
        .then(r => r.json())
        .then(d => {
          if (d.floors && d.floors.length > 0) setFloors(d.floors);
          else setFloors([]);
        })
        .catch(() => setFloors([]));
    }

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      installmentPrice: '',
      soldPrice: '',
      areaSqm: '',
      floorNumber: '',
      bathrooms: '',
      bedrooms: '',
      propertyType: 'Apartment',
      listingType: 'Sale',
      finishingStatus: 'Core-Shell',
      finishingPackageId: '',
      installmentAvailable: false,
      city: 'المحلة الكبرى',
      district: '',
      address: '',
      detailedAddress: '',
      status: 'Available',
      isFeatured: false,
      isUnderConstruction: false,
      isPublished: true,
      waterMeterAvailable: false,
      electricityMeterAvailable: false,
      gasMeterAvailable: false,
      elevatorAvailable: false,
      apartmentsPerFloor: '',
    });
    setFloors([]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminApiKey');
    setApiKey('');
    setProperties([]);
  };

  // ── stats ─────────────────────────────────────────────────────────────────────

  const totalFloorUnits = properties.reduce((acc, p) => acc + (p.floors?.length || 1), 0);
  const totalSoldUnits = properties.reduce((acc, p) => {
    if (p.floors && p.floors.length > 0) {
      return acc + p.floors.filter(f => !f.isAvailable).length;
    }
    return acc + (p.status === 'Sold' ? 1 : 0);
  }, 0);

  const totalSoldRevenue = properties.reduce((acc, p) => {
    let rev = p.soldPrice || 0;
    if (p.floors && p.floors.length > 0) {
      const floorsRev = p.floors.reduce((sum, f) => sum + (f.soldPrice || 0), 0);
      if (floorsRev > 0) rev = floorsRev;
    }
    return acc + rev;
  }, 0);

  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'Available').length,
    sold: properties.filter(p => p.status === 'Sold').length,
    rented: properties.filter(p => p.status === 'Rented').length,
    featured: properties.filter(p => p.isFeatured).length,
    totalUnits: totalFloorUnits,
    totalSoldUnits: totalSoldUnits,
    revenue: totalSoldRevenue,
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
              <div className="stat-card__val">{stats.total} عقار</div>
              <div className="stat-card__lbl">{stats.totalUnits} شقة / وحدة ({stats.totalSoldUnits} مباع)</div>
            </div>
            <div className="stat-card stat-card--available">
              <div className="stat-card__icon">✅</div>
              <div className="stat-card__val">{stats.available}</div>
              <div className="stat-card__lbl">عقارات متاحة</div>
            </div>
            <div className="stat-card stat-card--sold">
              <div className="stat-card__icon">🔑</div>
              <div className="stat-card__val">{stats.sold}</div>
              <div className="stat-card__lbl">عقارات مُباعة بالكامل</div>
            </div>
            {stats.revenue > 0 && (
              <div className="stat-card" style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.05)' }}>
                <div className="stat-card__icon">💰</div>
                <div className="stat-card__val" style={{ color: '#047857' }}>
                  {stats.revenue.toLocaleString('ar-EG')} ج
                </div>
                <div className="stat-card__lbl">إجمالي المبيعات المسجلة</div>
              </div>
            )}
            <div className="stat-card stat-card--featured">
              <div className="stat-card__icon">⭐</div>
              <div className="stat-card__val">{stats.featured}</div>
              <div className="stat-card__lbl">عقارات مميزة</div>
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
                      <label>العنوان</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="مثال: شقة 3 غرف مدينة نصر"
                      />
                    </div>

                    <div className="form-group">
                      <label>النوع</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      >
                        <option value="Apartment">شقة</option>
                        <option value="House">بيت</option>
                        <option value="Land">أرض</option>
                        <option value="Shop">محل</option>
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
                      </select>
                    </div>

                    <div className="form-group">
                      <label>عدد الشقق في الدور</label>
                      <input
                        type="number"
                        value={formData.apartmentsPerFloor}
                        onChange={(e) => setFormData({ ...formData, apartmentsPerFloor: e.target.value })}
                        placeholder="مثال: 3"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Floors & Pricing */}
                <div className="form-section">
                  <div className="form-section__header-row">
                    <div>
                      <h3 className="form-section__title">🏢 الأدوار والأسعار وسعر المتر</h3>
                      <p className="form-section__sub">
                        حدد الدور والمساحة والغرف والحمامات وسعر الكاش أو سعر المتر ويتم حسابهما تلقائياً، مع إمكانية إضافة سعر التقسيط لكل دور، وتمييز أي دور أو شقة كـ (متاح 🟢) أو (مباع 🔴) بضغطة زر.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-add-floor"
                        onClick={addFloor}
                      >
                        <span>＋</span> إضافة دور
                      </button>
                      {floors.length > 0 && (
                        <button
                          type="button"
                          className="btn-add-floor"
                          onClick={duplicateLastFloor}
                          style={{ background: '#2563eb', borderColor: '#1d4ed8' }}
                          title="إضافة دور جديد بنفس مواصفات وأسعار الدور السابق لتوفير الوقت"
                        >
                          <span>📋</span> تكرار بيانات الدور السابق
                        </button>
                      )}
                    </div>
                  </div>

                  {floors.length === 0 ? (
                    <div className="no-floors-box">
                      <span>🏢</span>
                      <p>لم يتم إضافة أدوار بعد. اضغط على "إضافة دور" لتحديد الدور وسعره أو سعر المتر.</p>
                    </div>
                  ) : (
                    <div className="floors-table-container">
                      <table className="floors-table">
                        <thead>
                          <tr>
                            <th>الدور / الاسم</th>
                            <th>المساحة (م²)</th>
                            <th>غرف النوم</th>
                            <th>الحمامات</th>
                            <th>سعر المتر (جنيه)</th>
                            <th>سعر الكاش (جنيه)</th>
                            <th>سعر التقسيط (جنيه)</th>
                            <th style={{ minWidth: '115px', textAlign: 'center' }}>الحالة</th>
                            <th style={{ minWidth: '120px', textAlign: 'center' }}>سعر البيع الفعلي</th>
                            <th style={{ textAlign: 'center' }}>حذف</th>
                          </tr>
                        </thead>
                        <tbody>
                          {floors.map((floor, index) => (
                            <tr key={index} className={!floor.isAvailable ? 'floor-row--sold' : ''}>
                              <td>
                                <input
                                  type="text"
                                  value={floor.floorName ?? ''}
                                  placeholder={`الدور ${index + 1}`}
                                  onChange={(e) => updateFloor(index, {
                                    floorName: e.target.value,
                                    floorNumber: parseInt(e.target.value.replace(/\D/g, '')) || (index + 1)
                                  })}
                                  className="floor-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={floor.areaSqm ?? ''}
                                  placeholder={formData.areaSqm || '0'}
                                  onChange={(e) => updateFloor(index, { areaSqm: e.target.value ? parseFloat(e.target.value) : null })}
                                  className="floor-input"
                                  style={{ width: '80px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={floor.bedrooms ?? ''}
                                  placeholder="0"
                                  min="0"
                                  onChange={(e) => updateFloor(index, { bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                                  className="floor-input"
                                  style={{ width: '65px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={floor.bathrooms ?? ''}
                                  placeholder="0"
                                  min="0"
                                  onChange={(e) => updateFloor(index, { bathrooms: e.target.value ? parseInt(e.target.value) : null })}
                                  className="floor-input"
                                  style={{ width: '65px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={floor.pricePerMeter ?? ''}
                                  placeholder="0"
                                  onChange={(e) => updateFloor(index, { pricePerMeter: e.target.value ? parseFloat(e.target.value) : null })}
                                  className="floor-input"
                                  title="يتم حساب سعر الكاش تلقائياً بناءً على سعر المتر والمساحة"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={floor.price ?? ''}
                                  placeholder="0"
                                  onChange={(e) => updateFloor(index, { price: e.target.value ? parseFloat(e.target.value) : null })}
                                  className="floor-input"
                                  title="يتم حساب سعر المتر تلقائياً بناءً على سعر الكاش والمساحة"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={floor.installmentPrice ?? ''}
                                  placeholder="0"
                                  onChange={(e) => updateFloor(index, { installmentPrice: e.target.value ? parseFloat(e.target.value) : null })}
                                  className="floor-input"
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => updateFloor(index, {
                                    isAvailable: !floor.isAvailable,
                                    soldPrice: !floor.isAvailable ? null : (floor.soldPrice ?? floor.price)
                                  })}
                                  className={`btn-floor-status ${floor.isAvailable ? 'btn-floor-status--available' : 'btn-floor-status--sold'}`}
                                  title={floor.isAvailable ? 'اضغط لتمييز هذا الدور كـ (مباع)' : 'اضغط لتمييز هذا الدور كـ (متاح)'}
                                >
                                  {floor.isAvailable ? '🟢 متاح' : '🔴 مباع'}
                                </button>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {!floor.isAvailable ? (
                                  <input
                                    type="number"
                                    value={floor.soldPrice ?? ''}
                                    placeholder="سعر البيع"
                                    onChange={(e) => updateFloor(index, { soldPrice: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="floor-input"
                                    style={{ width: '100px', borderColor: '#ef4444', background: '#fef2f2', fontWeight: 700 }}
                                    title="أدخل سعر البيع الفعلي الذي تم الاتفاق عليه لهذا الدور"
                                  />
                                ) : (
                                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>—</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeFloor(index)}
                                  className="btn-delete-floor"
                                  title="حذف الدور"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                        placeholder="مثال: المحلة الكبرى"
                      />
                    </div>

                    <div className="form-group">
                      <label>الحي</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="مثال: منشية البكري"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>العنوان / الشارع</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="مثال: شارع البحر، المحلة الكبرى"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>العنوان التفصيلي / المعالم</label>
                      <input
                        type="text"
                        value={formData.detailedAddress}
                        onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                        placeholder="مثال: برج الصفوة، أمام مسجد البكري، الدور 3"
                      />
                      <small style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                        يظهر هذا العنوان كاملاً على كارت العقار وصفحة التفاصيل لتوجيه العملاء بدقة.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Section: Utilities & Services */}
                <div className="form-section">
                  <h3 className="form-section__title">🛠️ الخدمات</h3>
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
                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.elevatorAvailable}
                        onChange={(e) => setFormData({ ...formData, elevatorAvailable: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">🛗</span>
                      <span>يوجد أسانسير</span>
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
                        checked={formData.isUnderConstruction}
                        onChange={(e) => setFormData({ ...formData, isUnderConstruction: e.target.checked })}
                      />
                      <span className="checkbox-card__icon">🏗️</span>
                      <span>تحت الإنشاء</span>
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
                      <span className="checkbox-card__icon">🌐</span>
                      <span>منشور في الموقع</span>
                    </label>
                  </div>
                </div>

                {error && <p className="error-msg">⚠ {error}</p>}

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-save">
                    {loading ? (
                      <><span className="btn-spinner" /> جاري الحفظ...</>
                    ) : editingProperty ? '💾 تحديث العقار' : 'اضافة'}
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
                        {property.primaryImageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                          <video 
                            src={property.primaryImageUrl} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            muted 
                            playsInline 
                            preload="metadata" 
                          />
                        ) : (
                          <img 
                            src={property.primaryImageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'} 
                            alt={property.title ?? ''} 
                          />
                        )}
                        <div className="property-image__badges">
                          {property.listingType && (
                            <span className={`admin-badge admin-badge--${property.listingType.toLowerCase()}`}>
                              {property.listingType === 'Sale' ? 'بيع' : 'إيجار'}
                            </span>
                          )}
                          {property.isFeatured && <span className="admin-badge admin-badge--featured">⭐ مميز</span>}
                          {property.isUnderConstruction && (
                            <span className="admin-badge admin-badge--underconstruction">🏗️ تحت الإنشاء</span>
                          )}
                        </div>
                      </div>
                      <div className="property-info">
                        <h3>{property.title || 'غير محدد'}</h3>
                        <p className="price">
                          {property.price != null
                            ? `${property.price.toLocaleString('ar-EG')} جنيه`
                            : 'السعر غير محدد'}
                          {property.installmentPrice != null && (
                            <span style={{ fontSize: '0.82rem', color: 'var(--clr-gold)', display: 'block', marginTop: '0.15rem' }}>
                              💳 تقسيط: {property.installmentPrice.toLocaleString('ar-EG')} جنيه
                            </span>
                          )}
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
                             property.status === 'Rented' ? 'مؤجر' : property.status}
                          </span>
                          <span className={`admin-badge ${property.isPublished ? 'admin-badge--available' : 'admin-badge--sold'}`} style={{ fontSize: '0.72rem' }}>
                            {property.isPublished ? '🌐 منشور' : '🔒 مسودة'}
                          </span>
                          {property.floors && property.floors.length > 0 && (() => {
                            const avail = property.floors.filter(f => f.isAvailable !== false).length;
                            const sold = property.floors.filter(f => f.isAvailable === false).length;
                            return (
                              <span
                                className={`admin-badge ${avail === 0 ? 'admin-badge--sold' : 'admin-badge--floors'}`}
                                title={`الأدوار: ${formatFloorsText(property.floors)}`}
                              >
                                🏢 {property.floors.length} أدوار ({avail} متاح{sold > 0 ? ` • ${sold} مباع` : ''})
                              </span>
                            );
                          })()}
                        </div>

                        <div className="property-actions">
                          <button className="btn-edit" onClick={() => handleEdit(property)}>✏️ تعديل</button>
                          <button className="btn-map" onClick={() => setMapPickerProperty(property)}>📍 الخريطة</button>
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

      {mapPickerProperty && (
        <MapPickerModal
          propertyId={mapPickerProperty.id}
          propertyTitle={mapPickerProperty.title || `عقار #${mapPickerProperty.id}`}
          apiKey={apiKey}
          onClose={() => setMapPickerProperty(null)}
          onSaved={() => fetchProperties()}
        />
      )}

      {!showForm && (
        <button className="admin-fab" onClick={openAddForm} aria-label="إضافة عقار">
          ＋
        </button>
      )}
    </div>
  );
}
