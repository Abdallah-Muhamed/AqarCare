// ── Property types ──────────────────────────────────────────────
export interface PropertyMedia {
  id: number
  mediaType: string
  url: string
  sortOrder: number
}

export interface PropertyListItem {
  id: number
  title: string | null
  price: number | null
  areaSqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  propertyType: string | null
  listingType: string | null
  finishingStatus: string | null
  city: string | null
  district: string | null
  address: string | null
  detailedAddress: string | null
  status: string
  isFeatured: boolean
  primaryImageUrl: string | null
  waterMeterAvailable: boolean
  electricityMeterAvailable: boolean
  gasMeterAvailable: boolean
  elevatorAvailable: boolean
}

export interface PropertyDetail extends PropertyListItem {
  description: string | null
  address: string | null
  soldPrice?: number | null
  finishingPackageId?: number | null
  installmentAvailable: boolean
  floorNumber?: number | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
  media: PropertyMedia[]
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface PropertyQuery {
  city?: string
  propertyType?: string
  listingType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  isFeatured?: boolean
  page?: number
  pageSize?: number
}

// ── Finishing Package types ──────────────────────────────────────
export interface PackageListItem {
  id: number
  name: string
  slug: string
  pricePerSqm: number
  shortDescription: string
  sortOrder: number
  supervisionPercent?: number
  primaryImageUrl: string | null
}

export interface PaymentPhase {
  id: number
  percentage: number
  phaseDescription: string
  sortOrder: number
}

export interface FeatureItem {
  id: number
  text: string
  sortOrder: number
}

export interface PackageSection {
  id: number
  title: string
  sortOrder: number
  featureItems: FeatureItem[]
}

export interface PackageNote {
  id: number
  text: string
  sortOrder: number
}

export interface PackageDetail {
  id: number
  name: string
  slug: string
  pricePerSqm: number
  shortDescription: string
  description: string
  supervisionPercent: number
  sortOrder: number
  isActive: boolean
  paymentPhases: PaymentPhase[]
  sections: PackageSection[]
  notes: PackageNote[]
  media: PropertyMedia[]
}
