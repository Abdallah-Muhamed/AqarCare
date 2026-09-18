import type { PropertyFloor } from '../types'

export interface FloorGroup {
  floorKey: string
  floorTitle: string
  items: PropertyFloor[]
}

/**
 * Parses multi-floor patterns such as:
 * - "2/3/4" or "2/4/5/6/8" or "10/12/14/16"
 * - "2، 3، 4" or "2, 3, 4"
 * - "2-5" or "2 - 5" (range)
 * - "2 و 3 و 4"
 * - Arabic digits: "١/٢/٤/٥"
 * Returns an array of detected floor numbers, or empty array if not a multi-floor pattern.
 */
export function parseMultiFloorNumbers(input?: string | null): number[] {
  if (!input) return []

  // Convert Arabic-Indic digits (٠-٩) to ASCII (0-9)
  const normalized = input.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

  // Must contain multi-floor separator between digits: e.g. "2/3/4", "2-5", "2, 3", "2 و 3"
  const hasDelimiter = /\d+\s*[\/,\،\\و\-]\s*\d+/.test(normalized) ||
                        /(?:من\s+)?\d+\s*(?:إلى|الي|to)\s*\d+/i.test(normalized)

  if (!hasDelimiter) {
    return []
  }

  // Check for range pattern like "2-5" or "2 - 5" or "من 2 الى 5"
  const rangeMatch = normalized.match(/(?:من\s+)?(\d+)\s*(?:-|إلى|الي|to)\s*(\d+)/i)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10)
    const end = parseInt(rangeMatch[2], 10)
    if (!isNaN(start) && !isNaN(end) && start < end && (end - start) <= 30) {
      const rangeNums: number[] = []
      for (let i = start; i <= end; i++) {
        rangeNums.push(i)
      }
      return rangeNums
    }
  }

  // Split on delimiters: /, ,, ،, \, و, whitespace, dash
  const tokens = normalized.split(/[\/,\،\\\s+و\-]+/)
  const nums: number[] = []
  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue
    const n = parseInt(trimmed, 10)
    if (!isNaN(n) && n >= 0 && n <= 50 && !nums.includes(n)) {
      nums.push(n)
    }
  }

  return nums.length > 1 ? nums : []
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

    const multi = parseMultiFloorNumbers(name)
    if (multi.length > 1) {
      return `الأدوار ${multi.join(' و ')}`
    }
  }

  if (floorNumber != null) {
    if (floorNumber === 71011) return 'الأدوار 7 و 10 و 11'
    if (floorNumber === 0) return 'الدور الأرضي'
    if (floorNumber > 50) {
      const digits = String(floorNumber).split('').filter(d => d !== '0')
      if (digits.length > 1) {
        return `الأدوار ${digits.join(' و ')}`
      }
    }
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
    const key = f.floorNumber != null && f.floorNumber !== 71011 && f.floorNumber <= 50
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
  floors?: (PropertyFloor | { floorNumber?: number | null; floorName?: string | null; isAvailable?: boolean })[],
  propertyType?: string | null
): string {
  if (!floors || floors.length === 0) return ''

  // For House or Villa, floors describe the house structure/levels, not separate units for sale
  if (propertyType === 'House' || propertyType === 'Villa') {
    const count = floors.length
    if (count === 1) return 'دور واحد'
    if (count === 2) return 'دورين'
    if (count <= 10) return `${count} أدوار`
    return `${count} دور`
  }

  const available = floors.filter(f => f.isAvailable !== false)
  if (available.length === 0) return 'جميع الأدوار مباعة'

  const groups = groupFloors(available)
  if (groups.length === 0) return ''

  // If only 1 floor group
  if (groups.length === 1) {
    const g = groups[0]
    if (g.items.length > 1) {
      return `${g.floorTitle} (${g.items.length} شقق متاحة بالدور)`
    }
    return g.floorTitle
  }

  // If multiple groups and all are single-apartment floors e.g. "الدور 2", "الدور 4", etc.:
  // format cleanly as "الأدوار 2 و 4 و 5" instead of repeating "الدور"
  const allSingle = groups.every(g => g.items.length === 1)
  const canUseAdwar = groups.every(g => g.floorTitle.startsWith('الدور ') || g.floorTitle === 'الدور الأرضي')

  if (allSingle && canUseAdwar) {
    const labels = groups.map(g => {
      if (g.floorTitle === 'الدور الأرضي') return 'الأرضي'
      return g.floorTitle.replace(/^الدور\s+/, '')
    })
    return `الأدوار ${labels.join(' و ')}`
  }

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

export const FINISHING_LABELS: Record<string, string> = {
  'Core-Shell': 'عظم',
  'Semi-Finished': 'نصف تشطيب',
  'Finished': 'تشطيب كامل',
  'Lux': 'لوكس',
  'Super-Lux': 'سوبر لوكس',
  'Ultra-Super-Lux': 'ألترا سوبر لوكس',
  'High-Lux': 'هاي لوكس',
  'Mixed': 'تشطيب متعدد',
}

export function formatFinishingLabel(status?: string | null): string {
  if (!status) return ''
  return FINISHING_LABELS[status] ?? status
}

/**
 * Summarizes floor finishings for houses or buildings:
 * e.g. "3 أدوار ألترا سوبر لوكس • 3 أدوار نصف تشطيب"
 */
export function formatFloorsFinishingSummary(
  floors?: (PropertyFloor | { finishingStatus?: string | null })[]
): string {
  if (!floors || floors.length === 0) return ''
  const validFloors = floors.filter(f => Boolean(f.finishingStatus))
  if (validFloors.length === 0) return ''

  const counts = new Map<string, number>()
  for (const f of validFloors) {
    const s = f.finishingStatus!
    counts.set(s, (counts.get(s) || 0) + 1)
  }

  const parts: string[] = []
  for (const [finish, count] of counts.entries()) {
    const label = formatFinishingLabel(finish)
    const adwarWord = count === 1 ? 'دور واحد' : count === 2 ? 'دورين' : count <= 10 ? `${count} أدوار` : `${count} دور`
    parts.push(`${adwarWord} ${label}`)
  }

  return parts.join(' • ')
}

