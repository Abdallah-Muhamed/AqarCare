import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminPanelPage.css';
import './MyPropertiesPage.css';
import { api, getStoredUser, getAuthToken, clearAuth } from '../api';
import type { PropertyFloor, PropertyListItem } from '../types';
import { formatFloorsText, parseMultiFloorNumbers, formatFloorsFinishingSummary } from '../utils/formatters';
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
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'sold' | 'pending'>('all');
  const [floorViewMode, setFloorViewMode] = useState<'cards' | 'table'>('cards');
  const [showCommissionModal, setShowCommissionModal] = useState(false);

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
    isPublished: false,
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
      console.warn('Could not load customer properties:', err);
      setProperties([]);
      if (err.statusCode !== 401) {
        setError(err.message || 'تعذر تحميل عقاراتك. يرجى إعادة المحاولة.');
      }
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

      // Effective area for this floor (fallback to general area)
      const effectiveArea = (updated.areaSqm && updated.areaSqm > 0)
        ? updated.areaSqm
        : (formData.areaSqm ? parseFloat(formData.areaSqm) : 0);

      // If price (cash) was updated
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
      }
      // If installmentPrice was updated
      else if ('installmentPrice' in patch) {
        if (!updated.price && updated.installmentPrice && effectiveArea > 0) {
          updated.pricePerMeter = Math.round(updated.installmentPrice / effectiveArea);
        } else if (!updated.price && !updated.installmentPrice) {
          updated.pricePerMeter = null;
        }
      }
      // If pricePerMeter was updated
      else if ('pricePerMeter' in patch) {
        if (updated.pricePerMeter && effectiveArea > 0) {
          if (!updated.price && updated.installmentPrice) {
            updated.installmentPrice = Math.round(updated.pricePerMeter * effectiveArea);
          } else {
            updated.price = Math.round(updated.pricePerMeter * effectiveArea);
          }
        } else if (!updated.pricePerMeter) {
          if (!updated.price && updated.installmentPrice) {
            updated.installmentPrice = null;
          } else {
            updated.price = null;
          }
        }
      }
      // If areaSqm was updated
      else if ('areaSqm' in patch) {
        if (updated.areaSqm && updated.areaSqm > 0) {
          if (updated.pricePerMeter && updated.pricePerMeter > 0) {
            if (!updated.price && updated.installmentPrice) {
              updated.installmentPrice = Math.round(updated.pricePerMeter * updated.areaSqm);
            } else {
              updated.price = Math.round(updated.pricePerMeter * updated.areaSqm);
            }
          } else {
            const baseP = updated.price ?? updated.installmentPrice;
            if (baseP && baseP > 0) {
              updated.pricePerMeter = Math.round(baseP / updated.areaSqm);
            }
          }
        }
      }

      return updated;
    }));
  };

  const removeFloor = (index: number) => {
    setFloors(prev => {
      const nextFloors = prev.filter((_, i) => i !== index);
      if (formData.propertyType === 'House') {
        syncHouseApartmentCounts(nextFloors);
      }
      return nextFloors;
    });
  };

  const expandFloorIfMultiple = (index: number) => {
    setFloors(prev => {
      const target = prev[index];
      if (!target || !target.floorName) return prev;

      const detectedFloors = parseMultiFloorNumbers(target.floorName);
      if (detectedFloors.length <= 1) return prev;

      const newFloors: PropertyFloor[] = detectedFloors.map((floorNum, idx) => ({
        ...target,
        id: idx === 0 ? target.id : undefined,
        floorNumber: floorNum,
        floorName: `الدور ${floorNum}`,
        sortOrder: floorNum,
      }));

      setTimeout(() => {
        setSuccessMsg(`تم نسخ وتوزيع بيانات الدور تلقائياً على الأدوار (${detectedFloors.join('، ')})`);
      }, 50);

      return [
        ...prev.slice(0, index),
        ...newFloors,
        ...prev.slice(index + 1),
      ];
    });
  };

  // ── form handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) {
      // Trigger commission & marketing confirmation modal on Add
      setShowCommissionModal(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    setShowCommissionModal(false);
    setLoading(true);
    setError('');
    try {
      // Auto-expand any floor that has multi-floor notation (e.g. 2/3/4 or 2-4)
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
        isFeatured: false,
        isUnderConstruction: formData.propertyType === 'Land' ? false : formData.isUnderConstruction,
        isPublished: false, // Customers submissions are always unapproved until admin review
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
        setSuccessMsg('تم حفظ وتحديث العقار بنجاح! تم إرساله لمراجعة واعتماد الإدارة.');
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

  const closeForm = () => {
    setShowForm(false);
    setEditingProperty(null);
    navigate('/my-properties', { replace: true });
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
    const isHouseProp = property.propertyType === 'House';
    const isLandProp  = property.propertyType === 'Land';
    const isShopProp  = property.propertyType === 'Shop';

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
      isFeatured: false,
      isUnderConstruction: property.isUnderConstruction ?? false,
      isPublished: property.isPublished ?? false,
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

    const propArea = property.areaSqm;
    const propBedrooms = property.bedrooms;
    const propBathrooms = property.bathrooms;

    const mapFloorData = (f: PropertyFloor, index: number): PropertyFloor => ({
      ...f,
      areaSqm: f.areaSqm ?? propArea,
      bedrooms: isShopProp ? null : (f.bedrooms ?? propBedrooms),
      bathrooms: f.bathrooms ?? propBathrooms,
      finishingStatus: f.finishingStatus ?? (isHouseProp ? 'Ultra-Super-Lux' : property.finishingStatus),
      floorNumber: f.floorNumber ?? (property.floorNumber ?? index + 1),
      floorName: f.floorName || (f.floorNumber ? `الدور ${f.floorNumber}` : (property.floorNumber ? `الدور ${property.floorNumber}` : `الدور ${index + 1}`)),
      price: isHouseProp ? null : (f.price ?? property.price),
      installmentPrice: isHouseProp ? null : (f.installmentPrice ?? property.installmentPrice),
      pricePerMeter: isHouseProp ? null : (f.pricePerMeter ?? (
        (f.price ?? f.installmentPrice ?? property.price ?? property.installmentPrice) && (f.areaSqm ?? propArea)
          ? Math.round((f.price ?? f.installmentPrice ?? property.price ?? property.installmentPrice)! / (f.areaSqm ?? propArea)!)
          : null
      )),
      isAvailable: isHouseProp ? true : (f.isAvailable !== false),
      sortOrder: f.sortOrder ?? index,
    });

    if (isHouseProp || isLandProp || isShopProp) {
      setFloors([]);
    } else if (property.floors && property.floors.length > 0) {
      setFloors(property.floors.map(mapFloorData));
    } else {
      setFloors([{
        floorNumber: property.floorNumber ?? 1,
        floorName: property.floorNumber ? `الدور ${property.floorNumber}` : 'الدور 1',
        price: property.price,
        pricePerMeter: (property.price && property.areaSqm)
          ? Math.round(property.price / property.areaSqm)
          : ((property.installmentPrice && property.areaSqm) ? Math.round(property.installmentPrice / property.areaSqm) : null),
        installmentPrice: property.installmentPrice,
        soldPrice: null,
        areaSqm: property.areaSqm,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        isAvailable: property.status !== 'Sold',
        sortOrder: 0,
      }]);
    }

    try {
      const full = await api.getMyProperty(property.id);
      if (full) {
        setFormData(prev => ({
          ...prev,
          description: full.description || '',
          soldPrice: full.soldPrice?.toString() || '',
          installmentAvailable: full.installmentAvailable ?? prev.installmentAvailable,
          ...(isHouseProp ? {
            numberOfFloors: full.numberOfFloors?.toString() ?? prev.numberOfFloors,
            apartmentsPerFloor: full.apartmentsPerFloor?.toString() ?? prev.apartmentsPerFloor,
            finishedApartments: full.finishedApartments?.toString() ?? prev.finishedApartments,
            semiFinishedApartments: full.semiFinishedApartments?.toString() ?? prev.semiFinishedApartments,
            coreShellApartments: full.coreShellApartments?.toString() ?? prev.coreShellApartments,
          } : {}),
        }));
        if (!isHouseProp && !isLandProp && !isShopProp && full.floors && full.floors.length > 0) {
          setFloors(full.floors.map(mapFloorData));
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
      isFeatured: false,
      isUnderConstruction: false,
      isPublished: false,
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

  const handleLogout = () => {
    clearAuth();
    navigate('/');
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
    available: properties.filter(p => p.status === 'Available').length,
    sold: properties.filter(p => p.status === 'Sold').length,
    published: properties.filter(p => p.isPublished === true).length,
    pending: properties.filter(p => !p.isPublished).length,
    totalUnits: totalFloorUnits,
    totalSoldUnits: totalSoldUnits,
  };

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'available') return p.status === 'Available';
    if (activeTab === 'sold') return p.status === 'Sold' || p.status === 'Rented';
    if (activeTab === 'pending') return !p.isPublished;
    return true;
  });

  return (
    <div className="admin-panel">
      {/* ── Top Header Matching Admin Panel ── */}
      <header className="admin-header">
        <div className="admin-header__brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span className="admin-header__logo">🏠</span>
          <div>
            <h1>لوحة عقاراتي</h1>
            <span className="admin-header__sub">عقار كير — بوابة إدارة العقارات</span>
          </div>
        </div>

        <div className="portal-nav-tabs" style={{ display: 'flex', gap: '8px', marginInline: 'auto' }}>
          <button
            type="button"
            className={`filter-tab ${!showForm ? 'active' : ''}`}
            onClick={closeForm}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            🏢 عقاراتي
          </button>
          <button
            type="button"
            className={`filter-tab ${showForm ? 'active' : ''}`}
            onClick={openAddForm}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {editingProperty ? '✏️ تعديل عقار' : '➕ إضافة عقار'}
          </button>
          <button
            type="button"
            className="filter-tab"
            onClick={() => navigate('/my-inquiries')}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            📬 طلباتي
          </button>
          <button
            type="button"
            className="filter-tab"
            onClick={() => navigate('/properties')}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            🌐 تصفح العقارات
          </button>
        </div>

        <div className="admin-header__actions">
          {showForm ? (
            <button
              className="admin-add-btn"
              onClick={closeForm}
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--clr-text)', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <span>✕</span> إلغاء الإضافة
            </button>
          ) : (
            <button className="admin-add-btn" onClick={openAddForm}>
              <span>＋</span> إضافة عقار
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="logout-btn"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--clr-text)', borderColor: 'rgba(255,255,255,0.2)' }}
            title="العودة للصفحة الرئيسية للموقع"
          >
            🏠 الرئيسية
          </button>
          <button onClick={handleLogout} className="logout-btn">خروج ↩</button>
        </div>
      </header>

      <div className="admin-body">
        {/* ── Notice Banner (Executive Dark Slate & Gold) ── */}
        {!showForm && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.85) 0%, rgba(15,23,42,0.92) 100%)',
            border: '1px solid rgba(201,168,76,0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.88rem',
            color: 'var(--clr-text-muted)'
          }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🤝</span>
            <div style={{ lineHeight: '1.65' }}>
              <strong style={{ color: 'var(--clr-gold)' }}>تسويق العقار ونسبة العمولة (1.5%):</strong> نساعدك في تسويق عقارك وتنظيم مواعيد المعاينة مع المهتمين بالشراء والتنسيق معك أولاً بأول. لا توجد أي مصاريف مسبقة؛ العمولة هي <span style={{ color: '#fff', fontWeight: 800 }}>1.5% عند إتمام البيع فقط</span>. وتتم كافة الاتصالات عبر خدمة عملاء عقار كير (01055937687) لتنظيم المواعيد وتجنب الإزعاج.
            </div>
          </div>
        )}

        {/* ── Stats Dashboard Matching Admin Panel ── */}
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
            <div className="stat-card" style={{ borderColor: '#f59e0b', background: 'rgba(245,158,11,0.06)' }}>
              <div className="stat-card__icon">⏳</div>
              <div className="stat-card__val" style={{ color: '#d97706' }}>{stats.pending}</div>
              <div className="stat-card__lbl">قيد مراجعة واعتماد الإدارة</div>
            </div>
            <div className="stat-card stat-card--featured">
              <div className="stat-card__icon">⭐</div>
              <div className="stat-card__val">{stats.published}</div>
              <div className="stat-card__lbl">عقارات معتمدة ومنشورة</div>
            </div>
          </div>
        )}

        <div className="admin-content">
          {showForm ? (
            /* ── Property Form (100% Matching Admin Form) ── */
            <div className="property-form-container">
              <div className="form-header">
                <h2>{editingProperty ? '✏️ تعديل العقار' : '➕ إضافة عقار جديد'}</h2>
                <button
                  type="button"
                  className="form-close-btn"
                  onClick={closeForm}
                >✕ إغلاق</button>
              </div>

              {/* Owner Commission & Marketing Info Card inside form */}
              <div style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.86rem',
                color: 'var(--clr-text)',
                lineHeight: '1.6'
              }}>
                <span style={{ fontSize: '1.35rem', flexShrink: 0 }}>💼</span>
                <div>
                  <strong>خدمة تسويق العقار للملاك:</strong> بمجرد مراجعة واعتماد عقارك من الإدارة، نبدأ فوراً في خطة تسويقه وجلب المشترين الجادين وإدارة المعاينات. عمولتنا هي <strong>1.5% فقط عند إتمام البيع بنجاح</strong> دون أي رسوم مسبقة.
                </div>
              </div>

              <form onSubmit={handleSubmit} className="property-form">
                {error && <div className="form-error" style={{ padding: '0.8rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #fecaca', fontWeight: 600 }}>⚠️ {error}</div>}
                {successMsg && <div className="form-success" style={{ padding: '0.8rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #a7f3d0', fontWeight: 600 }}>✨ {successMsg}</div>}

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
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>النوع</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setFormData({
                            ...formData,
                            propertyType: newType,
                            ...(newType === 'Land' ? {
                              isUnderConstruction: false,
                              waterMeterAvailable: false,
                              electricityMeterAvailable: false,
                              gasMeterAvailable: false,
                              elevatorAvailable: false,
                              finishingStatus: '',
                              bedrooms: '',
                              bathrooms: '',
                              floorNumber: '',
                            } : {}),
                          });
                          if (newType === 'Land' || newType === 'Shop' || newType === 'House') {
                            setFloors([]);
                          } else if (floors.length === 0) {
                            setFloors([{
                              floorNumber: 1,
                              floorName: 'الدور 1',
                              price: null,
                              pricePerMeter: null,
                              installmentPrice: null,
                              soldPrice: null,
                              areaSqm: formData.areaSqm ? parseFloat(formData.areaSqm) : null,
                              bedrooms: null,
                              bathrooms: null,
                              isAvailable: true,
                              sortOrder: 0,
                            }]);
                          }
                        }}
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

                    {formData.propertyType !== 'House' && formData.propertyType !== 'Land' && (
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
                    )}

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

                    {formData.propertyType === 'Apartment' && (
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
                    )}

                    {formData.propertyType === 'House' && (
                      <div className="house-breakdown-box" style={{
                        gridColumn: 'span 2',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                        border: '1.5px solid #10b981',
                        borderRadius: '12px',
                        padding: '16px',
                        margin: '6px 0 10px',
                        boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #a7f3d0', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.25rem' }}>🏠</span>
                            <strong style={{ color: '#065f46', fontSize: '0.98rem' }}>مواصفات وتقسيم البيت:</strong>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#047857', background: '#d1fae5', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            لا يوجد تشطيب عام — يتم تحديد عدد الشقق حسب نوع التشطيب
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontWeight: 700, color: '#065f46', fontSize: '0.82rem' }}>🏢 عدد الأدوار *</label>
                            <input
                              type="number"
                              min="1"
                              value={formData.numberOfFloors}
                              onChange={(e) => setFormData({ ...formData, numberOfFloors: e.target.value })}
                              placeholder="مثال: 6"
                              style={{ background: '#fff', borderColor: '#6ee7b7', fontWeight: 700 }}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontWeight: 700, color: '#065f46', fontSize: '0.82rem' }}>🚪 كم شقة في الدور</label>
                            <input
                              type="number"
                              min="1"
                              value={formData.apartmentsPerFloor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData({ ...formData, apartmentsPerFloor: val });
                                if (floors.length > 0) {
                                  syncHouseApartmentCounts(floors, val);
                                }
                              }}
                              placeholder="مثال: 1"
                              style={{ background: '#fff', borderColor: '#6ee7b7', fontWeight: 700 }}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontWeight: 700, color: '#047857', fontSize: '0.82rem' }}>✨ عدد الشقق المتشطبة</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.finishedApartments}
                              onChange={(e) => setFormData({ ...formData, finishedApartments: e.target.value })}
                              placeholder="مثال: 3"
                              style={{ background: '#fff', borderColor: '#6ee7b7', fontWeight: 700 }}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontWeight: 700, color: '#b45309', fontSize: '0.82rem' }}>🧱 عدد الشقق النص تشطيب</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.semiFinishedApartments}
                              onChange={(e) => setFormData({ ...formData, semiFinishedApartments: e.target.value })}
                              placeholder="مثال: 3"
                              style={{ background: '#fff', borderColor: '#fcd34d', fontWeight: 700 }}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontWeight: 700, color: '#475569', fontSize: '0.82rem' }}>🏗️ عدد الشقق العظم</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.coreShellApartments}
                              onChange={(e) => setFormData({ ...formData, coreShellApartments: e.target.value })}
                              placeholder="مثال: 0"
                              style={{ background: '#fff', borderColor: '#cbd5e1', fontWeight: 700 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* General Price & Area for House, Land, and Shop */}
                    {(formData.propertyType === 'House' || formData.propertyType === 'Land' || formData.propertyType === 'Shop') && (
                      <>
                        <div className="form-group">
                          <label>
                            {formData.propertyType === 'House' ? 'سعر البيت كاش (جنيه) *' :
                             formData.propertyType === 'Land' ? 'سعر الأرض كاش (جنيه) *' :
                             'سعر المحل كاش (جنيه) *'}
                          </label>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>سعر التقسيط (جنيه)</label>
                          <input
                            type="number"
                            value={formData.installmentPrice}
                            onChange={(e) => setFormData({ ...formData, installmentPrice: e.target.value })}
                            placeholder="0 (اختياري)"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            {formData.propertyType === 'House' ? 'المساحة الإجمالية للبيت (م²) *' :
                             formData.propertyType === 'Land' ? 'مساحة الأرض (م²) *' :
                             'مساحة المحل (م²) *'}
                          </label>
                          <input
                            type="number"
                            value={formData.areaSqm}
                            onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                            placeholder="مثال: 150"
                            required
                          />
                        </div>

                        {formData.propertyType === 'Land' && (
                          <>
                            <div className="form-group" style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                              <label style={{ color: '#0f172a', fontWeight: 800 }}>
                                📏 طول الواجهة (متر) *
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={formData.frontageLength}
                                onChange={(e) => setFormData({ ...formData, frontageLength: e.target.value })}
                                placeholder="مثال: 12"
                                required
                                style={{ background: '#fff', borderColor: '#94a3b8', fontWeight: 700 }}
                              />
                              <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                طول واجهة الأرض على الشارع بالمتر (معلومة أساسية للأراضي).
                              </small>
                            </div>

                            <div className="form-group">
                              <label>عرض الشارع (متر)</label>
                              <input
                                type="text"
                                value={formData.streetWidth}
                                onChange={(e) => setFormData({ ...formData, streetWidth: e.target.value })}
                                placeholder="مثال: 10 متر أو شارع 8 متر"
                              />
                            </div>

                            <div className="form-group">
                              <label>عرض / عمق الأرض (متر اختياري)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={formData.frontageWidth}
                                onChange={(e) => setFormData({ ...formData, frontageWidth: e.target.value })}
                                placeholder="مثال: 15"
                              />
                            </div>
                          </>
                        )}

                        {formData.propertyType === 'Shop' && (
                          <div className="form-group">
                            <label>الحمامات (اختياري)</label>
                            <input
                              type="number"
                              value={formData.bathrooms}
                              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Section: Floors & Pricing */}
                {formData.propertyType !== 'House' && formData.propertyType !== 'Land' && formData.propertyType !== 'Shop' && (
                  <div className="form-section">
                    <div className="form-section__header-row">
                      <div>
                        <h3 className="form-section__title">
                          🏢 الأدوار والأسعار وسعر المتر
                        </h3>
                        <p className="form-section__sub">
                          حدد بيانات وأسعار كل دور على حدة مع الحساب التلقائي لسعر الكاش أو سعر المتر، وتمييز حالة الدور (متاح 🟢 أو مباع 🔴).
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {floors.length > 0 && (
                          <div className="floor-view-toggle">
                            <button
                              type="button"
                              className={`floor-view-btn ${floorViewMode === 'cards' ? 'active' : ''}`}
                              onClick={() => setFloorViewMode('cards')}
                              title="عرض بطاقات تفصيلي بدون سكرول أفقي"
                            >
                              🗂️ بطاقات (مريح)
                            </button>
                            <button
                              type="button"
                              className={`floor-view-btn ${floorViewMode === 'table' ? 'active' : ''}`}
                              onClick={() => setFloorViewMode('table')}
                              title="عرض جدول مضغوط"
                            >
                              📊 جدول
                            </button>
                          </div>
                        )}
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
                            title="إضافة دور جديد بنفس مواصفات الدور السابق لتوفير الوقت"
                          >
                            <span>📋</span> تكرار بيانات الدور الأخير
                          </button>
                        )}
                      </div>
                    </div>

                    {floors.length > 0 && (() => {
                      const floorCash = floors.map(f => f.price).filter((p): p is number => p != null && p > 0);
                      const floorInst = floors.map(f => f.installmentPrice).filter((p): p is number => p != null && p > 0);
                      const minCash = floorCash.length > 0 ? Math.min(...floorCash) : null;
                      const maxCash = floorCash.length > 0 ? Math.max(...floorCash) : null;
                      const minInst = floorInst.length > 0 ? Math.min(...floorInst) : null;
                      const maxInst = floorInst.length > 0 ? Math.max(...floorInst) : null;
                      return (
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', margin: '10px 0 16px', padding: '10px 16px', background: 'rgba(45,74,62,0.06)', border: '1px solid rgba(45,74,62,0.16)', borderRadius: '10px', fontSize: '0.9rem', alignItems: 'center' }}>
                          <span style={{ color: '#182821', fontWeight: 700 }}>
                            💵 سعر الكاش: <span style={{ color: '#047857', fontSize: '1.05rem', fontWeight: 900 }}>{minCash != null ? (minCash === maxCash ? `${minCash.toLocaleString('ar-EG')} جنيه` : `يبدأ من ${minCash.toLocaleString('ar-EG')} جنيه`) : 'غير محدد'}</span>
                          </span>
                          <span style={{ color: '#1e40af', fontWeight: 700 }}>
                            💳 سعر التقسيط: <span style={{ color: '#2563eb', fontSize: '1.05rem', fontWeight: 900 }}>{minInst != null ? (minInst === maxInst ? `${minInst.toLocaleString('ar-EG')} جنيه` : `يبدأ من ${minInst.toLocaleString('ar-EG')} جنيه`) : 'غير محدد'}</span>
                          </span>
                        </div>
                      );
                    })()}

                    {/* ── Bulk Multi-Floor Generator (One-Shot Entry) ── */}
                    <div className="bulk-floor-generator" style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                      border: '1.5px dashed #059669',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      margin: '10px 0 16px',
                      boxShadow: '0 2px 8px rgba(5,150,105,0.06)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.25rem' }}>⚡</span>
                          <strong style={{ color: '#065f46', fontSize: '0.96rem' }}>إضافة مجموعة أدوار دفعة واحدة (إدخال سريع):</strong>
                          <span style={{ fontSize: '0.8rem', color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            أدخل نطاق الأدوار والتشطيب لإضافتهم دفعة واحدة بضغطة زر
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>من الدور</label>
                          <input
                            type="number"
                            min="0"
                            value={bulkFromFloor}
                            onChange={(e) => setBulkFromFloor(e.target.value)}
                            className="floor-input"
                            style={{ background: '#fff', borderColor: '#a7f3d0', fontWeight: 700 }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>إلى الدور</label>
                          <input
                            type="number"
                            min="0"
                            value={bulkToFloor}
                            onChange={(e) => setBulkToFloor(e.target.value)}
                            className="floor-input"
                            style={{ background: '#fff', borderColor: '#a7f3d0', fontWeight: 700 }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0, minWidth: '145px' }}>
                          <label style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>تشطيب هذه الأدوار</label>
                          <select
                            value={bulkFinishing}
                            onChange={(e) => setBulkFinishing(e.target.value)}
                            className="floor-input"
                            style={{ background: '#fff', borderColor: '#a7f3d0', fontWeight: 700, color: '#065f46' }}
                          >
                            {FINISHING_OPTIONS.filter(o => o.value !== 'Mixed').map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>المساحة (م²)</label>
                          <input
                            type="number"
                            value={bulkArea}
                            placeholder={formData.areaSqm || '0'}
                            onChange={(e) => setBulkArea(e.target.value)}
                            className="floor-input"
                            style={{ background: '#fff', borderColor: '#a7f3d0' }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>غرف النوم</label>
                          <input
                            type="number"
                            min="0"
                            value={bulkBedrooms}
                            placeholder={formData.bedrooms || '0'}
                            onChange={(e) => setBulkBedrooms(e.target.value)}
                            className="floor-input"
                            style={{ background: '#fff', borderColor: '#a7f3d0' }}
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>الحمامات</label>
                          <input
                            type="number"
                            min="0"
                            value={bulkBathrooms}
                            placeholder={formData.bathrooms || '0'}
                            onChange={(e) => setBulkBathrooms(e.target.value)}
                            className="floor-input"
                            style={{ background: '#fff', borderColor: '#a7f3d0' }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddBulkFloors}
                          style={{
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            height: '38px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
                          }}
                        >
                          <span>⚡</span> إضافة دفعة واحدة
                        </button>
                      </div>
                    </div>

                    {floors.some(f => Boolean(f.finishingStatus)) && (
                      <div style={{ margin: '6px 0 14px', padding: '9px 14px', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: '8px', fontSize: '0.88rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800 }}>🎨 ملخص تشطيب الأدوار المحسوب:</span>
                        <span style={{ background: '#fff', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, color: '#047857' }}>
                          {formatFloorsFinishingSummary(floors)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          (إجمالي {floors.length} أدوار)
                        </span>
                      </div>
                    )}

                    {floors.length === 0 ? (
                      <div className="no-floors-box">
                        <span>🏢</span>
                        <p>لم يتم إضافة أدوار بعد. يمكنك إما الضغط على "＋ إضافة دور" لتسعير كل دور على حدة، أو تحديد السعر العام للعقار أدناه:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', maxWidth: '600px', margin: '14px auto 0', textAlign: 'right' }}>
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
                    ) : floorViewMode === 'cards' ? (
                      /* ── Responsive Floor Cards Layout (No Horizontal Scroll) ── */
                      <div className="floors-cards-list">
                        {floors.map((floor, index) => (
                          <div key={index} className={`floor-card ${(!floor.isAvailable && formData.propertyType !== 'House') ? 'floor-card--sold' : ''}`}>
                            <div className="floor-card__header">
                              <div className="floor-card__title-wrap">
                                <span className="floor-card__badge">#{index + 1}</span>
                                <input
                                  type="text"
                                  value={floor.floorName ?? ''}
                                  placeholder={`الدور ${index + 1}`}
                                  onChange={(e) => {
                                    const digits = e.target.value.match(/\d+/);
                                    updateFloor(index, {
                                      floorName: e.target.value,
                                      floorNumber: digits ? parseInt(digits[0], 10) : (floor.floorNumber ?? index + 1)
                                    });
                                  }}
                                  onBlur={() => expandFloorIfMultiple(index)}
                                  className="floor-card__name-input"
                                  title="اسم أو مسمى الدور (يمكنك كتابة 2/3/4 لتكرار البيانات للأدوار تلقائياً)"
                                />
                                {parseMultiFloorNumbers(floor.floorName).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => expandFloorIfMultiple(index)}
                                    className="btn-expand-floors"
                                    title="انقر لنسخ وتوزيع البيانات على أدوار منفصلة تلقائياً"
                                  >
                                    ⚡ نسخ للأدوار ({parseMultiFloorNumbers(floor.floorName).length})
                                  </button>
                                )}
                              </div>

                              <div className="floor-card__header-actions">
                                {formData.propertyType !== 'House' && (
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
                                )}

                                <button
                                  type="button"
                                  onClick={() => duplicateFloor(index)}
                                  className="floor-card__btn-action"
                                  title="نسخ مواصفات هذا الدور في دور جديد"
                                >
                                  📋 نسخ
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeFloor(index)}
                                  className="floor-card__btn-action floor-card__btn-action--delete"
                                  title="حذف هذا الدور"
                                >
                                  ✕ حذف
                                </button>
                              </div>
                            </div>

                            <div className="floor-card__body">
                              <div className="floor-card__field">
                                <label>المساحة (م²)</label>
                                <input
                                  type="number"
                                  value={floor.areaSqm ?? ''}
                                  placeholder={formData.areaSqm || '0'}
                                  onChange={(e) => updateFloor(index, { areaSqm: e.target.value ? parseFloat(e.target.value) : null })}
                                  className="floor-input"
                                />
                              </div>

                              <div className="floor-card__field">
                                <label>غرف النوم</label>
                                <input
                                  type="number"
                                  value={floor.bedrooms ?? ''}
                                  placeholder="0"
                                  min="0"
                                  onChange={(e) => updateFloor(index, { bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                                  className="floor-input"
                                />
                              </div>

                              <div className="floor-card__field">
                                <label>الحمامات</label>
                                <input
                                  type="number"
                                  value={floor.bathrooms ?? ''}
                                  placeholder="0"
                                  min="0"
                                  onChange={(e) => updateFloor(index, { bathrooms: e.target.value ? parseInt(e.target.value) : null })}
                                  className="floor-input"
                                />
                              </div>

                              <div className="floor-card__field">
                                <label>تشطيب الدور</label>
                                <select
                                  value={floor.finishingStatus ?? ''}
                                  onChange={(e) => updateFloor(index, { finishingStatus: e.target.value || null })}
                                  className="floor-input"
                                  style={{ fontWeight: floor.finishingStatus ? 600 : 400 }}
                                >
                                  <option value="">-- اختياري --</option>
                                  {FINISHING_OPTIONS.filter(o => o.value && o.value !== 'Mixed').map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {formData.propertyType !== 'House' && (
                                <>
                                  <div className="floor-card__field">
                                    <label>سعر المتر (جنيه)</label>
                                    <input
                                      type="number"
                                      value={floor.pricePerMeter ?? ''}
                                      placeholder="0"
                                      onChange={(e) => updateFloor(index, { pricePerMeter: e.target.value ? parseFloat(e.target.value) : null })}
                                      className="floor-input"
                                      title="يتم حساب سعر الكاش أو التقسيط تلقائياً بناءً على سعر المتر والمساحة"
                                    />
                                  </div>

                                  <div className="floor-card__field">
                                    <label>سعر الكاش (جنيه)</label>
                                    <input
                                      type="number"
                                      value={floor.price ?? ''}
                                      placeholder="0"
                                      onChange={(e) => updateFloor(index, { price: e.target.value ? parseFloat(e.target.value) : null })}
                                      className="floor-input"
                                      title="يتم حساب سعر المتر تلقائياً بناءً على سعر الكاش والمساحة"
                                    />
                                  </div>

                                  <div className="floor-card__field">
                                    <label>سعر التقسيط (جنيه)</label>
                                    <input
                                      type="number"
                                      value={floor.installmentPrice ?? ''}
                                      placeholder="0"
                                      onChange={(e) => updateFloor(index, { installmentPrice: e.target.value ? parseFloat(e.target.value) : null })}
                                      className="floor-input"
                                      title="في حال عدم وجود سعر كاش، يتم حساب سعر المتر تلقائياً بناءً على سعر التقسيط والمساحة"
                                    />
                                  </div>

                                  {!floor.isAvailable && (
                                    <div className="floor-card__field floor-card__field--sold-price">
                                      <label style={{ color: '#ef4444', fontWeight: 700 }}>سعر البيع الفعلي</label>
                                      <input
                                        type="number"
                                        value={floor.soldPrice ?? ''}
                                        placeholder="سعر البيع الفعلي"
                                        onChange={(e) => updateFloor(index, { soldPrice: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="floor-input"
                                        style={{ borderColor: '#ef4444', background: '#fef2f2', color: '#b91c1c', fontWeight: 700 }}
                                        title="أدخل سعر البيع الفعلي الذي تم الاتفاق عليه لهذا الدور"
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* ── Classic Table Layout ── */
                      <div className="floors-table-container">
                        <table className="floors-table">
                          <thead>
                            <tr>
                              <th>الدور / الاسم</th>
                              <th>المساحة (م²)</th>
                              <th>غرف النوم</th>
                              <th>الحمامات</th>
                              <th>التشطيب</th>
                              {formData.propertyType !== 'House' && (
                                <>
                                  <th>سعر المتر (جنيه)</th>
                                  <th>سعر الكاش (جنيه)</th>
                                  <th>سعر التقسيط (جنيه)</th>
                                  <th style={{ minWidth: '115px', textAlign: 'center' }}>الحالة</th>
                                  <th style={{ minWidth: '120px', textAlign: 'center' }}>سعر البيع الفعلي</th>
                                </>
                              )}
                              <th style={{ textAlign: 'center' }}>حذف</th>
                            </tr>
                          </thead>
                          <tbody>
                            {floors.map((floor, index) => (
                              <tr key={index} className={(!floor.isAvailable && formData.propertyType !== 'House') ? 'floor-row--sold' : ''}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                      type="text"
                                      value={floor.floorName ?? ''}
                                      placeholder={`الدور ${index + 1}`}
                                      onChange={(e) => {
                                        const digits = e.target.value.match(/\d+/);
                                        updateFloor(index, {
                                          floorName: e.target.value,
                                          floorNumber: digits ? parseInt(digits[0], 10) : (floor.floorNumber ?? index + 1)
                                        });
                                      }}
                                      onBlur={() => expandFloorIfMultiple(index)}
                                      className="floor-input"
                                      title="اسم أو مسمى الدور"
                                    />
                                  </div>
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
                                  <select
                                    value={floor.finishingStatus ?? ''}
                                    onChange={(e) => updateFloor(index, { finishingStatus: e.target.value || null })}
                                    className="floor-input"
                                    style={{ minWidth: '110px', fontSize: '12px' }}
                                  >
                                    <option value="">-- اختياري --</option>
                                    {FINISHING_OPTIONS.filter(o => o.value && o.value !== 'Mixed').map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                {formData.propertyType !== 'House' && (
                                  <>
                                    <td>
                                      <input
                                        type="number"
                                        value={floor.pricePerMeter ?? ''}
                                        placeholder="0"
                                        onChange={(e) => updateFloor(index, { pricePerMeter: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="floor-input"
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        value={floor.price ?? ''}
                                        placeholder="0"
                                        onChange={(e) => updateFloor(index, { price: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="floor-input"
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
                                        />
                                      ) : (
                                        <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>—</span>
                                      )}
                                    </td>
                                  </>
                                )}
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
                )}

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
                        placeholder="مثال: برج الصفوة، أمام مسجد البكري"
                      />
                      <small style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                        يظهر هذا العنوان كاملاً على كارت العقار وصفحة التفاصيل لتوجيه العملاء بدقة.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Section: Utilities & Services */}
                <div className="form-section">
                  <h3 className="form-section__title">
                    {formData.propertyType === 'Land' ? '📜 الترخيص والمرافق' : '🛠️ الخدمات'}
                  </h3>
                  {formData.propertyType === 'Land' ? (
                    <div className="checkbox-row">
                      <label className="checkbox-card" style={{
                        borderColor: formData.hasBuildingLicense ? 'var(--clr-gold)' : undefined,
                        background: formData.hasBuildingLicense ? 'rgba(183,121,61,0.08)' : undefined,
                        fontWeight: 700,
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.hasBuildingLicense}
                          onChange={(e) => setFormData({ ...formData, hasBuildingLicense: e.target.checked })}
                        />
                        <span className="checkbox-card__icon">📜</span>
                        <span>يوجد رخصة بناء (مرخصة)</span>
                      </label>

                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.hasElectricity}
                          onChange={(e) => setFormData({ ...formData, hasElectricity: e.target.checked })}
                        />
                        <span className="checkbox-card__icon">⚡</span>
                        <span>دخول كهرباء</span>
                      </label>

                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.hasWater}
                          onChange={(e) => setFormData({ ...formData, hasWater: e.target.checked })}
                        />
                        <span className="checkbox-card__icon">💧</span>
                        <span>دخول مياه</span>
                      </label>

                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={formData.hasSewerage}
                          onChange={(e) => setFormData({ ...formData, hasSewerage: e.target.checked })}
                        />
                        <span className="checkbox-card__icon">🚽</span>
                        <span>شبكة صرف صحي</span>
                      </label>
                    </div>
                  ) : (
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
                  )}
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
                          id="customer-media-upload"
                          className="file-upload-input"
                        />
                        <label htmlFor="customer-media-upload" className="file-upload-label">
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

                {error && <p className="error-msg">⚠ {error}</p>}

                {/* Commission & Marketing Agreement Notice */}
                {!editingProperty && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.25) 0%, rgba(253, 230, 138, 0.15) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💼</span>
                    <div style={{ fontSize: '0.86rem', color: 'var(--clr-text)', lineHeight: '1.6' }}>
                      <strong style={{ color: 'var(--clr-gold)' }}>اتفاقية العمولة والتسويق:</strong> بالضغط على "اضافة"، أنت توافق على أن تتولى عقار كير تسويق عقارك وعرضه للمشترين، بعمولة <strong>1.5%</strong> تُستحق عند إتمام البيع فقط دون أي مصاريف مسبقة.
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-save">
                    {loading ? (
                      <><span className="btn-spinner" /> جاري الحفظ...</>
                    ) : editingProperty ? '💾 تحديث العقار' : 'اضافة (تأكيد العمولة 1.5%)'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeForm}
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
                    className={`filter-tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                  >
                    متاحة ({stats.available})
                  </button>
                  <button
                    className={`filter-tab ${activeTab === 'sold' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sold')}
                  >
                    مباعة/مؤجرة ({stats.sold})
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

                        {(property.propertyType === 'House' || property.propertyType === 'Villa') ? (
                          <div style={{ fontSize: '0.82rem', color: '#1e3a8a', background: 'rgba(37,99,235,0.06)', padding: '6px 10px', borderRadius: '6px', margin: '6px 0', lineHeight: 1.6 }}>
                            <div style={{ fontWeight: 700 }}>
                              🏢 {property.numberOfFloors ?? (property.floors?.length || '—')} أدوار 
                              {property.apartmentsPerFloor ? ` • 🚪 ${property.apartmentsPerFloor === 1 ? 'شقة بالدور' : `${property.apartmentsPerFloor} شقق بالدور`}` : ''}
                              {property.areaSqm ? ` • 📐 ${property.areaSqm} م²` : ''}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '3px', fontWeight: 700, fontSize: '0.78rem' }}>
                              {(property.finishedApartments ?? 0) > 0 && <span style={{ color: '#047857' }}>✨ {property.finishedApartments} متشطب</span>}
                              {(property.semiFinishedApartments ?? 0) > 0 && <span style={{ color: '#b45309' }}>🧱 {property.semiFinishedApartments} نص تشطيب</span>}
                              {(property.coreShellApartments ?? 0) > 0 && <span style={{ color: '#475569' }}>🏗️ {property.coreShellApartments} عظم</span>}
                            </div>
                          </div>
                        ) : (
                          <>
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
                          </>
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
                              background: property.isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: property.isPublished ? '#10b981' : '#f59e0b',
                              border: `1px solid ${property.isPublished ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
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

      {/* ── Commission & Marketing Agreement Confirmation Modal ── */}
      {showCommissionModal && (
        <div className="commission-modal-overlay" onClick={() => setShowCommissionModal(false)}>
          <div className="commission-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="commission-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem' }}>🤝</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-text)' }}>
                  تأكيد إضافة العقار والعمولة (1.5%)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCommissionModal(false)}
                className="form-close-btn"
                style={{ width: 32, height: 32, padding: 0 }}
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '12px 0' }}>
              <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--clr-text)', lineHeight: '1.7' }}>
                أهلاً بك يا <strong>{user?.fullName || 'عزيزي المالك'}</strong>، قبل إرسال عقارك <strong>"{formData.title || 'العقار'}"</strong> للاعتماد، يرجى تأكيد الشروط التالية:
              </p>

              <div style={{
                background: 'rgba(30, 41, 59, 0.04)',
                border: '1px solid var(--clr-border, #e2dacd)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.88rem',
                lineHeight: '1.6',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--clr-success, #10b981)', fontWeight: 800 }}>✓</span>
                  <div>
                    <strong>تسويق وتنظيم المعاينات:</strong> نتولى معاينة وتصوير العقار وعرضه على المنصة وإدارة المعاينات مع المهتمين بالتنسيق معك وتوفير وقتك.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--clr-gold)', fontWeight: 800 }}>✓</span>
                  <div>
                    <strong>عمولة 1.5% عند إتمام البيع فقط:</strong> لا توجد أي رسوم أو مصاريف مسبقة نهائياً؛ تبلغ عمولة عقار كير <strong>1.5%</strong> تُستحق فقط عند إتمام البيع واستلام مستحقاتك.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#3b82f6', fontWeight: 800 }}>✓</span>
                  <div>
                    <strong>حفظ الخصوصية:</strong> تواصل المشترين يتم عبر خدمة عملاء عقار كير (01055937687) لتنظيم المواعيد وتجنب الاتصالات غير الجادة.
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'center',
              }}>
                📢 العمولة: 1.5% من إجمالي سعر البيع الفعلي عند إتمام الصفقة فقط.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--clr-border, #e5dfd2)' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowCommissionModal(false)}
              >
                رجوع للنموذج
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={executeSave}
                disabled={loading}
                style={{ minWidth: '170px' }}
              >
                {loading ? 'جاري الإرسال...' : 'موافق، إرسال العقار'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <button className="admin-fab" onClick={openAddForm} aria-label="إضافة عقار">
          ＋
        </button>
      )}
    </div>
  );
}
