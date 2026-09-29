import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminPanelPage.css';
import './MyPropertiesPage.css';
import { api, getStoredUser, clearAuth, getAuthToken } from '../api';
import type { PropertyFloor, PropertyListItem } from '../types';
import { formatFloorsText, parseMultiFloorNumbers } from '../utils/formatters';
import { getPropertyPlaceholder } from '../constants/placeholders';

// Map English finishingStatus values → Arabic display labels
const FINISHING_OPTIONS = [
  { value: 'Core-Shell',      label: 'عظم' },
  { value: 'Semi-Finished',   label: 'نص تشطيب' },
  { value: 'Lux',             label: 'لوكس' },
  { value: 'Super-Lux',       label: 'سوبر لوكس' },
  { value: 'Ultra-Super-Lux', label: 'ألترا سوبر لوكس' },
  { value: 'High-Lux',        label: 'هاي لوكس' },
  { value: 'Mixed',           label: 'تشطيب متعدد' },
];

const finishingLabel = (val: string) =>
  FINISHING_OPTIONS.find(o => o.value === val)?.label ?? val;

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'pending'>('all');
  const [floorViewMode, setFloorViewMode] = useState<'cards' | 'table'>('cards');

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
    isUnderConstruction: false,
    waterMeterAvailable: false,
    electricityMeterAvailable: false,
    gasMeterAvailable: false,
    elevatorAvailable: false,
    apartmentsPerFloor: '',
    numberOfFloors: '',
    finishedApartments: '',
    semiFinishedApartments: '',
    coreShellApartments: '',
    // Land-specific fields
    frontageWidth: '',
    frontageLength: '',
    streetWidth: '',
    hasBuildingLicense: false,
    hasElectricity: false,
    hasWater: false,
    hasSewerage: false,
    hasGas: false,
  });

  const [floors, setFloors] = useState<PropertyFloor[]>([]);

  // Bulk floor generator state
  const [bulkFromFloor, setBulkFromFloor] = useState<number | string>(1);
  const [bulkToFloor, setBulkToFloor] = useState<number | string>(3);
  const [bulkFinishing, setBulkFinishing] = useState<string>('Ultra-Super-Lux');
  const [bulkArea, setBulkArea] = useState<string>('');
  const [bulkBedrooms, setBulkBedrooms] = useState<string>('');
  const [bulkBathrooms, setBulkBathrooms] = useState<string>('');

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // ── Auth verification & data fetching ─────────────────────────────────────────

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyProperties();
      setProperties(data || []);
    } catch (err: any) {
      if (err.statusCode === 401) {
        clearAuth();
        navigate(`/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      setError(err.message || 'تعذر تحميل عقاراتك. يرجى إعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token || !user) {
      navigate(`/login?from=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    loadProperties();

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      openAddForm();
    }

    const handleCustomOpen = () => {
      openAddForm();
    };
    window.addEventListener('aqarcare:open-add-property', handleCustomOpen);
    return () => {
      window.removeEventListener('aqarcare:open-add-property', handleCustomOpen);
    };
  }, []);

  // ── floor helpers ─────────────────────────────────────────────────────────────

  const syncHouseApartmentCounts = (floorsList: PropertyFloor[], aptsPerFloorVal?: number | string) => {
    const aptPerFloor = Math.max(1, parseInt(String(aptsPerFloorVal !== undefined ? aptsPerFloorVal : formData.apartmentsPerFloor || 1), 10) || 1);
    let finishedFloors = 0;
    let semiFinishedFloors = 0;
    let coreShellFloors = 0;

    for (const f of floorsList) {
      const status = f.finishingStatus;
      if (status === 'Ultra-Super-Lux' || status === 'Super-Lux' || status === 'Finished' || status === 'Lux' || status === 'High-Lux') {
        finishedFloors++;
      } else if (status === 'Semi-Finished') {
        semiFinishedFloors++;
      } else if (status === 'Core-Shell') {
        coreShellFloors++;
      }
    }

    setFormData(prev => ({
      ...prev,
      numberOfFloors: floorsList.length > 0 ? String(floorsList.length) : prev.numberOfFloors,
      finishedApartments: floorsList.length > 0 ? String(finishedFloors * aptPerFloor) : prev.finishedApartments,
      semiFinishedApartments: floorsList.length > 0 ? String(semiFinishedFloors * aptPerFloor) : prev.semiFinishedApartments,
      coreShellApartments: floorsList.length > 0 ? String(coreShellFloors * aptPerFloor) : prev.coreShellApartments,
    }));
  };

  const handleAddBulkFloors = () => {
    const from = typeof bulkFromFloor === 'string' ? parseInt(bulkFromFloor, 10) : bulkFromFloor;
    const to = typeof bulkToFloor === 'string' ? parseInt(bulkToFloor, 10) : bulkToFloor;
    if (isNaN(from) || isNaN(to) || from > to) {
      setError('يرجى إدخال نطاق أدوار صحيح (مثال: من 1 إلى 3)');
      return;
    }
    const count = to - from + 1;
    if (count > 50) {
      setError('أقصى عدد للأدوار المضافة دفعة واحدة هو 50 دور');
      return;
    }

    const defaultArea = bulkArea ? parseFloat(bulkArea) : (formData.areaSqm ? parseFloat(formData.areaSqm) : null);
    const defaultBedrooms = bulkBedrooms ? parseInt(bulkBedrooms, 10) : (formData.bedrooms ? parseInt(formData.bedrooms) : null);
    const defaultBathrooms = bulkBathrooms ? parseInt(bulkBathrooms, 10) : (formData.bathrooms ? parseInt(formData.bathrooms) : null);

    const generated: PropertyFloor[] = [];
    for (let n = from; n <= to; n++) {
      generated.push({
        floorNumber: n,
        floorName: n === 0 ? 'الدور الأرضي' : `الدور ${n}`,
        finishingStatus: bulkFinishing,
        areaSqm: defaultArea,
        bedrooms: defaultBedrooms,
        bathrooms: defaultBathrooms,
        price: null,
        pricePerMeter: null,
        installmentPrice: null,
        soldPrice: null,
        isAvailable: true,
        sortOrder: floors.length + (n - from),
      });
    }

    const nextFloors = [...floors, ...generated];
    setFloors(nextFloors);
    if (formData.propertyType === 'House') {
      syncHouseApartmentCounts(nextFloors);
    }
    setSuccessMsg(`تمت إضافة ${count} أدوار (${from} إلى ${to}) دفعة واحدة بنجاح!`);

    setBulkFromFloor(to + 1);
    setBulkToFloor(to + count);
    setBulkFinishing(bulkFinishing === 'Ultra-Super-Lux' ? 'Semi-Finished' : 'Ultra-Super-Lux');
  };

  const addFloor = () => {
    const lastFloor = floors.length > 0 ? floors[floors.length - 1] : null;
    const defaultArea = lastFloor?.areaSqm ?? (formData.areaSqm ? parseFloat(formData.areaSqm) : null);
    const defaultBedrooms = lastFloor?.bedrooms ?? (formData.bedrooms ? parseInt(formData.bedrooms) : null);
    const defaultBathrooms = lastFloor?.bathrooms ?? (formData.bathrooms ? parseInt(formData.bathrooms) : null);
    const defaultFinishing = lastFloor?.finishingStatus ?? (formData.propertyType === 'House' ? 'Ultra-Super-Lux' : (formData.finishingStatus || 'Semi-Finished'));

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
        finishingStatus: defaultFinishing,
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
        finishingStatus: last.finishingStatus,
        isAvailable: true,
        sortOrder: prev.length,
      }
    ]);
  };

  const duplicateFloor = (index: number) => {
    const target = floors[index];
    if (!target) return;
    const nextNum = floors.length + 1;
    setFloors(prev => [
      ...prev.slice(0, index + 1),
      {
        floorNumber: nextNum,
        floorName: `الدور ${nextNum}`,
        price: target.price,
        pricePerMeter: target.pricePerMeter,
        installmentPrice: target.installmentPrice,
        soldPrice: null,
        areaSqm: target.areaSqm,
        bedrooms: target.bedrooms,
        bathrooms: target.bathrooms,
        finishingStatus: target.finishingStatus,
        isAvailable: true,
        sortOrder: nextNum,
      },
      ...prev.slice(index + 1)
    ]);
  };

  const updateFloor = (index: number, patch: Partial<PropertyFloor>) => {
    setFloors(prev => prev.map((f, i) => {
      if (i !== index) return f;
      const updated = { ...f, ...patch };

      const effectiveArea = (updated.areaSqm && updated.areaSqm > 0)
        ? updated.areaSqm
        : (formData.areaSqm ? parseFloat(formData.areaSqm) : 0);

      if ('price' in patch) {
        if (updated.price && effectiveArea > 0) {
          updated.pricePerMeter = Math.round(updated.price / effectiveArea);
        } else if (!updated.price) {
          if (updated.installmentPrice && effectiveArea > 0) {
            updated.pricePerMeter = Math.round(updated.installmentPrice / effectiveArea);
          } else {
            updated.pricePerMeter = null;
          }
        }
      } else if ('installmentPrice' in patch) {
        if (!updated.price && updated.installmentPrice && effectiveArea > 0) {
          updated.pricePerMeter = Math.round(updated.installmentPrice / effectiveArea);
        } else if (!updated.price && !updated.installmentPrice) {
          updated.pricePerMeter = null;
        }
      } else if ('areaSqm' in patch && effectiveArea > 0) {
        if (updated.price) {
          updated.pricePerMeter = Math.round(updated.price / effectiveArea);
        } else if (updated.installmentPrice) {
          updated.pricePerMeter = Math.round(updated.installmentPrice / effectiveArea);
        }
      }

      return updated;
    }));
  };

  const removeFloor = (index: number) => {
    setFloors(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (formData.propertyType === 'House') {
        syncHouseApartmentCounts(next);
      }
      return next;
    });
  };

  // ── form handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const finalFloors: PropertyFloor[] = [];
      for (const f of floors) {
        const multi = parseMultiFloorNumbers(f.floorName);
        if (multi.length > 1) {
          multi.forEach((num, idx) => {
            finalFloors.push({
              ...f,
              id: idx === 0 ? f.id : undefined,
              floorNumber: num,
              floorName: `الدور ${num}`,
              sortOrder: num,
            });
          });
        } else {
          let cleanNum = f.floorNumber;
          if (cleanNum != null && cleanNum > 50) {
            const m = String(cleanNum).match(/\d{1,2}/);
            cleanNum = m ? parseInt(m[0], 10) : null;
          }
          finalFloors.push({
            ...f,
            floorNumber: cleanNum,
          });
        }
      }

      const isHouseType = formData.propertyType === 'House';
      const isLandType  = formData.propertyType === 'Land';
      const isShopType  = formData.propertyType === 'Shop';

      let computedPrice: number | null = null;
      let computedInstallmentPrice: number | null = null;

      if (isHouseType || isLandType || isShopType) {
        computedPrice = formData.price ? parseFloat(formData.price) : null;
        computedInstallmentPrice = formData.installmentPrice ? parseFloat(formData.installmentPrice) : null;
      } else {
        const floorCashPrices = finalFloors.filter(f => f.price != null && f.price > 0).map(f => f.price!);
        const floorInstPrices = finalFloors.filter(f => f.installmentPrice != null && f.installmentPrice > 0).map(f => f.installmentPrice!);

        computedPrice = floorCashPrices.length > 0
          ? Math.min(...floorCashPrices)
          : (formData.price ? parseFloat(formData.price) : null);

        computedInstallmentPrice = floorInstPrices.length > 0
          ? Math.min(...floorInstPrices)
          : (formData.installmentPrice ? parseFloat(formData.installmentPrice) : null);
      }

      const processedFloors = (isHouseType || isLandType || isShopType)
        ? []
        : finalFloors.map((f, i) => ({
            id: f.id,
            floorNumber: f.floorNumber,
            floorName: f.floorName,
            price: isHouseType ? null : f.price,
            pricePerMeter: isHouseType ? null : f.pricePerMeter,
            installmentPrice: isHouseType ? null : f.installmentPrice,
            soldPrice: f.soldPrice,
            areaSqm: f.areaSqm,
            bedrooms: isShopType ? null : f.bedrooms,
            bathrooms: f.bathrooms,
            finishingStatus: isHouseType ? 'Ultra-Super-Lux' : (f.finishingStatus || formData.finishingStatus || 'Semi-Finished'),
            isAvailable: isHouseType ? true : (f.isAvailable !== false),
            sortOrder: f.sortOrder ?? i,
          }));

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: computedPrice,
        installmentPrice: computedInstallmentPrice,
        soldPrice: formData.soldPrice ? parseFloat(formData.soldPrice) : null,
        areaSqm: formData.areaSqm ? parseFloat(formData.areaSqm) : null,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber, 10) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms, 10) : null,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        finishingStatus: formData.propertyType === 'House' ? 'Ultra-Super-Lux' : formData.finishingStatus,
        finishingPackageId: formData.finishingPackageId ? parseInt(formData.finishingPackageId, 10) : null,
        installmentAvailable: formData.installmentAvailable,
        city: formData.city || 'المحلة الكبرى',
        district: formData.district,
        address: formData.address,
        detailedAddress: formData.detailedAddress,
        status: formData.status,
        isUnderConstruction: formData.propertyType === 'Land' ? false : formData.isUnderConstruction,
        waterMeterAvailable: formData.waterMeterAvailable,
        electricityMeterAvailable: formData.electricityMeterAvailable,
        gasMeterAvailable: formData.gasMeterAvailable,
        elevatorAvailable: formData.elevatorAvailable,
        apartmentsPerFloor: formData.apartmentsPerFloor ? parseInt(formData.apartmentsPerFloor, 10) : null,
        numberOfFloors: formData.propertyType === 'House'
          ? (formData.numberOfFloors ? parseInt(formData.numberOfFloors, 10) : (floors.length || null))
          : (processedFloors.length > 0 ? processedFloors.length : (formData.numberOfFloors ? parseInt(formData.numberOfFloors, 10) : null)),
        finishedApartments: formData.finishedApartments ? parseInt(formData.finishedApartments, 10) : null,
        semiFinishedApartments: formData.semiFinishedApartments ? parseInt(formData.semiFinishedApartments, 10) : null,
        coreShellApartments: formData.coreShellApartments ? parseInt(formData.coreShellApartments, 10) : null,
        frontageWidth: formData.frontageWidth ? parseFloat(formData.frontageWidth) : null,
        frontageLength: formData.frontageLength ? parseFloat(formData.frontageLength) : null,
        streetWidth: formData.streetWidth || null,
        hasBuildingLicense: formData.hasBuildingLicense,
        hasElectricity: formData.hasElectricity,
        hasWater: formData.hasWater,
        hasSewerage: formData.hasSewerage,
        hasGas: formData.hasGas,
        floors: processedFloors,
      };

      let savedPropertyId: number;

      if (editingProperty) {
        const updated = await api.updateMyProperty(editingProperty.id, payload);
        savedPropertyId = updated.id;
        setSuccessMsg('تم تحديث العقار بنجاح! تم إرساله لمراجعة واعتماد الإدارة.');
      } else {
        const created = await api.createMyProperty(payload);
        savedPropertyId = created.id;
        setSuccessMsg('تمت إضافة العقار بنجاح! يخضع الآن لمراجعة واعتماد إدارة عقار كير قبل نشره على الموقع.');
      }

      // Handle media upload
      if (mediaFiles.length > 0 && savedPropertyId) {
        setUploading(true);
        for (const file of mediaFiles) {
          try {
            await api.uploadMyPropertyMedia(savedPropertyId, file);
          } catch (mErr) {
            console.error('Failed to upload media:', mErr);
          }
        }
        setUploading(false);
      }

      setShowForm(false);
      setEditingProperty(null);
      setMediaFiles([]);
      loadProperties();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ العقار');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingProperty(null);
    resetForm();
    setShowForm(true);
    setFloors([{
      floorNumber: 1,
      floorName: 'الدور 1',
      price: null,
      pricePerMeter: null,
      installmentPrice: null,
      soldPrice: null,
      areaSqm: null,
      bedrooms: null,
      bathrooms: null,
      finishingStatus: 'Core-Shell',
      isAvailable: true,
      sortOrder: 0,
    }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = async (property: PropertyListItem) => {
    setEditingProperty(property);
    setFormData({
      title: property.title ?? '',
      description: '',
      price: property.price?.toString() ?? '',
      installmentPrice: property.installmentPrice?.toString() ?? '',
      soldPrice: '',
      areaSqm: property.areaSqm?.toString() ?? '',
      floorNumber: property.floorNumber?.toString() ?? '',
      bedrooms: property.bedrooms?.toString() ?? '',
      bathrooms: property.bathrooms?.toString() ?? '',
      propertyType: property.propertyType ?? 'Apartment',
      listingType: property.listingType ?? 'Sale',
      finishingStatus: property.finishingStatus ?? 'Core-Shell',
      finishingPackageId: '',
      installmentAvailable: property.installmentAvailable ?? false,
      city: property.city ?? 'المحلة الكبرى',
      district: property.district ?? '',
      address: property.address ?? '',
      detailedAddress: property.detailedAddress ?? '',
      status: property.status ?? 'Available',
      isUnderConstruction: property.isUnderConstruction ?? false,
      waterMeterAvailable: property.waterMeterAvailable ?? false,
      electricityMeterAvailable: property.electricityMeterAvailable ?? false,
      gasMeterAvailable: property.gasMeterAvailable ?? false,
      elevatorAvailable: property.elevatorAvailable ?? false,
      apartmentsPerFloor: property.apartmentsPerFloor?.toString() ?? '',
      numberOfFloors: property.numberOfFloors?.toString() ?? (property.floors?.length ? property.floors.length.toString() : ''),
      finishedApartments: property.finishedApartments?.toString() ?? '',
      semiFinishedApartments: property.semiFinishedApartments?.toString() ?? '',
      coreShellApartments: property.coreShellApartments?.toString() ?? '',
      frontageWidth: property.frontageWidth?.toString() ?? '',
      frontageLength: property.frontageLength?.toString() ?? '',
      streetWidth: property.streetWidth ?? '',
      hasBuildingLicense: property.hasBuildingLicense ?? false,
      hasElectricity: property.hasElectricity ?? false,
      hasWater: property.hasWater ?? false,
      hasSewerage: property.hasSewerage ?? false,
      hasGas: property.hasGas ?? false,
    });

    if (property.floors && property.floors.length > 0) {
      setFloors(property.floors);
    } else {
      setFloors([]);
    }

    try {
      const full = await api.getMyProperty(property.id);
      if (full) {
        setFormData(prev => ({
          ...prev,
          description: full.description || '',
          soldPrice: full.soldPrice?.toString() || '',
          installmentAvailable: full.installmentAvailable ?? prev.installmentAvailable,
        }));
        if (full.floors && full.floors.length > 0) {
          setFloors(full.floors);
        }
      }
    } catch {
      // fallback to list item
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
      isUnderConstruction: false,
      waterMeterAvailable: false,
      electricityMeterAvailable: false,
      gasMeterAvailable: false,
      elevatorAvailable: false,
      apartmentsPerFloor: '',
      numberOfFloors: '',
      finishedApartments: '',
      semiFinishedApartments: '',
      coreShellApartments: '',
      frontageWidth: '',
      frontageLength: '',
      streetWidth: '',
      hasBuildingLicense: false,
      hasElectricity: false,
      hasWater: false,
      hasSewerage: false,
      hasGas: false,
    });
    setFloors([]);
    setMediaFiles([]);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العقار نهائياً؟')) return;
    try {
      await api.deleteMyProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      setSuccessMsg('تم حذف العقار بنجاح.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'تعذر حذف العقار.');
    }
  };

  // ── stats ─────────────────────────────────────────────────────────────────────

  const totalFloorUnits = properties.reduce((acc, p) => acc + (p.floors?.length || 1), 0);
  const totalSoldUnits = properties.reduce((acc, p) => {
    if (p.floors && p.floors.length > 0) {
      return acc + p.floors.filter(f => !f.isAvailable).length;
    }
    return acc + (p.status === 'Sold' ? 1 : 0);
  }, 0);

  const stats = {
    total: properties.length,
    published: properties.filter(p => p.isPublished === true).length,
    pending: properties.filter(p => !p.isPublished).length,
    available: properties.filter(p => p.status === 'Available').length,
    sold: properties.filter(p => p.status === 'Sold').length,
    totalUnits: totalFloorUnits,
    totalSoldUnits: totalSoldUnits,
  };

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'published') return p.isPublished === true;
    if (activeTab === 'pending') return !p.isPublished;
    return true;
  });

  return (
    <div className="admin-panel my-props-page">
      {/* ── Header Matching Admin Panel ── */}
      <header className="admin-header">
        <div className="admin-header__brand">
          <span className="admin-header__logo">🏠</span>
          <div>
            <h1>لوحة عقاراتي المعروضة</h1>
            <span className="admin-header__sub">بوابة إضافة وإدارة العقارات — {user?.fullName || user?.username}</span>
          </div>
        </div>

        <div className="admin-header__actions">
          <button className="admin-add-btn" onClick={openAddForm}>
            <span>＋</span> إضافة عقار جديد
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* Notice Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,138,0.06), rgba(200,146,42,0.08))',
          border: '1px solid rgba(200,146,42,0.3)',
          borderRadius: '12px',
          padding: '12px 18px',
          margin: '1rem var(--space-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.88rem',
          lineHeight: '1.5'
        }}>
          <span style={{ fontSize: '1.4rem' }}>🛡️</span>
          <div>
            <strong style={{ color: '#1e3a8a' }}>ملاحظة هامة للملاك والعملاء:</strong>{' '}
            <span>
              جميع العقارات المضافة أو المعدلة تخضع لمراجعة واعتماد إدارة عقار كير الرسمية قبل نشرها على المنصة. كافة استفسارات المشترين تتم مركزياً عبر رقم الشركة <strong>(01055937687)</strong> لحفظ خصوصيتك وسرية بياناتك.
            </span>
          </div>
        </div>

        {/* ── Stats Dashboard (Exact Match) ── */}
        {!showForm && (
          <div className="admin-stats">
            <div className="stat-card stat-card--total">
              <div className="stat-card__icon">🏢</div>
              <div className="stat-card__val">{stats.total} عقار</div>
              <div className="stat-card__lbl">{stats.totalUnits} شقة / وحدة ({stats.totalSoldUnits} مباع)</div>
            </div>
            <div className="stat-card stat-card--available">
              <div className="stat-card__icon">✅</div>
              <div className="stat-card__val">{stats.published}</div>
              <div className="stat-card__lbl">معتمد ومنشور على الموقع</div>
            </div>
            <div className="stat-card" style={{ borderColor: '#f59e0b', background: 'rgba(245,158,11,0.06)' }}>
              <div className="stat-card__icon">⏳</div>
              <div className="stat-card__val" style={{ color: '#d97706' }}>{stats.pending}</div>
              <div className="stat-card__lbl">قيد مراجعة واعتماد الإدارة</div>
            </div>
            <div className="stat-card stat-card--sold">
              <div className="stat-card__icon">🔑</div>
              <div className="stat-card__val">{stats.sold}</div>
              <div className="stat-card__lbl">عقارات تم بيعها</div>
            </div>
          </div>
        )}

        <div className="admin-content">
          {showForm ? (
            /* ── Property Form (100% Matching Admin Form) ── */
            <div className="property-form-container">
              <div className="form-header">
                <h2>{editingProperty ? '✏️ تعديل بيانات العقار' : '➕ إضافة عقار جديد'}</h2>
                <button
                  type="button"
                  className="form-close-btn"
                  onClick={() => { setShowForm(false); setEditingProperty(null); }}
                >✕ إغلاق</button>
              </div>

              <form onSubmit={handleSubmit} className="property-form">
                {error && <div className="form-error" style={{ padding: '0.8rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca', fontWeight: 600 }}>⚠️ {error}</div>}
                {successMsg && <div className="form-success" style={{ padding: '0.8rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #a7f3d0', fontWeight: 600 }}>✨ {successMsg}</div>}

                {/* Section: Basic Info */}
                <div className="form-section">
                  <h3 className="form-section__title">📋 المعلومات الأساسية</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>عنوان العقار / الإعلان <span style={{ color: 'red' }}>*</span></label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="مثال: شقة سوبر لوكس للبيع في منشية البكري دور ثالث"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>نوع العقار</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      >
                        <option value="Apartment">شقة سكنية</option>
                        <option value="House">منزل / بيت مستقل</option>
                        <option value="Villa">فيلا</option>
                        <option value="Land">أرض فضاء / للبناء</option>
                        <option value="Shop">محل تجاري / إداري</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>نوع العرض</label>
                      <select
                        value={formData.listingType}
                        onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                      >
                        <option value="Sale">للبيع</option>
                        <option value="Rent">للإيجار</option>
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
                  </div>
                </div>

                {/* Land Specific Fields */}
                {formData.propertyType === 'Land' && (
                  <div className="form-section">
                    <h3 className="form-section__title">🌿 مواصفات وتراخيص الأرض</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>عرض الواجهة (متر)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.frontageWidth}
                          onChange={(e) => setFormData({ ...formData, frontageWidth: e.target.value })}
                          placeholder="مثال: 12.5"
                        />
                      </div>
                      <div className="form-group">
                        <label>عمق الواجهة / الطول (متر)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.frontageLength}
                          onChange={(e) => setFormData({ ...formData, frontageLength: e.target.value })}
                          placeholder="مثال: 20"
                        />
                      </div>
                      <div className="form-group">
                        <label>عرض الشارع أمام الأرض</label>
                        <input
                          type="text"
                          value={formData.streetWidth}
                          onChange={(e) => setFormData({ ...formData, streetWidth: e.target.value })}
                          placeholder="مثال: شارع 10 متر أو 12 متر"
                        />
                      </div>
                    </div>
                    <div className="checkbox-row" style={{ marginTop: '1rem' }}>
                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.hasBuildingLicense}
                          onChange={(e) => setFormData({ ...formData, hasBuildingLicense: e.target.checked })}
                        />
                        <span>📜 بها رخصة بناء معتمدة</span>
                      </label>
                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.hasElectricity}
                          onChange={(e) => setFormData({ ...formData, hasElectricity: e.target.checked })}
                        />
                        <span>⚡ واصل كهرباء</span>
                      </label>
                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.hasWater}
                          onChange={(e) => setFormData({ ...formData, hasWater: e.target.checked })}
                        />
                        <span>💧 واصل مياه</span>
                      </label>
                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.hasSewerage}
                          onChange={(e) => setFormData({ ...formData, hasSewerage: e.target.checked })}
                        />
                        <span>🚽 واصل صرف صحي</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* House / Villa Breakdown */}
                {formData.propertyType === 'House' && (
                  <div className="form-section">
                    <h3 className="form-section__title">🏠 مواصفات البيت المستقل والأدوار</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>عدد الأدوار الإجمالي</label>
                        <input
                          type="number"
                          value={formData.numberOfFloors}
                          onChange={(e) => setFormData({ ...formData, numberOfFloors: e.target.value })}
                          placeholder="مثال: 4"
                        />
                      </div>
                      <div className="form-group">
                        <label>عدد الشقق بكل دور</label>
                        <input
                          type="number"
                          value={formData.apartmentsPerFloor}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, apartmentsPerFloor: val });
                            if (floors.length > 0) syncHouseApartmentCounts(floors, val);
                          }}
                          placeholder="مثال: 1 أو 2"
                        />
                      </div>
                      <div className="form-group">
                        <label>شقق متشطبة</label>
                        <input
                          type="number"
                          value={formData.finishedApartments}
                          onChange={(e) => setFormData({ ...formData, finishedApartments: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>شقق نص تشطيب</label>
                        <input
                          type="number"
                          value={formData.semiFinishedApartments}
                          onChange={(e) => setFormData({ ...formData, semiFinishedApartments: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>شقق عظم</label>
                        <input
                          type="number"
                          value={formData.coreShellApartments}
                          onChange={(e) => setFormData({ ...formData, coreShellApartments: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: Floor Management for Apartments */}
                {formData.propertyType === 'Apartment' && (
                  <div className="form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 className="form-section__title" style={{ margin: 0 }}>🏢 إدارة الأدوار والوحدات</h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn-secondary" onClick={addFloor}>
                          ＋ إضافة دور
                        </button>
                        <button type="button" className="btn-secondary" onClick={duplicateLastFloor}>
                          📋 تكرار الدور الأخير
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setFloorViewMode(floorViewMode === 'cards' ? 'table' : 'cards')}
                        >
                          {floorViewMode === 'cards' ? '📊 عرض جدول' : '🃏 عرض بطاقات'}
                        </button>
                      </div>
                    </div>

                    {/* Bulk Floor Generator */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e3a8a', marginBottom: '8px' }}>
                        ⚡ مولّد الأدوار السريع:
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <span>من:</span>
                          <input
                            type="number"
                            value={bulkFromFloor}
                            onChange={(e) => setBulkFromFloor(e.target.value)}
                            style={{ width: '60px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <span>إلى:</span>
                          <input
                            type="number"
                            value={bulkToFloor}
                            onChange={(e) => setBulkToFloor(e.target.value)}
                            style={{ width: '60px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <span>التشطيب:</span>
                          <select
                            value={bulkFinishing}
                            onChange={(e) => setBulkFinishing(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          >
                            {FINISHING_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <span>المساحة:</span>
                          <input
                            type="number"
                            value={bulkArea}
                            onChange={(e) => setBulkArea(e.target.value)}
                            placeholder="م²"
                            style={{ width: '60px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <span>غرف:</span>
                          <input
                            type="number"
                            value={bulkBedrooms}
                            onChange={(e) => setBulkBedrooms(e.target.value)}
                            placeholder="3"
                            style={{ width: '50px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <span>حمامات:</span>
                          <input
                            type="number"
                            value={bulkBathrooms}
                            onChange={(e) => setBulkBathrooms(e.target.value)}
                            placeholder="1"
                            style={{ width: '50px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddBulkFloors}
                          style={{
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.84rem'
                          }}
                        >
                          إضافة دفعة واحدة
                        </button>
                      </div>
                    </div>

                    {floors.length === 0 ? (
                      <div className="no-floors-box">
                        <span>🏢</span>
                        <p>لم يتم تحديد أدوار منفصلة. يرجى تحديد سعر الكاش وسعر التقسيط العام للعقار أدناه:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', maxWidth: '600px', margin: '14px auto 0' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label>سعر الكاش (جنيه)</label>
                            <input
                              type="number"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label>سعر التقسيط (جنيه)</label>
                            <input
                              type="number"
                              value={formData.installmentPrice}
                              onChange={(e) => setFormData({ ...formData, installmentPrice: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="floors-cards-list">
                        {floors.map((floor, index) => (
                          <div key={index} className="floor-card">
                            <div className="floor-card__header">
                              <input
                                type="text"
                                className="floor-card__name-input"
                                value={floor.floorName ?? `الدور ${floor.floorNumber ?? index + 1}`}
                                onChange={(e) => updateFloor(index, { floorName: e.target.value })}
                                placeholder={`الدور ${index + 1}`}
                              />
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button type="button" className="btn-icon" onClick={() => duplicateFloor(index)} title="تكرار الدور">
                                  📋
                                </button>
                                <button type="button" className="btn-icon btn-icon--del" onClick={() => removeFloor(index)} title="حذف الدور">
                                  ✕
                                </button>
                              </div>
                            </div>
                            <div className="floor-card__grid">
                              <div className="floor-field">
                                <label>سعر الكاش (جنيه)</label>
                                <input
                                  type="number"
                                  value={floor.price ?? ''}
                                  placeholder="0"
                                  onChange={(e) => updateFloor(index, { price: e.target.value ? parseFloat(e.target.value) : null })}
                                />
                              </div>
                              <div className="floor-field">
                                <label>سعر التقسيط (جنيه)</label>
                                <input
                                  type="number"
                                  value={floor.installmentPrice ?? ''}
                                  placeholder="0"
                                  onChange={(e) => updateFloor(index, { installmentPrice: e.target.value ? parseFloat(e.target.value) : null })}
                                />
                              </div>
                              <div className="floor-field">
                                <label>المساحة (م²)</label>
                                <input
                                  type="number"
                                  value={floor.areaSqm ?? ''}
                                  placeholder={formData.areaSqm || 'م²'}
                                  onChange={(e) => updateFloor(index, { areaSqm: e.target.value ? parseFloat(e.target.value) : null })}
                                />
                              </div>
                              <div className="floor-field">
                                <label>التشطيب</label>
                                <select
                                  value={floor.finishingStatus ?? 'Core-Shell'}
                                  onChange={(e) => updateFloor(index, { finishingStatus: e.target.value })}
                                >
                                  {FINISHING_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section: Location & Address */}
                <div className="form-section">
                  <h3 className="form-section__title">📍 الموقع والعنوان</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>المدينة</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="المحلة الكبرى"
                      />
                    </div>

                    <div className="form-group">
                      <label>الحي / المنطقة</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="مثال: منشية البكري، الشعبية، شكري القوتلي"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>العنوان والشارع</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="مثال: شارع عبد الحي شاهين متفرع من شارع الجمهورية"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>العنوان التفصيلي / علامة مميزة</label>
                      <input
                        type="text"
                        value={formData.detailedAddress}
                        onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                        placeholder="مثال: بجوار مسجد السلام - عمارة الأمل"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Specifications */}
                {formData.propertyType !== 'Land' && (
                  <div className="form-section">
                    <h3 className="form-section__title">📐 المواصفات والمساحة العامة</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>المساحة الإجمالية (م²)</label>
                        <input
                          type="number"
                          value={formData.areaSqm}
                          onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                          placeholder="مثال: 135"
                        />
                      </div>

                      {formData.propertyType !== 'House' && (
                        <>
                          <div className="form-group">
                            <label>عدد الغرف</label>
                            <input
                              type="number"
                              value={formData.bedrooms}
                              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                              placeholder="3"
                            />
                          </div>

                          <div className="form-group">
                            <label>عدد الحمامات</label>
                            <input
                              type="number"
                              value={formData.bathrooms}
                              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                              placeholder="1"
                            />
                          </div>

                          <div className="form-group">
                            <label>نوع التشطيب العام</label>
                            <select
                              value={formData.finishingStatus}
                              onChange={(e) => setFormData({ ...formData, finishingStatus: e.target.value })}
                            >
                              {FINISHING_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Section: Utilities & Meters */}
                {formData.propertyType !== 'Land' && (
                  <div className="form-section">
                    <h3 className="form-section__title">💧⚡ العدادات والمرافق</h3>
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
                )}

                {/* Section: Description & Media Upload */}
                <div className="form-section">
                  <h3 className="form-section__title">📝 الوصف والوسائط</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>وصف العقار ومميزاته</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="اكتب وصفاً جذاباً وشاملاً للعقار، الشوارع المحيطة، المرافق، وتفاصيل السندات..."
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>إرفاق الصور والفيديوهات</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                          id="my-prop-media"
                          className="file-upload-input"
                        />
                        <label htmlFor="my-prop-media" className="file-upload-label">
                          <span>📁</span>
                          {mediaFiles.length > 0
                            ? `${mediaFiles.length} ملف تم اختياره`
                            : 'اضغط لاختيار صور أو فيديو للوحدة'}
                        </label>
                      </div>
                      {uploading && <p className="uploading">⏳ جاري رفع الوسائط وحفظها...</p>}
                    </div>
                  </div>
                </div>

                {/* Section: Options */}
                <div className="form-section">
                  <h3 className="form-section__title">⚙️ خيارات إضافية</h3>
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

                    {formData.propertyType !== 'Land' && (
                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.isUnderConstruction}
                          onChange={(e) => setFormData({ ...formData, isUnderConstruction: e.target.checked })}
                        />
                        <span className="checkbox-card__icon">🏗️</span>
                        <span>تحت الإنشاء</span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-save">
                    {loading ? (
                      <><span className="btn-spinner" /> جاري الحفظ...</>
                    ) : editingProperty ? '💾 تحديث العقار' : '➕ إضافة العقار واعتماده'}
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
            /* ── Properties List Matching Admin Panel ── */
            <div className="properties-section">
              <div className="properties-section__header">
                <h2>عقاراتي</h2>
                <div className="filter-tabs">
                  <button
                    className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    الكل ({stats.total})
                  </button>
                  <button
                    className={`filter-tab ${activeTab === 'published' ? 'active' : ''}`}
                    onClick={() => setActiveTab('published')}
                  >
                    معتمدة ومنشورة ({stats.published})
                  </button>
                  <button
                    className={`filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                    style={stats.pending > 0 ? { borderColor: '#f59e0b', color: '#d97706', fontWeight: 800 } : {}}
                  >
                    ⏳ قيد الاعتماد ({stats.pending})
                  </button>
                </div>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="empty-admin">
                  <span>🏠</span>
                  <p>لا توجد عقارات في هذه الفئة</p>
                  <button className="admin-add-btn" onClick={openAddForm}>＋ إضافة أول عقار</button>
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
                            src={property.primaryImageUrl || getPropertyPlaceholder(property.propertyType)}
                            alt={property.title ?? ''}
                          />
                        )}
                        <div className="property-image__badges">
                          {property.listingType && (
                            <span className={`admin-badge admin-badge--${property.listingType.toLowerCase()}`}>
                              {property.listingType === 'Sale' ? 'بيع' : 'إيجار'}
                            </span>
                          )}
                          {property.isUnderConstruction && (
                            <span className="admin-badge admin-badge--underconstruction">🏗️ تحت الإنشاء</span>
                          )}
                        </div>
                      </div>

                      <div className="property-info">
                        <h3>{property.title || 'غير محدد'}</h3>

                        {(() => {
                          const availableFloors = property.floors && property.floors.length > 0
                            ? property.floors.filter(f => f.isAvailable !== false)
                            : [];

                          const cashPrices = availableFloors
                            .map(f => f.price)
                            .filter((pr): pr is number => pr != null && pr > 0);

                          const installmentPrices = availableFloors
                            .map(f => f.installmentPrice)
                            .filter((pr): pr is number => pr != null && pr > 0);

                          if (cashPrices.length > 0 || installmentPrices.length > 0) {
                            const minCash = cashPrices.length > 0 ? Math.min(...cashPrices) : null;
                            const maxCash = cashPrices.length > 0 ? Math.max(...cashPrices) : null;
                            const minInst = installmentPrices.length > 0 ? Math.min(...installmentPrices) : null;
                            const maxInst = installmentPrices.length > 0 ? Math.max(...installmentPrices) : null;

                            const formatPrice = (min: number | null, max: number | null) => {
                              if (min == null) return null;
                              if (max == null || min === max) return `${min.toLocaleString('ar-EG')} جنيه`;
                              return `يبدأ من ${min.toLocaleString('ar-EG')} جنيه`;
                            };

                            return (
                              <p className="price">
                                {minCash != null ? (
                                  <span>{formatPrice(minCash, maxCash)}</span>
                                ) : (
                                  <span>السعر غير محدد</span>
                                )}
                                {minInst != null && (
                                  <span style={{ fontSize: '0.82rem', color: 'var(--clr-gold)', display: 'block', marginTop: '0.15rem' }}>
                                    💳 تقسيط: {formatPrice(minInst, maxInst)}
                                  </span>
                                )}
                              </p>
                            );
                          }

                          return (
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
                          );
                        })()}

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
                          <span
                            className={`admin-badge ${property.isPublished ? 'admin-badge--available' : 'admin-badge--sold'}`}
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              background: property.isPublished ? '#ecfdf5' : '#fef3c7',
                              color: property.isPublished ? '#047857' : '#b45309',
                              border: `1px solid ${property.isPublished ? '#a7f3d0' : '#fde68a'}`
                            }}
                          >
                            {property.isPublished ? '✅ معتمد ومنشور' : '⏳ قيد مراجعة واعتماد الإدارة'}
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
        <button className="admin-fab" onClick={openAddForm} aria-label="إضافة عقار جديد">
          ＋
        </button>
      )}
    </div>
  );
}
