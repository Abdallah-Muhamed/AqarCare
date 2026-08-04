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
    if (!apiKey.trim()) { setError('Please enter the API Key'); return; }
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
        setError('Invalid API Key');
      } else {
        setError(`Server error: ${res.status}`);
      }
    } catch {
      setError('Cannot reach the server. Check your connection.');
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
      setError('Failed to fetch properties');
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
      setError('Failed to upload media');
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
        setError(body?.title ?? 'Failed to save property');
      }
    } catch {
      setError('Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      const res = await adminFetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProperties();
      else setError('Failed to delete property');
    } catch {
      setError('Failed to delete property');
    }
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
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <button onClick={() => { setShowForm(true); setEditingProperty(null); resetForm(); }}>
            + Add Property
          </button>
        </div>

        <div className="admin-main">
          {showForm ? (
            <div className="property-form-container">
              <h2>{editingProperty ? 'Edit Property' : 'Add New Property'}</h2>
              <form onSubmit={handleSubmit} className="property-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (EGP)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Sold Price (EGP) - if sold</label>
                    <input
                      type="number"
                      value={formData.soldPrice}
                      onChange={(e) => setFormData({ ...formData, soldPrice: e.target.value })}
                      placeholder="Leave empty if not sold"
                    />
                  </div>

                  <div className="form-group">
                    <label>Area (m²)</label>
                    <input
                      type="number"
                      value={formData.areaSqm}
                      onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Property Type</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Listing Type</label>
                    <select
                      value={formData.listingType}
                      onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                    >
                      <option value="Sale">Sale</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Finishing Status</label>
                    <select
                      value={formData.finishingStatus}
                      onChange={(e) => setFormData({ ...formData, finishingStatus: e.target.value })}
                    >
                      <option value="Semi-Finished">Semi-Finished</option>
                      <option value="Finished">Finished</option>
                      <option value="Super-Lux">Super-Lux</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Finishing Package</label>
                    <select
                      value={formData.finishingPackageId}
                      onChange={(e) => setFormData({ ...formData, finishingPackageId: e.target.value })}
                    >
                      <option value="">None</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - {pkg.pricePerSqm} EGP/m²
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                      <option value="Rented">Rented</option>
                      <option value="Reserved">Reserved</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Media (Images/Videos)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                    />
                    {uploading && <p className="uploading">Uploading media...</p>}
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.installmentAvailable}
                        onChange={(e) => setFormData({ ...formData, installmentAvailable: e.target.checked })}
                      />
                      Installment Available
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      Featured Property
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      />
                      Published
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : editingProperty ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingProperty(null); }}>
                    Cancel
                  </button>
                </div>

                {error && <p className="error">{error}</p>}
              </form>
            </div>
          ) : (
            <div className="properties-list">
              <h2>Properties ({properties.length})</h2>
              <div className="properties-grid">
                {properties.map((property) => (
                  <div key={property.id} className="property-card">
                    <div className="property-image">
                      {property.media.length > 0 ? (
                        <img src={property.media[0].url} alt={property.title} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="property-info">
                      <h3>{property.title}</h3>
                      <p className="price">{property.price.toLocaleString()} EGP</p>
                      <p className="location">{property.city}, {property.district}</p>
                      <p className="details">
                        {property.bedrooms} Beds • {property.bathrooms} Baths • {property.areaSqm} m²
                      </p>
                      <div className="property-badges">
                        <span className={`badge ${property.listingType.toLowerCase()}`}>
                          {property.listingType}
                        </span>
                        <span className={`badge ${property.status.toLowerCase()}`}>
                          {property.status}
                        </span>
                        {property.isFeatured && <span className="badge featured">Featured</span>}
                      </div>
                      <div className="property-actions">
                        <button onClick={() => handleEdit(property)}>Edit</button>
                        <button onClick={() => handleDelete(property.id)} className="delete-btn">
                          Delete
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
    </div>
  );
}
