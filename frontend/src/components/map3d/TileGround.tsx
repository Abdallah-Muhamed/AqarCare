/**
 * TileGround.tsx
 * Loads real OpenStreetMap tiles and renders them as textured planes
 * in the Three.js scene — gives us accurate, up-to-date street data
 * with Arabic street names exactly as they appear on OSM.
 */
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

// ── Constants ──────────────────────────────────────────────────────
const ZOOM       = 17
const N          = Math.pow(2, ZOOM)   // 131072
const MAP_SCALE  = 100
const PAD_TILES  = 1   // extra tiles on each side for context

/** Exact bounding box of منشية البكري */
const BOUNDS = {
  minLat: 30.937698,
  maxLat: 30.952062,
  minLon: 31.144212,
  maxLon: 31.153085,
}

// ── Tile math ──────────────────────────────────────────────────────

function lonToTileX(lon: number) {
  return Math.floor((lon + 180) / 360 * N)
}

function latToTileY(lat: number) {
  const r = lat * Math.PI / 180
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * N)
}

/** Top-left (NW) lat/lon of a tile */
function tileNWCorner(tx: number, ty: number) {
  const lon = tx / N * 360 - 180
  const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * ty / N))) * 180 / Math.PI
  return { lat, lon }
}

/** Convert geographic lat/lon → Three.js scene XZ */
function toScene(lat: number, lon: number) {
  const nx = (lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)
  const ny = 1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)
  return {
    x: (nx - 0.5) * MAP_SCALE,
    z: (ny - 0.5) * MAP_SCALE,
  }
}

// ── Tile grid computation ──────────────────────────────────────────

interface TileSpec {
  tx: number; ty: number; url: string
  cx: number; cz: number   // center in scene coords
  w: number;  h: number    // width/height in scene units
}

function buildTileGrid(): TileSpec[] {
  const tx0 = lonToTileX(BOUNDS.minLon) - PAD_TILES
  const tx1 = lonToTileX(BOUNDS.maxLon) + PAD_TILES
  const ty0 = latToTileY(BOUNDS.maxLat) - PAD_TILES  // north = lower tile Y
  const ty1 = latToTileY(BOUNDS.minLat) + PAD_TILES  // south = higher tile Y

  const tiles: TileSpec[] = []

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const nw = tileNWCorner(tx,     ty)      // top-left  (N lat, W lon)
      const se = tileNWCorner(tx + 1, ty + 1)  // bot-right (S lat, E lon)

      const nwScene = toScene(nw.lat, nw.lon)
      const seScene = toScene(se.lat, se.lon)

      tiles.push({
        tx, ty,
        url: `/osm-tiles/${ZOOM}/${tx}/${ty}.png`,
        cx: (nwScene.x + seScene.x) / 2,
        cz: (nwScene.z + seScene.z) / 2,
        w:  Math.abs(seScene.x - nwScene.x),
        h:  Math.abs(seScene.z - nwScene.z),
      })
    }
  }

  return tiles
}

// ── Single tile mesh ───────────────────────────────────────────────

function OsmTile({ spec }: { spec: TileSpec }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let alive = true
    const loader = new THREE.TextureLoader()
    loader.load(
      spec.url,
      (t) => {
        if (!alive) { t.dispose(); return }
        t.colorSpace  = THREE.SRGBColorSpace
        t.minFilter   = THREE.LinearMipmapLinearFilter
        t.magFilter   = THREE.LinearFilter
        t.generateMipmaps = true
        t.needsUpdate = true
        setTex(t)
      },
      undefined,
      () => { /* tile might not exist, fail silently */ }
    )
    return () => { alive = false }
  }, [spec.url])

  if (!tex) return null

  return (
    <mesh
      position={[spec.cx, 0.02, spec.cz]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[spec.w, spec.h]} />
      <meshBasicMaterial map={tex} side={THREE.FrontSide} />
    </mesh>
  )
}

// ── Main export ────────────────────────────────────────────────────

export default function TileGround() {
  const tiles = useMemo(() => buildTileGrid(), [])

  return (
    <group name="tile-ground">
      {/* Fallback base — visible before tiles load */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_SCALE * 2, MAP_SCALE * 2]} />
        <meshBasicMaterial color="#e8dfc8" />
      </mesh>

      {tiles.map(t => (
        <OsmTile key={`${t.tx}-${t.ty}`} spec={t} />
      ))}
    </group>
  )
}
