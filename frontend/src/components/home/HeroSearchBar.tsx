import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, ChevronDown, X, Check } from 'lucide-react'
import { fuzzyArabicMatch } from '../../utils/formatters'
import './HeroSearchBar.css'

interface LocationItem {
  name: string
  category: 'حي' | 'شارع' | 'معلم' | 'مدينة'
}

const SUGGESTED_LOCATIONS: LocationItem[] = [
  { name: 'منشية البكري', category: 'حي' },
  { name: 'الشعبية', category: 'حي' },
  { name: 'الجمهورية', category: 'حي' },
  { name: 'شكري القوتلي', category: 'حي' },
  { name: 'أبو راضي', category: 'حي' },
  { name: 'الرجبي', category: 'حي' },
  { name: 'شارع البحر', category: 'شارع' },
  { name: 'شارع الترعة', category: 'شارع' },
  { name: 'شارع جمال عبدالناصر', category: 'شارع' },
  { name: 'حي النخيل', category: 'معلم' },
  { name: 'شارع الحنفي', category: 'شارع' },
  { name: 'شارع سعد محمد سمك', category: 'شارع' },
  { name: 'المنشية الجديدة', category: 'حي' },
  { name: 'منشأة الزهراء', category: 'حي' },
  { name: 'الوابورات', category: 'حي' },
  { name: 'المحلة الكبرى', category: 'مدينة' },
]

const PROPERTY_TYPES = [
  { val: 'all', label: 'الجميع (كل الأنواع)' },
  { val: 'Apartment', label: 'شقق سكنية' },
  { val: 'House', label: 'منازل كاملة' },
  { val: 'Land', label: 'أراضي' },
  { val: 'Shop', label: 'محلات تجارية' },
]

