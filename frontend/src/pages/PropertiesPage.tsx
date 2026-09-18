import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search, Map, List, Check, RotateCcw, Sparkles } from 'lucide-react'
import { api } from '../api'
import type { PropertyListItem, PropertyQuery } from '../types'
import { setPageSeo } from '../utils/seo'
import { getTotalAvailableUnits } from '../utils/formatters'
import PropertyCard from '../components/PropertyCard'
import './PropertiesPage.css'

export function isNearFloor(p: PropertyListItem): boolean {
  // Only applies to apartments — not houses, shops, or land
  if (p.propertyType !== 'Apartment') return false

  const MAX_FLOOR = 7 // floors 0–7 are "below 8th floor"

  // If single-unit property with low floorNumber
  if (p.floorNumber != null && p.floorNumber <= MAX_FLOOR) return true

  // If property has floors array — check any available floor below 8
  if (p.floors && p.floors.length > 0) {
    const hasLow = p.floors.some(f => {
      if (f.isAvailable === false) return false
      if (f.floorNumber != null && f.floorNumber <= MAX_FLOOR) return true
      const name = (f.floorName || '').toLowerCase()
      // Text-based fallback for named floors
      return (
        name.includes('أرضي') ||
        name.includes('ارضي') ||
        name.includes('أول') ||
        name.includes('اول') ||
        name.includes('ثاني') ||
        name.includes('تاني') ||
        name.includes('ثالث') ||
        name.includes('تالت') ||
        name.includes('رابع') ||
        name.includes('تالت') ||
        name.includes('خامس') ||
        name.includes('سادس') ||
        name.includes('سابع') ||
        /^دور [1-7]$/.test(name.trim())
      )
    })
    if (hasLow) return true
  }

  // Fallback text check in title or address
  const text = `${p.title || ''} ${p.detailedAddress || ''} ${p.address || ''}`
  return (
    text.includes('أرضي') ||
    text.includes('ارضي') ||
    text.includes('دور أول') ||
    text.includes('دور اول') ||
    text.includes('دور ثاني') ||
    text.includes('دور تاني') ||
    text.includes('دور ثالث') ||
    text.includes('دور تالت') ||
    text.includes('دور رابع') ||
    text.includes('دور خامس') ||
    text.includes('دور سادس') ||
    text.includes('دور سابع')
  )
}

export function isFinished(p: PropertyListItem): boolean {
  if (p.propertyType === 'House' || p.propertyType === 'Villa') {
    return (p.finishedApartments ?? 0) > 0
  }
  if (!p.finishingStatus) return false
  return p.finishingStatus !== 'Core-Shell'
}

