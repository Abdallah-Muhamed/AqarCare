/** Street widths as specified by the user */
export const STREET_WIDTH_METERS: Record<string, number> = {
  'جمال عبد الناصر': 25,
  'المأمون': 12.5,
  'فاطمة الزهراء': 12.5,
  'عمار بن ياسر': 55,
  'عبد الحي شاهين': 101,
  'عشرة': 10,
}

/** Resolve street width: DB value first, then name lookup, then default 8m */
export function resolveStreetWidth(name: string, dbWidth: number | null): number {
  if (dbWidth && dbWidth > 0) return dbWidth
  for (const [key, val] of Object.entries(STREET_WIDTH_METERS)) {
    if (name.includes(key)) return val
  }
  return 8
}

/** Convert meters to Three.js scene units (1m = 0.12 units) */
export const METERS_TO_UNITS = 0.12

/** The map occupies a 100×100 Three.js unit square */
export const MAP_SCALE = 100
