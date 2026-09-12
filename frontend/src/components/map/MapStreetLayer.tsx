import type { MapStreet } from '../../types'

interface Geometry {
  type: string
  coordinates: number[][][]  // MultiLineString: [[[x,y], ...], ...]
}

interface Props {
  streets: MapStreet[]
  mapW: number
  mapH: number
  zoom: number
}

/** Real width in meters → SVG stroke width (visual pixels in SVG space) */
function strokeWidth(widthMeters: number | null): number {
  const w = widthMeters ?? 8
  // Scale: 101m → 24px, 55m → 14px, 25m → 7.5px, 12.5m → 4px, 10m → 3.5px, 8m → 3px
  return Math.max(2.5, (w / 8) * 3)
}

function casingWidth(widthMeters: number | null): number {
  return strokeWidth(widthMeters) + 2.5
}

function streetStrokeClass(type: string | null): string {
  if (!type) return 'default'
  if (type === 'primary' || type === 'trunk')   return 'primary'
  if (type === 'secondary')                      return 'secondary'
  if (type === 'tertiary')                       return 'tertiary'
  if (type === 'residential' || type === 'living_street') return 'residential'
  return 'default'
}

/** Convert normalized 0-1 → SVG pixel coords */
function toSvgXY(x: number, y: number, mapW: number, mapH: number): [number, number] {
  return [x * mapW, y * mapH]
}

function buildPoints(coords: number[][], mapW: number, mapH: number): string {
  return coords.map(([x, y]) => toSvgXY(x, y, mapW, mapH).join(',')).join(' ')
}

/** Mid-point of a segment for label placement */
function segmentMidpoint(coords: number[][], mapW: number, mapH: number): [number, number] {
  const mid = Math.floor(coords.length / 2)
  return toSvgXY(coords[mid][0], coords[mid][1], mapW, mapH)
}

/** Font size for label based on street width and importance */
function labelFontSize(widthMeters: number | null, importance: number): number {
  const w = widthMeters ?? 8
  if (importance >= 80) return Math.max(6, Math.min(14, w * 0.45))
  if (importance >= 60) return Math.max(5, Math.min(11, w * 0.4))
  if (importance >= 40) return Math.max(4.5, Math.min(9, w * 0.38))
  return Math.max(4, Math.min(7, w * 0.35))
}

export default function MapStreetLayer({ streets, mapW, mapH, zoom }: Props) {
  // Sort streets: less important first (painted under), more important on top
  const sorted = [...streets].sort((a, b) => a.importance - b.importance)

  // Label visibility thresholds based on zoom
  // At zoom=1 (full city view): show only very important streets (importance >= 70)
  // At zoom=2: show importance >= 50
  // At zoom=3+: show all
  const labelImportanceThreshold = zoom >= 3 ? 30 : zoom >= 2 ? 50 : zoom >= 1.2 ? 65 : 75

  return (
    <g className="map-streets">
      {/* Pass 1: Casings (borders) — bottom layer */}
      {sorted.map(street => {
        if (!street.geometryJson) return null
        let geo: Geometry
        try { geo = JSON.parse(street.geometryJson) } catch { return null }
        if (geo.type !== 'MultiLineString') return null
        const cw = casingWidth(street.widthMeters)
        return geo.coordinates.map((seg, si) => (
          <polyline
            key={`casing-${street.id}-${si}`}
            className="map-street-casing"
            points={buildPoints(seg, mapW, mapH)}
            strokeWidth={cw}
          />
        ))
      })}

      {/* Pass 2: Road surfaces */}
      {sorted.map(street => {
        if (!street.geometryJson) return null
        let geo: Geometry
        try { geo = JSON.parse(street.geometryJson) } catch { return null }
        if (geo.type !== 'MultiLineString') return null
        const sw  = strokeWidth(street.widthMeters)
        const cls = streetStrokeClass(street.streetType)
        return geo.coordinates.map((seg, si) => (
          <polyline
            key={`road-${street.id}-${si}`}
            className={`map-street map-street--${cls}`}
            points={buildPoints(seg, mapW, mapH)}
            strokeWidth={sw}
          />
        ))
      })}

      {/* Pass 3: Labels — top layer */}
      {sorted.map(street => {
        if (!street.geometryJson) return null
        if (street.importance < labelImportanceThreshold) return null
        let geo: Geometry
        try { geo = JSON.parse(street.geometryJson) } catch { return null }
        if (geo.type !== 'MultiLineString') return null

        const fs = labelFontSize(street.widthMeters, street.importance)
        // Pick the longest segment for the label
        const longestSeg = geo.coordinates.reduce((best, seg) => seg.length > best.length ? seg : best, geo.coordinates[0] ?? [])
        if (!longestSeg || longestSeg.length < 2) return null
        const [lx, ly] = segmentMidpoint(longestSeg, mapW, mapH)

        return (
          <text
            key={`label-${street.id}`}
            className="map-label"
            x={lx}
            y={ly}
            fontSize={fs}
          >
            {street.name}
          </text>
        )
      })}
    </g>
  )
}
