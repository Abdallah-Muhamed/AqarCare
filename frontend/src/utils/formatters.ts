import type { PropertyFloor } from '../types'

/**
 * Formats property floors into a clean Arabic string:
 * e.g. "الدور 1", "الدور 1 و 3", "الدور الأرضي و 1 و 4"
 */
export function formatFloorsText(
  floors?: (PropertyFloor | { floorNumber?: number | null; floorName?: string | null; isAvailable?: boolean })[]
): string {
  if (!floors || floors.length === 0) return ''

  // Filter available floors if any are marked available; otherwise take all
  const available = floors.filter(f => f.isAvailable !== false)
  const targetFloors = available.length > 0 ? available : floors

  // Sort floors logically by floorNumber if present
  const sorted = [...targetFloors].sort((a, b) => {
    const na = a.floorNumber ?? 999
    const nb = b.floorNumber ?? 999
    return na - nb
  })

  const labels = sorted.map(f => {
    if (f.floorNumber != null) {
      return f.floorNumber === 0 ? 'الأرضي' : String(f.floorNumber)
    }
    if (f.floorName) {
      return f.floorName.replace(/^الدور\s*/, '').trim()
    }
    return ''
  }).filter(Boolean)

  if (labels.length === 0) return ''
  return `الدور ${labels.join(' و ')}`
}
