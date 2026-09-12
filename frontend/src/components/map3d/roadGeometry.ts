import * as THREE from 'three'
import { MAP_SCALE } from '../../constants/streetWidths'

interface Geometry {
  type: string
  coordinates: number[][][]
}

/**
 * Builds a flat ribbon BufferGeometry for a road from MultiLineString coordinates.
 * Each coordinate pair [x,y] is normalized 0-1 from the backend.
 */
export function buildRoadGeometry(
  multiLineCoords: number[][][],
  widthUnits: number,
  elevation = 0.06
): THREE.BufferGeometry {
  const positions: number[] = []
  const normals:   number[] = []
  const indices:   number[] = []
  let vi = 0

  for (const line of multiLineCoords) {
    for (let i = 0; i < line.length - 1; i++) {
      const [x1n, y1n] = line[i]
      const [x2n, y2n] = line[i + 1]

      // normalized 0-1 → centered scene coords
      const x1 = (x1n - 0.5) * MAP_SCALE
      const z1 = (y1n - 0.5) * MAP_SCALE
      const x2 = (x2n - 0.5) * MAP_SCALE
      const z2 = (y2n - 0.5) * MAP_SCALE

      const dx = x2 - x1
      const dz = z2 - z1
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len < 0.0001) continue

      const hw = widthUnits / 2
      const px = (-dz / len) * hw
      const pz = ( dx / len) * hw

      positions.push(
        x1 + px, elevation, z1 + pz,  // v0
        x1 - px, elevation, z1 - pz,  // v1
        x2 + px, elevation, z2 + pz,  // v2
        x2 - px, elevation, z2 - pz,  // v3
      )
      for (let n = 0; n < 4; n++) normals.push(0, 1, 0)
      indices.push(vi, vi+1, vi+2,  vi+1, vi+3, vi+2)
      vi += 4
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3))
  geo.setIndex(indices)
  return geo
}

/** Builds a slightly wider sidewalk geometry below the road surface */
export function buildSidewalkGeometry(
  multiLineCoords: number[][][],
  widthUnits: number,
  elevation = 0.03
): THREE.BufferGeometry {
  return buildRoadGeometry(multiLineCoords, widthUnits + 1.2, elevation)
}

/** Parse geometryJson safely */
export function parseGeometry(json: string | null): number[][][] | null {
  if (!json) return null
  try {
    const g = JSON.parse(json) as Geometry
    if (g.type === 'MultiLineString') return g.coordinates
    return null
  } catch {
    return null
  }
}

/** Midpoint of the longest segment — for label placement */
export function getLabelPosition(
  multiLineCoords: number[][][]
): [number, number] | null {
  let best: number[][] | null = null
  for (const line of multiLineCoords) {
    if (!best || line.length > best.length) best = line
  }
  if (!best || best.length < 2) return null
  const mid = Math.floor(best.length / 2)
  const [xn, yn] = best[mid]
  return [
    (xn - 0.5) * MAP_SCALE,
    (yn - 0.5) * MAP_SCALE,
  ]
}
