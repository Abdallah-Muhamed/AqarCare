/**
 * RoadNetwork.tsx — Game-style 3D road rendering
 *
 * Each street = 3 layers stacked vertically:
 *   1. Sidewalk (light stone, y=0.25)
 *   2. Road surface (dark asphalt, y=0.40)
 *   3. Center dashes on major roads (white, y=0.42)
 *
 * Street names rendered with CSS HTML labels via @react-three/drei Html.
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import type { MapStreet } from '../../types'
import { resolveStreetWidth, METERS_TO_UNITS } from '../../constants/streetWidths'

const MAP_SCALE = 100

// ── Geometry helpers ───────────────────────────────────────────────

function buildRibbon(
  coords: number[][][],
  halfW: number,
  y: number
): THREE.BufferGeometry {
  const pos: number[] = []
  const nor: number[] = []
  const idx: number[] = []
  let vi = 0

  for (const line of coords) {
    for (let i = 0; i < line.length - 1; i++) {
      const [x1n, y1n] = line[i]
      const [x2n, y2n] = line[i + 1]

      const x1 = (x1n - 0.5) * MAP_SCALE
      const z1 = (y1n - 0.5) * MAP_SCALE
      const x2 = (x2n - 0.5) * MAP_SCALE
      const z2 = (y2n - 0.5) * MAP_SCALE

      const dx = x2 - x1, dz = z2 - z1
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len < 0.001) continue

      const px = (-dz / len) * halfW
      const pz = ( dx / len) * halfW

      pos.push(
        x1+px, y, z1+pz,
        x1-px, y, z1-pz,
        x2+px, y, z2+pz,
        x2-px, y, z2-pz,
      )
      nor.push(0,1,0, 0,1,0, 0,1,0, 0,1,0)
      idx.push(vi, vi+1, vi+2,  vi+1, vi+3, vi+2)
      vi += 4
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal',   new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}

/** Dashed center line (only for important streets) */
function buildCenterDashes(coords: number[][][], y: number): THREE.BufferGeometry {
  const pos: number[] = []
  const DASH = 0.55, GAP = 0.7, HALF_W = 0.04

  for (const line of coords) {
    for (let i = 0; i < line.length - 1; i++) {
      const [x1n, y1n] = line[i]
      const [x2n, y2n] = line[i + 1]
      const x1 = (x1n - 0.5) * MAP_SCALE, z1 = (y1n - 0.5) * MAP_SCALE
      const x2 = (x2n - 0.5) * MAP_SCALE, z2 = (y2n - 0.5) * MAP_SCALE
      const dx = x2-x1, dz = z2-z1
      const len = Math.sqrt(dx*dx+dz*dz)
      if (len < 0.001) continue
      const ux=dx/len, uz=dz/len
      const px=-uz*HALF_W, pz=ux*HALF_W
      let t = 0
      while (t < len) {
        const t2 = Math.min(t + DASH, len)
        const ax=x1+ux*t, az=z1+uz*t
        const bx=x1+ux*t2, bz=z1+uz*t2
        pos.push(
          ax+px,y,az+pz, ax-px,y,az-pz, bx+px,y,bz+pz,
          ax-px,y,az-pz, bx-px,y,bz-pz, bx+px,y,bz+pz,
        )
        t += DASH + GAP
      }
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  return g
}

/** Centre of longest segment for label */
function labelCenter(coords: number[][][]): [number, number] | null {
  const longest = coords.reduce((a, b) => b.length > a.length ? b : a, coords[0] ?? [])
  if (!longest || longest.length < 2) return null
  const m = Math.floor(longest.length / 2)
  return [
    (longest[m][0] - 0.5) * MAP_SCALE,
    (longest[m][1] - 0.5) * MAP_SCALE,
  ]
}

// ── Road materials (shared) ────────────────────────────────────────
const MAT_ASPHALT  = new THREE.MeshLambertMaterial({ color: '#242424' })
const MAT_SIDEWALK = new THREE.MeshLambertMaterial({ color: '#b8ac90' })
const MAT_MARKING  = new THREE.MeshBasicMaterial({ color: '#ffffff', opacity: 0.8, transparent: true })

// ── Single street ─────────────────────────────────────────────────
function Street({ street }: { street: MapStreet }) {
  const coords = useMemo<number[][][] | null>(() => {
    if (!street.geometryJson) return null
    try {
      const g = JSON.parse(street.geometryJson)
      return g.type === 'MultiLineString' ? g.coordinates : null
    } catch { return null }
  }, [street.geometryJson])

  const widthM    = resolveStreetWidth(street.name, street.widthMeters)
  const halfRoad  = (widthM * METERS_TO_UNITS) / 2
  const halfSide  = halfRoad + 0.35   // sidewalk adds 0.35 units on each side

  const roadGeo   = useMemo(() => coords ? buildRibbon(coords, halfRoad, 0.40) : null, [coords, halfRoad])
  const sideGeo   = useMemo(() => coords ? buildRibbon(coords, halfSide, 0.25) : null, [coords, halfSide])
  const dashGeo   = useMemo(() => (coords && street.importance >= 60) ? buildCenterDashes(coords, 0.42) : null, [coords, street.importance])
  const labelPos  = useMemo(() => coords ? labelCenter(coords) : null, [coords])

  if (!roadGeo || !sideGeo) return null

  // Label only for named, somewhat important streets
  const showLabel  = street.importance >= 35 && !!street.name
  const fontSize   = Math.max(10, Math.min(24, widthM * 0.55))

  return (
    <group>
      {/* Sidewalk */}
      <mesh geometry={sideGeo}  material={MAT_SIDEWALK} castShadow receiveShadow />
      {/* Road */}
      <mesh geometry={roadGeo}  material={MAT_ASPHALT}  castShadow receiveShadow />
      {/* Center dashes */}
      {dashGeo && <mesh geometry={dashGeo} material={MAT_MARKING} />}
      {/* Label */}
      {showLabel && labelPos && (
        <Html position={[labelPos[0], 1.5, labelPos[1]]} center distanceFactor={55} zIndexRange={[0, 50]}>
          <div className="map3d-street-label" style={{ fontSize }}>
            {street.name}
          </div>
        </Html>
      )}
    </group>
  )
}

// ── Full network ──────────────────────────────────────────────────
export default function RoadNetwork({ streets }: { streets: MapStreet[] }) {
  const sorted = useMemo(
    () => [...streets].sort((a, b) => a.importance - b.importance),
    [streets]
  )
  return (
    <group name="roads">
      {sorted.map(s => <Street key={s.id} street={s} />)}
    </group>
  )
}
