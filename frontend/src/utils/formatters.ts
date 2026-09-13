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
  const targetFloors = available.length > 0 ? available : floors

  const groups = groupFloors(targetFloors)
  if (groups.length === 0) return ''

  return groups.map(g => {
    if (g.items.length > 1) {
      return `${g.floorTitle} (${g.items.length} شقق بالدور)`
    }
    return g.floorTitle
  }).join(' و ')
}