export default function HeroSearchBar() {
  const navigate = useNavigate()

  // Top Row States
  const [listingType, setListingType] = useState<'Sale' | 'Rent'>('Sale')
  const [location, setLocation] = useState('')
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  // Bottom Row States
  const [status, setStatus] = useState<'all' | 'ready' | 'under-construction'>('all')
  const [propertyType, setPropertyType] = useState('all')
  const [bedrooms, setBedrooms] = useState<number | null>(null)
  const [bathrooms, setBathrooms] = useState<number | null>(null)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')

  // Popover State
  const [openDropdown, setOpenDropdown] = useState<'type' | 'rooms' | 'price' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setShowLocationSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle Search Submission
  const handleSearch = () => {
    const params = new URLSearchParams()

    if (listingType) {
      params.set('listingType', listingType)
    }

    if (propertyType && propertyType !== 'all') {
      params.set('type', propertyType)
    }

    if (location.trim()) {
      params.set('search', location.trim())
    }

    if (status === 'under-construction') {
      params.set('filter', 'under-construction')
    } else if (status === 'ready') {
      params.set('filter', 'ready')
    }

    if (minPrice) {
      params.set('minPrice', minPrice)
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice)
    }

    if (bedrooms != null) {
      params.set('bedrooms', bedrooms.toString())
    }

    if (bathrooms != null) {
      params.set('bathrooms', bathrooms.toString())
    }

    navigate(`/properties?${params.toString()}`)
  }

  // Label Formatter for Rooms Dropdown
  const getRoomsLabel = () => {
    if (bedrooms == null && bathrooms == null) return 'عدد الغرف & الحمامات'
    const parts = []
    if (bedrooms != null) parts.push(`${bedrooms} غرف`)
    if (bathrooms != null) parts.push(`${bathrooms} حمام`)
    return parts.join('، ')
  }

  // Label Formatter for Price Dropdown
  const getPriceLabel = () => {
    if (!minPrice && !maxPrice) return 'السعر (ج.م)'
    if (minPrice && maxPrice) return `${Number(minPrice).toLocaleString('ar-EG')} - ${Number(maxPrice).toLocaleString('ar-EG')} ج`
    if (minPrice) return `من ${Number(minPrice).toLocaleString('ar-EG')} ج`
    return `حتى ${Number(maxPrice).toLocaleString('ar-EG')} ج`
  }

  // Type label formatter
  const getTypeLabel = () => {
    const item = PROPERTY_TYPES.find(t => t.val === propertyType)
    return item && item.val !== 'all' ? item.label : 'النوع'
  }

  return (
    <div className="hero-search-wrapper" ref={dropdownRef}>
      {/* ── Main Search Card ──────────────────────────────────────── */}
      <div className="hero-search-card">
        <div className="hero-search-card__inner">
          {/* ── Top Row ─────────────────────────────────────────────── */}
          <div className="hero-search__row-top">
            {/* Toggle: للبيع / للإيجار */}
            <div className="hero-search__toggle-group">
              <button
                type="button"
                className={`hero-search__toggle-btn ${listingType === 'Sale' ? 'hero-search__toggle-btn--active' : ''}`}
                onClick={() => setListingType('Sale')}
              >
                للبيع
              </button>
              <button
                type="button"
                className={`hero-search__toggle-btn ${listingType === 'Rent' ? 'hero-search__toggle-btn--active' : ''}`}
                onClick={() => setListingType('Rent')}
              >
                للإيجار
              </button>
            </div>

            {/* Location Input with Autocomplete */}
            <div className="hero-search__location-wrap">
              <MapPin size={18} className="hero-search__location-icon" />
              <input
                type="text"
                className="hero-search__location-input"
                placeholder="أدخل الموقع، الحي أو الشارع..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setShowLocationSuggestions(true)
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
              />
              {location && (
                <button
                  type="button"
                  className="hero-search__clear-btn"
                  onClick={() => setLocation('')}
                  title="مسح"
                >
                  <X size={14} />
                </button>
              )}

              {/* Suggestions dropdown */}
              {showLocationSuggestions && (
                <ul className="hero-search__suggestions">
                  {(() => {
                    const matched = SUGGESTED_LOCATIONS.filter(
                      loc => !location || fuzzyArabicMatch(loc.name, location)
                    )
                    if (matched.length === 0) {
                      return (
                        <li className="hero-search__suggestion-item hero-search__suggestion-item--empty">
                          <span>اضغط "بحث" للبحث المباشر عن "{location}"</span>
                        </li>
                      )
                    }
                    return matched.map((loc, i) => (
                      <li
                        key={i}
                        className="hero-search__suggestion-item"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setLocation(loc.name)
                          setShowLocationSuggestions(false)
                        }}
                      >
                        <MapPin size={14} className="hero-search__suggestion-pin" />
                        <span className="hero-search__suggestion-name">{loc.name}</span>
                        <span className="hero-search__suggestion-cat">{loc.category}</span>
                      </li>
                    ))
                  })()}
                </ul>
              )}
            </div>

            {/* Search Button */}
            <button
              type="button"
              className="hero-search__submit-btn"
              onClick={handleSearch}
            >
              <Search size={18} />
              <span>بحث</span>
            </button>
          </div>

          {/* ── Bottom Row ──────────────────────────────────────────── */}
          <div className="hero-search__row-bottom">
            {/* Status Pill Toggle: الجميع | جاهز | قيد الإنشاء */}
            <div className="hero-search__status-group">
              <button
                type="button"
                className={`hero-search__status-btn ${status === 'all' ? 'hero-search__status-btn--active' : ''}`}
                onClick={() => setStatus('all')}
              >
                الجميع
              </button>
              <button
                type="button"
                className={`hero-search__status-btn ${status === 'ready' ? 'hero-search__status-btn--active' : ''}`}
                onClick={() => setStatus('ready')}
              >
                جاهز
              </button>
              <button
                type="button"
                className={`hero-search__status-btn ${status === 'under-construction' ? 'hero-search__status-btn--active' : ''}`}
                onClick={() => setStatus('under-construction')}
              >
                قيد الإنشاء
              </button>
            </div>

            {/* Dropdown 1: النوع (بدل سكني النوع) */}
            <div className="hero-search__dropdown-wrap">
              <div
                className={`hero-search__dropdown-trigger ${openDropdown === 'type' ? 'hero-search__dropdown-trigger--open' : ''} ${propertyType !== 'all' ? 'hero-search__dropdown-trigger--has-val' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              >
                <span className="hero-search__dropdown-trigger-text">{getTypeLabel()}</span>
                <ChevronDown size={15} className="hero-search__dropdown-arrow" />
              </div>

              {openDropdown === 'type' && (
                <div className="hero-search__popover">
                  <div className="hero-search__type-options">
                    {PROPERTY_TYPES.map(t => (
                      <button
                        key={t.val}
                        type="button"
                        className={`hero-search__type-option ${propertyType === t.val ? 'hero-search__type-option--active' : ''}`}
                        onClick={() => {
                          setPropertyType(t.val)
                          setOpenDropdown(null)
                        }}
                      >
                        <span>{t.label}</span>
                        {propertyType === t.val && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown 2: عدد الغرف & الحمامات */}
            <div className="hero-search__dropdown-wrap">
              <div
                className={`hero-search__dropdown-trigger ${openDropdown === 'rooms' ? 'hero-search__dropdown-trigger--open' : ''} ${bedrooms != null || bathrooms != null ? 'hero-search__dropdown-trigger--has-val' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'rooms' ? null : 'rooms')}
              >
                <span className="hero-search__dropdown-trigger-text">{getRoomsLabel()}</span>
                <ChevronDown size={15} className="hero-search__dropdown-arrow" />
              </div>

              {openDropdown === 'rooms' && (
                <div className="hero-search__popover">
                  {/* Bedrooms */}
                  <div className="hero-search__rooms-section">
                    <div className="hero-search__rooms-title">عدد غرف النوم</div>
                    <div className="hero-search__pill-row">
                      <button
                        type="button"
                        className={`hero-search__pill-btn ${bedrooms === null ? 'hero-search__pill-btn--active' : ''}`}
                        onClick={() => setBedrooms(null)}
                      >
                        الكل
                      </button>
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          className={`hero-search__pill-btn ${bedrooms === num ? 'hero-search__pill-btn--active' : ''}`}
                          onClick={() => setBedrooms(bedrooms === num ? null : num)}
                        >
                          {num === 5 ? '+5' : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="hero-search__rooms-section">
                    <div className="hero-search__rooms-title">عدد الحمامات</div>
                    <div className="hero-search__pill-row">
                      <button
                        type="button"
                        className={`hero-search__pill-btn ${bathrooms === null ? 'hero-search__pill-btn--active' : ''}`}
                        onClick={() => setBathrooms(null)}
                      >
                        الكل
                      </button>
                      {[1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          className={`hero-search__pill-btn ${bathrooms === num ? 'hero-search__pill-btn--active' : ''}`}
                          onClick={() => setBathrooms(bathrooms === num ? null : num)}
                        >
                          {num === 4 ? '+4' : num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown 3: السعر (ج.م) */}
            <div className="hero-search__dropdown-wrap">
              <div
                className={`hero-search__dropdown-trigger ${openDropdown === 'price' ? 'hero-search__dropdown-trigger--open' : ''} ${minPrice || maxPrice ? 'hero-search__dropdown-trigger--has-val' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
              >
                <span className="hero-search__dropdown-trigger-text">{getPriceLabel()}</span>
                <ChevronDown size={15} className="hero-search__dropdown-arrow" />
              </div>

              {openDropdown === 'price' && (
                <div className="hero-search__popover">
                  <div className="hero-search__price-inputs">
                    <div className="hero-search__price-input-box">
                      <label>الحد الأدنى</label>
                      <input
                        type="number"
                        placeholder="من"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                    <div className="hero-search__price-input-box">
                      <label>الحد الأقصى</label>
                      <input
                        type="number"
                        placeholder="إلى"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="hero-search__quick-prices">
                    <button
                      type="button"
                      className="hero-search__quick-price-btn"
                      onClick={() => {
                        setMinPrice('')
                        setMaxPrice('1500000')
                        setOpenDropdown(null)
                      }}
                    >
                      💰 أقل من 1.5 مليون جنيه
                    </button>
                    <button
                      type="button"
                      className="hero-search__quick-price-btn"
                      onClick={() => {
                        setMinPrice('1500000')
                        setMaxPrice('2500000')
                        setOpenDropdown(null)
                      }}
                    >
                      💰 من 1.5 لـ 2.5 مليون جنيه
                    </button>
                    <button
                      type="button"
                      className="hero-search__quick-price-btn"
                      onClick={() => {
                        setMinPrice('2500000')
                        setMaxPrice('')
                        setOpenDropdown(null)
                      }}
                    >
                      💰 أكثر من 2.5 مليون جنيه
                    </button>
                    {(minPrice || maxPrice) && (
                      <button
                        type="button"
                        className="hero-search__reset-price-btn"
                        onClick={() => {
                          setMinPrice('')
                          setMaxPrice('')
                        }}
                      >
                        إعادة ضبط السعر
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