const CITIES = ['المحلة الكبرى', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الشروق', 'مدينة نصر', 'التجمع الخامس', 'أكتوبر']
const DISTRICTS = ['الشعبية', 'منشية البكري', 'الرجبي', 'شكري القوتلي', 'الجمهورية', 'الزهراء', 'الوابورات']
const PROP_TYPES = ['Apartment', 'House', 'Land', 'Shop']
const PROP_LABELS: Record<string, string> = { Apartment: 'شقة', House: 'منازل', Land: 'أرض', Shop: 'محل / تجاري' }
const LISTING_TYPES = [{ val: 'Sale', label: 'للبيع' }, { val: 'Rent', label: 'للإيجار' }]
const FINISHING_OPTS = [
  { val: 'Core-Shell',      label: 'بدون تشطيب (عظم)' },
  { val: 'Semi-Finished',   label: 'نصف تشطيب' },
  { val: 'Lux',             label: 'لوكس' },
  { val: 'Super-Lux',       label: 'سوبر لوكس' },
  { val: 'Ultra-Super-Lux', label: 'ألترا سوبر لوكس' },
  { val: 'High-Lux',        label: 'هاي لوكس' },
  { val: 'Mixed',           label: 'تشطيب متعدد' },
]
const SORT_OPTS = [
  { val: 'newest',     label: 'الأحدث أولاً' },
  { val: 'price_asc',  label: 'السعر: من الأقل للأعلى' },
  { val: 'price_desc', label: 'السعر: من الأعلى للأقل' },
  { val: 'area_desc',  label: 'المساحة: من الأكبر للأصغر' },
  { val: 'area_asc',   label: 'المساحة: من الأصغر للأكبر' },
]


export default function PropertiesPage() {
  const [searchParams] = useSearchParams()
  const [rawItems, setRawItems] = useState<PropertyListItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery]       = useState<PropertyQuery>({ sortBy: 'newest' })
  const setPage = (_?: number) => {}

  const [displayLimit, setDisplayLimit] = useState(24)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Synchronize initial query with URL search params
  useEffect(() => {
    const filter = searchParams.get('filter')
    const type = searchParams.get('type')
    const maxP = searchParams.get('maxPrice')

    if (filter || type || maxP) {
      setQuery(q => {
        const next = { ...q }
        if (filter === 'core-shell') {
          next.finishingStatus = 'Core-Shell'
          next.isFinished = undefined
        } else if (filter === 'finished') {
          next.isFinished = true
          next.finishingStatus = undefined
        } else if (filter === 'under-construction') {
          next.isUnderConstruction = true
        } else if (filter === 'ready') {
          next.isUnderConstruction = false
        } else if (filter === 'near-floor') {
          next.nearFloorOnly = true
        } else if (filter === 'under-1.5m') {
          next.maxPrice = 1500000
          next.minPrice = undefined
        } else if (filter === 'installment') {
          next.installmentAvailable = true
        } else if (filter === 'elevator') {
          next.elevatorAvailable = true
        }

        if (type) next.propertyType = type
        if (maxP) next.maxPrice = Number(maxP)
        if (filter === 'house' || filter === 'houses' || filter === 'manazel') {
          next.propertyType = 'House'
        }
        return next
      })
    }
  }, [searchParams])

  useEffect(() => {
    setPageSeo({
      title: 'عقارات للبيع والإيجار بالمحلة الكبرى ومنشية البكري | عقار كير',
      description: 'تصفح أحدث الشقق والأراضي والبيوت والمحلات المتاحة للبيع كاش وتقسيط في المحلة الكبرى ومنشية البكري مع أسعار دقيقة وتفاصيل كاملة.',
      url: 'https://aqar-care.vercel.app/properties',
    })
  }, [])

  // Fetch properties from backend
  const fetchProperties = useCallback(() => {
    setLoading(true)
    // Request all properties for instant client-side filtering
    api.getProperties({ pageSize: 10000 })
      .then(r => {
        setRawItems(r.items || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const set = (key: keyof PropertyQuery, val: string | number | boolean | undefined) => {
    setQuery(q => ({ ...q, [key]: val !== '' && val !== null ? val : undefined }))
    setPage(1)
  }

  const toggle = (key: keyof PropertyQuery) => {
    setQuery(q => ({ ...q, [key]: !q[key] ? true : undefined }))
    setPage(1)
  }

  const clearFilters = () => {
    setQuery({ sortBy: 'newest' })
    setPage(1)
  }

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (query.city) count++
    if (query.district) count++
    if (query.propertyType) count++
    if (query.listingType) count++
    if (query.finishingStatus) count++
    if (query.isFinished) count++
    if (query.nearFloorOnly) count++
    if (query.minPrice) count++
    if (query.maxPrice) count++
    if (query.minArea) count++
    if (query.maxArea) count++
    if (query.bedrooms) count++
    if (query.bathrooms) count++
    if (query.elevatorAvailable) count++
    if (query.installmentAvailable) count++
    if (query.isUnderConstruction != null) count++
    if (query.waterMeterAvailable) count++
    if (query.electricityMeterAvailable) count++
    if (query.gasMeterAvailable) count++
    if (query.search) count++
    if (query.sortBy && query.sortBy !== 'newest') count++
    return count
  }, [query])

  const hasFilters = activeFilterCount > 0

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return rawItems.filter(p => {
      // City
      if (query.city && p.city !== query.city) return false

      // District (checks district or address)
      if (query.district) {
        const matchesDistrict = p.district?.includes(query.district)
        const matchesAddress = p.address?.includes(query.district) || p.detailedAddress?.includes(query.district)
        if (!matchesDistrict && !matchesAddress) return false
      }

      // Property Type
      if (query.propertyType) {
        if (query.propertyType === 'House' && (p.propertyType === 'House' || p.propertyType === 'Villa')) {
          // match
        } else if (query.propertyType === 'Shop' && (p.propertyType === 'Shop' || p.propertyType === 'Commercial')) {
          // match
        } else if (p.propertyType !== query.propertyType) {
          return false
        }
      }

      // Listing Type
      if (query.listingType && p.listingType !== query.listingType) return false

      // Finishing Status
      if (query.finishingStatus) {
        if (p.propertyType === 'House' || p.propertyType === 'Villa') {
          if (query.finishingStatus === 'Core-Shell' && (p.coreShellApartments ?? 0) === 0) return false
          if (query.finishingStatus === 'Semi-Finished' && (p.semiFinishedApartments ?? 0) === 0) return false
          if ((query.finishingStatus === 'Ultra-Super-Lux' || query.finishingStatus === 'Super-Lux' || query.finishingStatus === 'Lux' || query.finishingStatus === 'Finished') && (p.finishedApartments ?? 0) === 0) return false
        } else if (p.finishingStatus !== query.finishingStatus) {
          return false
        }
      }
      if (query.isFinished && !isFinished(p)) return false

      // Near Floor (ground to 3rd floor)
      if (query.nearFloorOnly && !isNearFloor(p)) return false

      // Prices (checks property price and floor prices)
      const floorPrices = (p.floors || []).map(f => f.price).filter((pr): pr is number => pr != null && pr > 0)
      const minP = floorPrices.length > 0 ? Math.min(...floorPrices) : (p.price ?? 0)
      const maxP = floorPrices.length > 0 ? Math.max(...floorPrices) : (p.price ?? 0)

      if (query.minPrice != null && maxP < query.minPrice) return false
      if (query.maxPrice != null && minP > query.maxPrice) return false

      // Area (checks property area and floor areas)
      const floorAreas = (p.floors || []).map(f => f.areaSqm).filter((a): a is number => a != null && a > 0)
      const minA = floorAreas.length > 0 ? Math.min(...floorAreas) : (p.areaSqm ?? 0)
      const maxA = floorAreas.length > 0 ? Math.max(...floorAreas) : (p.areaSqm ?? 0)

      if (query.minArea != null && maxA < query.minArea) return false
      if (query.maxArea != null && minA > query.maxArea) return false

      // Bedrooms
      const floorBeds = (p.floors || []).map(f => f.bedrooms).filter((b): b is number => b != null && b > 0)
      const maxBeds = floorBeds.length > 0 ? Math.max(...floorBeds) : (p.bedrooms ?? 0)
      if (query.bedrooms != null && maxBeds < query.bedrooms) return false

      // Bathrooms
      const floorBaths = (p.floors || []).map(f => f.bathrooms).filter((b): b is number => b != null && b > 0)
      const maxBaths = floorBaths.length > 0 ? Math.max(...floorBaths) : (p.bathrooms ?? 0)
      if (query.bathrooms != null && maxBaths < query.bathrooms) return false

      // Amenities & Features
      if (query.elevatorAvailable && !p.elevatorAvailable) return false
      if (query.installmentAvailable) {
        const hasInst = Boolean(p.installmentAvailable || (p.installmentPrice != null && p.installmentPrice > 0) || (p.floors || []).some(f => f.installmentPrice != null && f.installmentPrice > 0))
        if (!hasInst) return false
      }
      if (query.waterMeterAvailable && !p.waterMeterAvailable) return false
      if (query.electricityMeterAvailable && !p.electricityMeterAvailable) return false
      if (query.gasMeterAvailable && !p.gasMeterAvailable) return false
      if (query.isUnderConstruction != null && p.isUnderConstruction !== query.isUnderConstruction) return false

      // Search keyword
      if (query.search && query.search.trim()) {
        const s = query.search.trim().toLowerCase()
        const matchTitle = p.title?.toLowerCase().includes(s)
        const matchAddr  = p.address?.toLowerCase().includes(s)
        const matchDet   = p.detailedAddress?.toLowerCase().includes(s)
        const matchDist  = p.district?.toLowerCase().includes(s)
        if (!matchTitle && !matchAddr && !matchDet && !matchDist) return false
      }

      return true
    }).sort((a, b) => {
      // Always place sold properties at the very bottom
      const isSoldA = a.status?.toLowerCase() === 'sold' || (a.floors && a.floors.length > 0 && a.floors.every(f => f.isAvailable === false))
      const isSoldB = b.status?.toLowerCase() === 'sold' || (b.floors && b.floors.length > 0 && b.floors.every(f => f.isAvailable === false))

      if (!isSoldA && isSoldB) return -1
      if (isSoldA && !isSoldB) return 1

      switch (query.sortBy) {
        case 'price_asc': {
          const pA = a.price ?? 0
          const pB = b.price ?? 0
          return pA - pB
        }
        case 'price_desc': {
          const pA = a.price ?? 0
          const pB = b.price ?? 0
          return pB - pA
        }
        case 'area_desc': {
          const aA = a.areaSqm ?? 0
          const aB = b.areaSqm ?? 0
          return aB - aA
        }
        case 'area_asc': {
          const aA = a.areaSqm ?? 0
          const aB = b.areaSqm ?? 0
          return aA - aB
        }
        default:
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return b.id - a.id
      }
    })
  }, [rawItems, query])

  const totalAvailableUnits = useMemo(() => getTotalAvailableUnits(filteredItems), [filteredItems])

  useEffect(() => {
    setDisplayLimit(24)
  }, [query])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setDisplayLimit(prev => Math.min(prev + 24, filteredItems.length))
        }
      },
      { rootMargin: '300px' }
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [filteredItems.length])

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayLimit)
  }, [filteredItems, displayLimit])

  // Pre-calculate counts for each filter suggestion based on raw dataset
  const suggestionCounts = useMemo(() => {
    return {
      coreShell: rawItems.filter(p => p.finishingStatus === 'Core-Shell').length,
      finished: rawItems.filter(isFinished).length,
      underConstruction: rawItems.filter(p => p.isUnderConstruction === true).length,
      readyToDeliver: rawItems.filter(p => p.isUnderConstruction === false).length,
      nearFloor: rawItems.filter(isNearFloor).length,
      under1500k: rawItems.filter(p => {
        const floorPrices = (p.floors || []).map(f => f.price).filter((pr): pr is number => pr != null && pr > 0)
        const minP = floorPrices.length > 0 ? Math.min(...floorPrices) : (p.price ?? 0)
        return minP > 0 && minP <= 1500000
      }).length,
      installment: rawItems.filter(p => Boolean(p.installmentAvailable || (p.installmentPrice != null && p.installmentPrice > 0) || (p.floors || []).some(f => f.installmentPrice != null && f.installmentPrice > 0))).length,
      elevator: rawItems.filter(p => p.elevatorAvailable).length,
      apartment: rawItems.filter(p => p.propertyType === 'Apartment').length,
      house: rawItems.filter(p => p.propertyType === 'House' || p.propertyType === 'Villa').length,
      land: rawItems.filter(p => p.propertyType === 'Land').length,
      shop: rawItems.filter(p => p.propertyType === 'Shop' || p.propertyType === 'Commercial').length,
    }
  }, [rawItems])

  const suggestions = useMemo(() => [
    {
      id: 'house',
      label: 'منازل',
      emoji: '🏠',
      count: suggestionCounts.house,
      isActive: query.propertyType === 'House',
      toggle: () => {
        setQuery(q => ({
          ...q,
          propertyType: q.propertyType === 'House' ? undefined : 'House',
        }))
        setPage(1)
      }
    },
    {
      id: 'apartment',
      label: 'شقق سكنية',
      emoji: '🏢',
      count: suggestionCounts.apartment,
      isActive: query.propertyType === 'Apartment',
      toggle: () => {
        setQuery(q => ({
          ...q,
          propertyType: q.propertyType === 'Apartment' ? undefined : 'Apartment',
        }))
        setPage(1)
      }
    },
    {
      id: 'shop',
      label: 'محلات تجارية',
      emoji: '🏪',
      count: suggestionCounts.shop,
      isActive: query.propertyType === 'Shop',
      toggle: () => {
        setQuery(q => ({
          ...q,
          propertyType: q.propertyType === 'Shop' ? undefined : 'Shop',
        }))
        setPage(1)
      }
    },
    {
      id: 'land',
      label: 'أراضي',
      emoji: '🌿',
      count: suggestionCounts.land,
      isActive: query.propertyType === 'Land',
      toggle: () => {
        setQuery(q => ({
          ...q,
          propertyType: q.propertyType === 'Land' ? undefined : 'Land',
        }))
        setPage(1)
      }
    },
    {
      id: 'finished',
      label: 'متشطب',
      emoji: '✨',
      count: suggestionCounts.finished,
      isActive: Boolean(query.isFinished),
      toggle: () => {
        setQuery(q => ({
          ...q,
          isFinished: !q.isFinished ? true : undefined,
          finishingStatus: undefined,
        }))
        setPage(1)
      }
    },
    {
      id: 'coreShell',
      label: 'عظم (طوب أحمر)',
      emoji: '🧱',
      count: suggestionCounts.coreShell,
      isActive: query.finishingStatus === 'Core-Shell',
      toggle: () => {
        setQuery(q => ({
          ...q,
          finishingStatus: q.finishingStatus === 'Core-Shell' ? undefined : 'Core-Shell',
          isFinished: undefined,
        }))
        setPage(1)
      }
    },
    {
      id: 'installment',
      label: 'متاح تقسيط',
      emoji: '💳',
      count: suggestionCounts.installment,
      isActive: Boolean(query.installmentAvailable),
      toggle: () => {
        setQuery(q => ({
          ...q,
          installmentAvailable: !q.installmentAvailable ? true : undefined,
        }))
        setPage(1)
      }
    },
    {
      id: 'nearFloor',
      label: 'دور منخفض (أقل من الثامن)',
      emoji: '🪜',
      count: suggestionCounts.nearFloor,
      isActive: Boolean(query.nearFloorOnly),
      toggle: () => {
        setQuery(q => ({
          ...q,
          nearFloorOnly: !q.nearFloorOnly ? true : undefined,
        }))
        setPage(1)
      }
    },
    {
      id: 'under1500k',
      label: 'أقل من 1.5 مليون',
      emoji: '💰',
      count: suggestionCounts.under1500k,
      isActive: query.maxPrice === 1500000 && !query.minPrice,
      toggle: () => {
        setQuery(q => ({
          ...q,
          minPrice: undefined,
          maxPrice: q.maxPrice === 1500000 ? undefined : 1500000,
        }))
        setPage(1)
      }
    },
    {
      id: 'underConstruction',
      label: 'تحت الإنشاء',
      emoji: '🏗️',
      count: suggestionCounts.underConstruction,
      isActive: query.isUnderConstruction === true,
      toggle: () => {
        setQuery(q => ({
          ...q,
          isUnderConstruction: q.isUnderConstruction === true ? undefined : true,
        }))
        setPage(1)
      }
    },
    {
      id: 'readyToDeliver',
      label: 'استلام فوري',
      emoji: '🔑',
      count: suggestionCounts.readyToDeliver,
      isActive: query.isUnderConstruction === false,
      toggle: () => {
        setQuery(q => ({
          ...q,
          isUnderConstruction: q.isUnderConstruction === false ? undefined : false,
        }))
        setPage(1)
      }
    },
    {
      id: 'elevator',
      label: 'يوجد أسانسير',
      emoji: '🛗',
      count: suggestionCounts.elevator,
      isActive: Boolean(query.elevatorAvailable),
      toggle: () => {
        setQuery(q => ({
          ...q,
          elevatorAvailable: !q.elevatorAvailable ? true : undefined,
        }))
        setPage(1)
      }
    },
  ], [suggestionCounts, query])

  return (
    <div className="props-page">
      {/* Page header */}
      <div className="props-page__header">
        <div className="container props-page__header-inner">
          <div>
            <h1 className="section-title">العقارات <span>المتاحة</span></h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              {loading ? (
                'جاري التحميل...'
              ) : totalAvailableUnits === 0 ? (
                'لا توجد شقق متاحة'
              ) : (
                (() => {
                  const countStr = totalAvailableUnits.toLocaleString('ar-EG')
                  if (query.propertyType === 'Land') return `${countStr} أرض متاحة`
                  if (query.propertyType === 'Shop' || query.propertyType === 'Commercial') return `${countStr} محل متاح`
                  if (query.propertyType === 'House' || query.propertyType === 'Villa') return `${countStr} منزل متاح`
                  return `${countStr} شقة متاحة`
                })()
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View-mode tabs */}
            <div className="props-view-tabs">
              <button className="props-view-tab active">
                <List size={15} /> القائمة
              </button>
              <Link to="/map" className="props-view-tab">
                <Map size={15} /> الخريطة
              </Link>
            </div>
            {/* Filter toggle */}
            <button
              className={`btn btn-ghost props-page__filter-toggle ${showFilters || hasFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(s => !s)}
            >
              <SlidersHorizontal size={16} />
              تصفية وبحث
              {hasFilters && <span className="filter-badge-count">{activeFilterCount}</span>}
            </button>
            {hasFilters && (
              <button
                className="btn btn-ghost"
                onClick={clearFilters}
                style={{ fontSize: '0.82rem', color: '#dc2626', gap: '4px', border: '1px solid #fecaca', background: '#fef2f2' }}
                title="إلغاء كافة شروط التصفية"
              >
                <RotateCcw size={13} />
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Suggestions Bar (Always Visible) */}
      <div className="quick-suggestions-bar">
        <div className="container quick-suggestions-inner">
          <div className="quick-suggestions-label">
            <Sparkles size={15} className="quick-suggestions-sparkle" />
            <span>تصفية سريعة:</span>
          </div>
          <div className="quick-suggestions-scroll">
            {suggestions.map(s => (
              <button
                key={s.id}
                type="button"
                className={`quick-chip ${s.isActive ? 'quick-chip--active' : ''}`}
                onClick={s.toggle}
                title={`تصفية حسب: ${s.label}`}
              >
                <span className="quick-chip__emoji">{s.emoji}</span>
                <span className="quick-chip__text">{s.label}</span>
                {s.count > 0 && <span className="quick-chip__count">{s.count}</span>}
                {s.isActive && <Check size={12} className="quick-chip__check" />}
              </button>
            ))}
            {hasFilters && (
              <button
                type="button"
                className="quick-chip quick-chip--clear"
                onClick={clearFilters}
                title="إلغاء كافة شروط التصفية"
              >
                <RotateCcw size={12} />
                <span>مسح الكل</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`filter-bar ${showFilters ? 'open' : ''}`}>
        <div className="container filter-bar__inner">

          {/* Quick Search */}
          <div className="filter-search-box">
            <Search size={18} className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="ابحث باسم العقار، الشارع، أو الحي (مثال: الشعبية، المأمون، الفلل)..."
              value={query.search ?? ''}
              onChange={e => set('search', e.target.value)}
            />
            {query.search && (
              <button className="filter-search-clear" onClick={() => set('search', '')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Primary Filters Row */}
          <div className="filter-row">
            {/* City */}
            <div className="filter-group">
              <label className="filter-label">المدينة</label>
              <select className="filter-select" value={query.city ?? ''} onChange={e => set('city', e.target.value)}>
                <option value="">كل المدن</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* District */}
            <div className="filter-group">
              <label className="filter-label">الحي / المنطقة</label>
              <select className="filter-select" value={query.district ?? ''} onChange={e => set('district', e.target.value)}>
                <option value="">كل المناطق</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="filter-group">
              <label className="filter-label">نوع العقار</label>
              <select className="filter-select" value={query.propertyType ?? ''} onChange={e => set('propertyType', e.target.value)}>
                <option value="">كل الأنواع</option>
                {PROP_TYPES.map(t => <option key={t} value={t}>{PROP_LABELS[t]}</option>)}
              </select>
            </div>

            {/* Listing */}
            <div className="filter-group">
              <label className="filter-label">نوع الإعلان</label>
              <select className="filter-select" value={query.listingType ?? ''} onChange={e => set('listingType', e.target.value)}>
                <option value="">الكل (بيع وإيجار)</option>
                {LISTING_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
              </select>
            </div>

            {/* Finishing Status */}
            <div className="filter-group">
              <label className="filter-label">نوع التشطيب</label>
              <select className="filter-select filter-select--highlight" value={query.finishingStatus ?? ''} onChange={e => set('finishingStatus', e.target.value)}>
                <option value="">كل أنواع التشطيب</option>
                {FINISHING_OPTS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
              </select>
            </div>

            {/* Sorting */}
            <div className="filter-group">
              <label className="filter-label">الترتيب حسب</label>
              <select className="filter-select" value={query.sortBy ?? 'newest'} onChange={e => set('sortBy', e.target.value)}>
                {SORT_OPTS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Quick Budget Chips */}
          <div style={{ marginTop: '0.85rem', marginBottom: '0.5rem', padding: '0.65rem 0.85rem', background: 'rgba(183,121,61,0.06)', borderRadius: '10px', border: '1px solid rgba(183,121,61,0.18)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--clr-text)', marginBottom: '6px' }}>
              💰 الميزانية السريعة:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: 'الكل', min: undefined, max: undefined },
                { label: 'أقل من 1.5 مليون', min: undefined, max: 1500000 },
                { label: '1.5 إلى 2.5 مليون', min: 1500000, max: 2500000 },
                { label: '2.5 إلى 3.5 مليون', min: 2500000, max: 3500000 },
                { label: 'أكثر من 3.5 مليون', min: 3500000, max: undefined },
              ].map((tier, idx) => {
                const isActive = query.minPrice === tier.min && query.maxPrice === tier.max
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(q => ({ ...q, minPrice: tier.min, maxPrice: tier.max }))
                      setPage(1)
                    }}
                    style={{
                      padding: '4px 11px',
                      borderRadius: '99px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: isActive ? 'var(--clr-gold)' : '#d1d5db',
                      background: isActive ? 'var(--clr-gold)' : '#ffffff',
                      color: isActive ? '#ffffff' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 6px rgba(183,121,61,0.3)' : 'none',
                    }}
                  >
                    {tier.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Secondary Numeric Filters Row */}
          <div className="filter-row filter-row--secondary">
            {/* Bedrooms */}
            <div className="filter-group">
              <label className="filter-label">غرف النوم (الحد الأدنى)</label>
              <select className="filter-select" value={query.bedrooms ?? ''} onChange={e => set('bedrooms', Number(e.target.value) || undefined)}>
                <option value="">أي عدد غرف</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ غرف</option>)}
              </select>
            </div>

            {/* Bathrooms */}
            <div className="filter-group">
              <label className="filter-label">الحمامات (الحد الأدنى)</label>
              <select className="filter-select" value={query.bathrooms ?? ''} onChange={e => set('bathrooms', Number(e.target.value) || undefined)}>
                <option value="">أي عدد حمامات</option>
                {[1,2,3].map(n => <option key={n} value={n}>{n}+ حمام</option>)}
              </select>
            </div>

            {/* Min Price */}
            <div className="filter-group">
              <label className="filter-label">الحد الأدنى للسعر (ج)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="من 0"
                value={query.minPrice ?? ''}
                onChange={e => set('minPrice', Number(e.target.value) || undefined)}
              />
            </div>

            {/* Max Price */}
            <div className="filter-group">
              <label className="filter-label">الحد الأقصى للسعر (ج)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="إلى أقصى سعر"
                value={query.maxPrice ?? ''}
                onChange={e => set('maxPrice', Number(e.target.value) || undefined)}
              />
            </div>

            {/* Min Area */}
            <div className="filter-group">
              <label className="filter-label">أقل مساحة (م²)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="مثلاً: 80"
                value={query.minArea ?? ''}
                onChange={e => set('minArea', Number(e.target.value) || undefined)}
              />
            </div>

            {/* Max Area */}
            <div className="filter-group">
              <label className="filter-label">أكبر مساحة (م²)</label>
              <input
                className="filter-input"
                type="number"
                placeholder="مثلاً: 200"
                value={query.maxArea ?? ''}
                onChange={e => set('maxArea', Number(e.target.value) || undefined)}
              />
            </div>
          </div>

          {/* Quick Feature Chips & Amenities */}
          <div className="filter-chips-section">
            <span className="filter-chips-label">المواصفات والخدمات:</span>
            <div className="filter-chips">
              <button
                type="button"
                className={`filter-chip ${query.installmentAvailable ? 'active' : ''}`}
                onClick={() => toggle('installmentAvailable')}
              >
                {query.installmentAvailable && <Check size={13} />}
                💳 متاح تقسيط
              </button>

              <button
                type="button"
                className={`filter-chip ${query.elevatorAvailable ? 'active' : ''}`}
                onClick={() => toggle('elevatorAvailable')}
              >
                {query.elevatorAvailable && <Check size={13} />}
                🛗 متوفر أسانسير
              </button>

              <button
                type="button"
                className={`filter-chip ${query.waterMeterAvailable ? 'active' : ''}`}
                onClick={() => toggle('waterMeterAvailable')}
              >
                {query.waterMeterAvailable && <Check size={13} />}
                💧 عداد مياه
              </button>

              <button
                type="button"
                className={`filter-chip ${query.electricityMeterAvailable ? 'active' : ''}`}
                onClick={() => toggle('electricityMeterAvailable')}
              >
                {query.electricityMeterAvailable && <Check size={13} />}
                ⚡ عداد كهرباء
              </button>

              <button
                type="button"
                className={`filter-chip ${query.gasMeterAvailable ? 'active' : ''}`}
                onClick={() => toggle('gasMeterAvailable')}
              >
                {query.gasMeterAvailable && <Check size={13} />}
                🔥 عداد غاز
              </button>

              <button
                type="button"
                className={`filter-chip ${query.isUnderConstruction === true ? 'active' : ''}`}
                onClick={() => set('isUnderConstruction', query.isUnderConstruction === true ? undefined : true)}
              >
                {query.isUnderConstruction === true && <Check size={13} />}
                🏗️ تحت الإنشاء
              </button>

              <button
                type="button"
                className={`filter-chip ${query.isUnderConstruction === false ? 'active' : ''}`}
                onClick={() => set('isUnderConstruction', query.isUnderConstruction === false ? undefined : false)}
              >
                {query.isUnderConstruction === false && <Check size={13} />}
                🔑 جاهز للاستلام
              </button>
            </div>

            {hasFilters && (
              <button className="btn btn-ghost filter-clear" onClick={clearFilters}>
                <RotateCcw size={13} /> مسح كل الفلاتر ({activeFilterCount})
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Results */}
      <div className="container section-sm">
        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <Search size={56} />
            <h3>لا توجد نتائج مطابقة</h3>
            <p>جرّب تغيير معايير البحث أو تقليل الفلاتر المختارة</p>
            {hasFilters && (
              <button className="btn btn-outline" style={{ marginTop: 'var(--space-lg)' }} onClick={clearFilters}>
                مسح الفلاتر والبدء من جديد
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid-3">
              {visibleItems.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
            {visibleItems.length < filteredItems.length && (
              <div ref={sentinelRef} style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', fontWeight: 700 }}>
                  جاري عرض المزيد من العقارات ({visibleItems.length} من {filteredItems.length})...
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
