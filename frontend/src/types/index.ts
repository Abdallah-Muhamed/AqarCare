// ── Property types ──────────────────────────────────────────────
export interface PropertyMedia {
  id: number
  mediaType: string
  url: string
  sortOrder: number
}

export interface PropertyFloor {
  id?: number
  floorNumber?: number | null
  floorName?: string | null
  price?: number | null
  pricePerMeter?: number | null
  installmentPrice?: number | null
  areaSqm?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  isAvailable: boolean
  sortOrder: number
}

export interface PropertyListItem {
  id: number
  title: string | null
  price: number | null
  installmentPrice?: number | null
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
  isUnderConstruction?: boolean
  primaryImageUrl: string | null
  waterMeterAvailable: boolean
  electricityMeterAvailable: boolean
  gasMeterAvailable: boolean
  elevatorAvailable: boolean
  floorNumber?: number | null
  apartmentsPerFloor?: number | null
  floors?: PropertyFloor[]
  isPublished?: boolean
}

export interface PropertyDetail extends PropertyListItem {
  description: string | null
  address: string | null
  soldPrice?: number | null
  finishingPackageId?: number | null
  installmentAvailable: boolean
  installmentPrice?: number | null
  floorNumber?: number | null
  isUnderConstruction?: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
  media: PropertyMedia[]
  floors?: PropertyFloor[]
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

// ── Custom Map types ─────────────────────────────────────────────
export interface MapStreet {
  id: number
  name: string
  aliases: string[]
  widthMeters: number | null
  lengthMeters: number | null
  streetType: string | null
  trafficDirection: string | null
  surfaceType: string | null
  importance: number
  geometryJson: string | null   // MultiLineString: { type, coordinates: [[[x,y],...]] }
  sortOrder: number
}

export interface MapProperty {
  id: number
  title: string | null
  price: number | null
  areaSqm: number | null
  propertyType: string | null
  listingType: string | null
  status: string              // Available | Reserved | Sold
  primaryImageUrl: string | null
  x: number                   // 0–1 normalized
  y: number                   // 0–1 normalized
  streetId: number
  bedrooms?: number | null
  bathrooms?: number | null
  floorNumber?: number | null
  finishingStatus?: string | null
  address?: string | null
  waterMeterAvailable?: boolean
  electricityMeterAvailable?: boolean
  gasMeterAvailable?: boolean
  elevatorAvailable?: boolean
  installmentAvailable?: boolean
  installmentPrice?: number | null
  isUnderConstruction?: boolean
  apartmentsPerFloor?: number | null
  floors?: PropertyFloor[]
}

export interface CityMap {
  id: number
  name: string
  slug: string
  streets: MapStreet[]
  properties: MapProperty[]
}

export interface MapFilters {
  listingType?: string
  propertyType?: string
  status?: string
  minPrice?: number
  maxPrice?: number
}

