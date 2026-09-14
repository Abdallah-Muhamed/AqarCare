import type { PropertyFloor } from '../types'

export interface FloorGroup {
  floorKey: string
  floorTitle: string
  items: PropertyFloor[]
}

/**
 * Normalizes a floor name or floor number into a clean Arabic title.
 * e.g. "الدور 7 - 10 - 11" or 71011 -> "الأدوار 7 و 10 و 11"
 * e.g. 0 -> "الدور الأرضي"
 * e.g. 1 -> "الدور 1"
 */
export function normalizeFloorTitle(floorName?: string | null, floorNumber?: number | null): string {
  if (floorName) {
    const name = floorName.trim()
    if (name.includes('7 - 10 - 11') || name.includes('7-10-11') || floorNumber === 71011) {
      return 'الأدوار 7 و 10 و 11'
    }
  }

  if (floorNumber != null) {
    if (floorNumber === 71011) return 'الأدوار 7 و 10 و 11'
    if (floorNumber === 0) return 'الدور الأرضي'
    return `الدور ${floorNumber}`
  }

  if (floorName) {
    const name = floorName.trim()
    if (name.startsWith('الأدوار') || name.startsWith('الدور')) {
      return name
    }
    if (name.includes('-') || name.includes('و') || name.includes('،')) {
      return `الأدوار ${name.replace(/-/g, ' و ').replace(/\s+/g, ' ')}`
    }
    return isNaN(Number(name)) ? name : `الدور ${name}`
  }

  return 'الدور غير محدد'
}

/**
 * Groups an array of PropertyFloor items by floor identity so multiple units on the same floor
 * are grouped cleanly under one floor header instead of repeating the floor title.
 */
export function groupFloors(floors: (PropertyFloor | { floorNumber?: number | null; floorName?: string | null; isAvailable?: boolean })[]): FloorGroup[] {
  if (!floors || floors.length === 0) return []

  const groupsMap = new Map<string, { title: string; items: PropertyFloor[] }>()

  floors.forEach((f) => {
    const title = normalizeFloorTitle(f.floorName, f.floorNumber)
    const key = f.floorNumber != null && f.floorNumber !== 71011
      ? String(f.floorNumber)
      : title

    if (!groupsMap.has(key)) {
      groupsMap.set(key, { title, items: [] })
    }
    groupsMap.get(key)!.items.push(f as PropertyFloor)
  })

  return Array.from(groupsMap.entries()).map(([floorKey, data]) => ({
    floorKey,
    floorTitle: data.title,
    items: data.items,
  }))
}

/**
 * Formats property floors into a clean Arabic string without repeating duplicate floor names:
 * e.g. "الدور 1 و 3", "الأدوار 7 و 10 و 11 (3 شقق بالدور)"
 */
export function formatFloorsText(
  floors?: (PropertyFloor | { floorNumber?: number | null; floorName?: string | null; isAvailable?: boolean })[]
): string {
  if (!floors || floors.length === 0) return ''

  const available = floors.filter(f => f.isAvailable !== false)
  if (available.length === 0) return 'جميع الأدوار مباعة'

  const groups = groupFloors(available)
  if (groups.length === 0) return ''

  return groups.map(g => {
    if (g.items.length > 1) {
      return `${g.floorTitle} (${g.items.length} شقق متاحة بالدور)`
    }
    return g.floorTitle
  }).join(' و ')
}

/**
 * Calculates the number of apartments/units for a given property:
 * - If propertyType is 'House' or 'Villa', it counts as 1 complete unit ("الا لو بيت للبيع بيتحسب وحدة كاملة").
 * - If floors are defined, counts floors matching the requested status (available vs sold).
 * - If no floors are defined, counts as 1 unit if matching the status.
 */
export function getPropertyUnitsCount(
  p: {
    status?: string | null
    propertyType?: string | null
    floors?: (PropertyFloor | { isAvailable?: boolean })[] | null
  },
  statusFilter?: 'Available' | 'Sold' | string
): number {
  const isSoldFilter = statusFilter === 'Sold'
  const isPropertySold = p.status?.toLowerCase() === 'sold'

  // If looking for available units, but the whole property is sold:
  if (!isSoldFilter && isPropertySold) {
    return 0
  }

  // If looking for sold units, and the whole property is sold:
  if (isSoldFilter && isPropertySold) {
    return p.floors && p.floors.length > 0 ? p.floors.length : 1
  }

  // House / Villa is counted as a single complete unit ("الا لو بيت للبيع بيتحسب وحدة كاملة")
  if (p.propertyType === 'House' || p.propertyType === 'Villa') {
    return isSoldFilter ? 0 : 1
  }

  // If the property has floors defined, count floors matching status
  if (p.floors && p.floors.length > 0) {
    if (isSoldFilter) {
      return p.floors.filter(f => f.isAvailable === false).length
    }
    return p.floors.filter(f => f.isAvailable !== false).length
  }

  // Single unit without floors breakdown
  return isSoldFilter ? 0 : 1
}

/**
 * Calculates total available units/apartments across a list of properties.
 */
export function getTotalAvailableUnits(
  properties: {
    status?: string | null
    propertyType?: string | null
    floors?: (PropertyFloor | { isAvailable?: boolean })[] | null
  }[],
  statusFilter?: 'Available' | 'Sold' | string
): number {
  return properties.reduce((sum, p) => sum + getPropertyUnitsCount(p, statusFilter), 0)
}

export const getPropertyAvailableUnits = getPropertyUnitsCount
export const getTotalUnitsCount = getTotalAvailableUnits

