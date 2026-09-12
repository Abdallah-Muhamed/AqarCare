/**
 * ImageMapGround.tsx
 *
 * Uses the uploaded map screenshot directly as the 3D ground texture.
 * The image is positioned according to the known bounding box of
 * منشية البكري so that property pins align correctly.
 *
 * Geographic bounds of the image (estimated from the map screenshot):
 *   minLat 30.934  maxLat 30.956
 *   minLon 31.139  maxLon 31.159
 *
 * Our property coordinate system uses:
 *   x = (lon - 31.144212) / (31.153085 - 31.144212)  → 0–1
 *   y = 1 - (lat - 30.937698) / (30.952062 - 30.937698) → 0–1
 */
import { useEffect, useState } from 'react'
import * as THREE from 'three'

const MAP_SCALE = 100

// ── Image geographic bounds (estimated from the screenshot) ────────
// The screenshot shows a slightly wider view than our property bounds.
// We need to know where our property coordinate origin falls within the image.

// Image bounds (what the screenshot covers):
const IMG_BOUNDS = {
  minLat: 30.934,
  maxLat: 30.956,
  minLon: 31.139,
  maxLon: 31.160,
}

// Property coord bounds (what 0–1 maps to):
const PROP_BOUNDS = {
  minLat: 30.937698,
  maxLat: 30.952062,
  minLon: 31.144212,
  maxLon: 31.153085,
}

// In scene units, where does the full image sit relative to our map center?
// Map center = midpoint of PROP_BOUNDS
const propCenterLat = (PROP_BOUNDS.minLat + PROP_BOUNDS.maxLat) / 2
const propCenterLon = (PROP_BOUNDS.minLon + PROP_BOUNDS.maxLon) / 2

// Width / height of PROP_BOUNDS in degrees
const propDegW = PROP_BOUNDS.maxLon - PROP_BOUNDS.minLon

// Scale: MAP_SCALE units = propDegW longitude
const degToScene = MAP_SCALE / propDegW

// Image size in scene units
const imgSceneW = (IMG_BOUNDS.maxLon - IMG_BOUNDS.minLon) * degToScene
const imgSceneH = (IMG_BOUNDS.maxLat - IMG_BOUNDS.minLat) * degToScene

// Image center offset from property center (in scene units)
const imgCenterLon = (IMG_BOUNDS.minLon + IMG_BOUNDS.maxLon) / 2
const imgCenterLat = (IMG_BOUNDS.minLat + IMG_BOUNDS.maxLat) / 2
const imgOffsetX   = (imgCenterLon - propCenterLon) * degToScene
// Note: lat increases upward but scene Z increases "south", so flip:
const imgOffsetZ   = -(imgCenterLat - propCenterLat) * degToScene

export default function ImageMapGround() {
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      '/map-texture.png',
      (t) => {
        t.colorSpace       = THREE.SRGBColorSpace
        t.minFilter        = THREE.LinearMipmapLinearFilter
        t.magFilter        = THREE.LinearFilter
        t.generateMipmaps  = true
        t.anisotropy       = 16   // sharp at low angle
        t.needsUpdate      = true
        setTex(t)
      },
      undefined,
      (err) => console.error('Failed to load map-texture.png', err)
    )
  }, [])

  return (
    <group name="image-map-ground">
      {/* Background plane (matches sky / outer area color) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[MAP_SCALE * 3, MAP_SCALE * 3]} />
        <meshBasicMaterial color="#e8e0d0" />
      </mesh>

      {/* The actual map image */}
      {tex && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[imgOffsetX, 0, imgOffsetZ]}
          receiveShadow
        >
          <planeGeometry args={[imgSceneW, imgSceneH]} />
          <meshBasicMaterial map={tex} side={THREE.FrontSide} />
        </mesh>
      )}

      {/* OSM attribution */}
    </group>
  )
}
