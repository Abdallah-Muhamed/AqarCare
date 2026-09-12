/**
 * Map3DScene.tsx
 *
 * A true isometric 3D scene:
 * - Ground = the user's uploaded map image (real streets, real labels)
 * - 3D road extrusions on top for depth
 * - 3D property pins
 * - Natural lighting (no game colors)
 * - Dramatic perspective camera
 */
import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { CityMap } from '../../types'
import ImageMapGround from './ImageMapGround'
import PropertyPins from './PropertyPins'

// ── Camera setup ───────────────────────────────────────────────────
function CameraRig({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree()

  useEffect(() => {
    // Dramatic 3D perspective — like looking at a city from a tall building
    // 45° azimuth (northeast), ~42° elevation
    camera.position.set(70, 75, 70)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return (
    <OrbitControls
      ref={controlsRef as React.RefObject<any>}
      target={[0, 0, 0]}
      enableDamping
      dampingFactor={0.06}
      minPolarAngle={Math.PI / 12}     // 15° — nearly top-down
      maxPolarAngle={Math.PI / 2.3}    // ~78° — very horizontal if desired
      minDistance={10}
      maxDistance={280}
      panSpeed={1.1}
      rotateSpeed={0.45}
      zoomSpeed={1.1}
      mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  )
}

interface Props {
  data: CityMap
}

export default function Map3DScene({ data }: Props) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 52, near: 0.5, far: 900 }}
      style={{ background: '#c8d8e8' }}   // natural hazy sky
    >
      {/* ── Lighting ── natural sunlight, no game colors ── */}
      <ambientLight intensity={0.8} color="#f0f4ff" />
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.4}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={400}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-bias={-0.0004}
      />
      {/* Subtle fill from opposite side */}
      <directionalLight position={[-40, 60, -50]} intensity={0.4} color="#d0e8ff" />
      {/* Depth fog — natural haze */}
      <fog attach="fog" args={['#c8d8e8', 220, 500]} />

      {/* Camera */}
      <CameraRig controlsRef={controlsRef} />

      {/* ── Scene ── */}
      <Suspense fallback={null}>
        {/* 1. Map image as ground (the user's uploaded screenshot) */}
        <ImageMapGround />

        {/* 2. Property pins — tall 3D markers with shadow */}
        {data.properties.length > 0 && (
          <PropertyPins properties={data.properties} />
        )}
      </Suspense>
    </Canvas>
  )
}
