/**
 * CityBlocks.tsx
 * Procedural low-poly city block geometry:
 * - Raised concrete platform for every block between streets
 * - Simple extruded building boxes (Minecraft / SimCity style)
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import { MAP_SCALE } from '../../constants/streetWidths'

// --- seeded random (deterministic so blocks don't re-shuffle) ---
function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 4294967296
  }
}

// Building color palette (beige/stone residential tones)
const BUILDING_COLORS = [
  '#e0d4b8', '#d8cca8', '#ccc0a0', '#d4c8ac',
  '#e8dcc4', '#dcd0b4', '#d0c4a0', '#c8bc9a',
]

interface Props {
  /** Seed for deterministic block generation */
  seed?: number
}

export default function CityBlocks({ seed = 42 }: Props) {

  // Generate a grid of city blocks
  const blocks = useMemo(() => {
    const rng = seededRng(seed)
    const COLS = 18
    const ROWS = 22
    const BLOCK_W = MAP_SCALE / COLS
    const BLOCK_H = MAP_SCALE / ROWS
    const ROAD_MARGIN = 0.25   // fraction of block width reserved for road gap

    const items: {
      cx: number; cz: number
      bw: number; bh: number    // block dimensions
      buildings: { x: number; z: number; w: number; d: number; h: number; ci: number }[]
    }[] = []

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cx = (col / COLS - 0.5) * MAP_SCALE + BLOCK_W / 2
        const cz = (row / ROWS - 0.5) * MAP_SCALE + BLOCK_H / 2

        // Inner block (inside the road margins)
        const innerW = BLOCK_W * (1 - ROAD_MARGIN * 2)
        const innerH = BLOCK_H * (1 - ROAD_MARGIN * 2)

        // Skip some blocks (parks, open areas ~15%)
        if (rng() < 0.15) continue

        // Generate 1-4 buildings per block
        const numBuildings = 1 + Math.floor(rng() * 3)
        const buildings: { x: number; z: number; w: number; d: number; h: number; ci: number }[] = []

        if (numBuildings === 1) {
          buildings.push({
            x: cx, z: cz,
            w: innerW * (0.7 + rng() * 0.25),
            d: innerH * (0.7 + rng() * 0.25),
            h: 0.6 + rng() * 2.8,
            ci: Math.floor(rng() * BUILDING_COLORS.length),
          })
        } else {
          // Split block into sub-lots
          const cols2 = numBuildings <= 2 ? numBuildings : 2
          const rows2 = numBuildings <= 2 ? 1 : Math.ceil(numBuildings / 2)
          const sw = innerW / cols2
          const sh = innerH / rows2
          let count = 0
          for (let r2 = 0; r2 < rows2 && count < numBuildings; r2++) {
            for (let c2 = 0; c2 < cols2 && count < numBuildings; c2++) {
              buildings.push({
                x: cx - innerW/2 + (c2 + 0.5) * sw,
                z: cz - innerH/2 + (r2 + 0.5) * sh,
                w: sw * (0.65 + rng() * 0.25),
                d: sh * (0.65 + rng() * 0.25),
                h: 0.5 + rng() * 2.5,
                ci: Math.floor(rng() * BUILDING_COLORS.length),
              })
              count++
            }
          }
        }

        items.push({ cx, cz, bw: BLOCK_W, bh: BLOCK_H, buildings })
      }
    }
    return items
  }, [seed])

  // Merged geometry for all building walls
  const buildingMeshes = useMemo(() => {
    // Group by color index for fewer draw calls
    const groups: Map<number, {
      positions: number[], normals: number[], indices: number[], vi: number
    }> = new Map()

    for (const block of blocks) {
      for (const b of block.buildings) {
        if (!groups.has(b.ci)) {
          groups.set(b.ci, { positions: [], normals: [], indices: [], vi: 0 })
        }
        const g = groups.get(b.ci)!
        const hw = b.w / 2, hd = b.d / 2, h = b.h
        const x = b.x, z = b.z, y0 = 0.3, y1 = y0 + h

        // Box geometry (6 faces)
        const verts = [
          // Top
          [x-hw,y1,z-hd], [x+hw,y1,z-hd], [x+hw,y1,z+hd], [x-hw,y1,z+hd],
          // Front (z+)
          [x-hw,y0,z+hd], [x+hw,y0,z+hd], [x+hw,y1,z+hd], [x-hw,y1,z+hd],
          // Back (z-)
          [x+hw,y0,z-hd], [x-hw,y0,z-hd], [x-hw,y1,z-hd], [x+hw,y1,z-hd],
          // Right (x+)
          [x+hw,y0,z+hd], [x+hw,y0,z-hd], [x+hw,y1,z-hd], [x+hw,y1,z+hd],
          // Left (x-)
          [x-hw,y0,z-hd], [x-hw,y0,z+hd], [x-hw,y1,z+hd], [x-hw,y1,z-hd],
        ]
        const norms = [
          [0,1,0],[0,1,0],[0,1,0],[0,1,0],
          [0,0,1],[0,0,1],[0,0,1],[0,0,1],
          [0,0,-1],[0,0,-1],[0,0,-1],[0,0,-1],
          [1,0,0],[1,0,0],[1,0,0],[1,0,0],
          [-1,0,0],[-1,0,0],[-1,0,0],[-1,0,0],
        ]

        const base = g.vi
        for (let i = 0; i < verts.length; i++) {
          g.positions.push(...verts[i])
          g.normals.push(...norms[i])
        }
        // 5 quads (top + 4 walls), each = 2 triangles
        for (let f = 0; f < 5; f++) {
          const b0 = base + f * 4
          g.indices.push(b0, b0+1, b0+2,  b0, b0+2, b0+3)
        }
        g.vi += verts.length
      }
    }

    return Array.from(groups.entries()).map(([ci, g]) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(g.positions, 3))
      geo.setAttribute('normal',   new THREE.Float32BufferAttribute(g.normals,   3))
      geo.setIndex(g.indices)
      return { geo, color: BUILDING_COLORS[ci] }
    })
  }, [blocks])

  return (
    <group name="city-blocks">
      {buildingMeshes.map(({ geo, color }, i) => (
        <mesh key={i} geometry={geo} castShadow receiveShadow>
          <meshLambertMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}
