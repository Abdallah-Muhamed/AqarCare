import { useState } from 'react'
import { Html } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { MapProperty } from '../../types'
import { MAP_SCALE } from '../../constants/streetWidths'

const STATUS_COLORS: Record<string, string> = {
  Available: '#16a34a',
  Reserved:  '#d97706',
  Sold:      '#dc2626',
}
const TYPE_LABELS: Record<string, string> = {
  Apartment: 'شقة', Villa: 'فيلا', Studio: 'استوديو', Office: 'مكتب', Shop: 'محل',
}
const LISTING_LABELS: Record<string, string> = {
  Sale: 'للبيع', Rent: 'للإيجار',
}

/** A single 3D property pin with popup */
function PropertyPin({ prop }: { prop: MapProperty }) {
  const [open, setOpen] = useState(false)
  const color  = STATUS_COLORS[prop.status] ?? '#b77a3d'
  const sceneX = (prop.x - 0.5) * MAP_SCALE
  const sceneZ = (prop.y - 0.5) * MAP_SCALE

  return (
    <group position={[sceneX, 0, sceneZ]}>
      {/* Pin pole */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>

      {/* Pin head — clickable sphere */}
      <mesh
        position={[0, 1.35, 0]}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} emissive={color} emissiveIntensity={0.15} />
      </mesh>

      {/* Glow ring at base */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.65, 24]} />
        <meshBasicMaterial color={color} opacity={0.25} transparent side={2} />
      </mesh>

      {/* Shadow disc */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000" opacity={0.18} transparent />
      </mesh>

      {/* Popup HTML */}
      {open && (
        <Html position={[0, 2, 0]} center zIndexRange={[100, 200]}>
          <div className="map3d-pin-popup" style={{ position: 'relative' }}>
            <button className="map3d-pin-popup__close" onClick={e => { e.stopPropagation(); setOpen(false) }}>
              <X size={14} />
            </button>
            <div className="map3d-pin-popup__type">
              {TYPE_LABELS[prop.propertyType ?? ''] ?? prop.propertyType ?? 'عقار'}
              {prop.listingType && ` · ${LISTING_LABELS[prop.listingType] ?? prop.listingType}`}
            </div>
            <div className="map3d-pin-popup__title">{prop.title ?? 'وحدة عقارية'}</div>
            <span className={`map3d-pin-popup__status map3d-pin-popup__status--${prop.status}`}>
              {prop.status === 'Available' ? 'متاح' : prop.status === 'Reserved' ? 'محجوز' : 'مباع'}
            </span>
            {prop.price != null && (
              <div className="map3d-pin-popup__price">
                {prop.price.toLocaleString('ar-EG')}
                <span>جنيه</span>
              </div>
            )}
            {prop.areaSqm != null && (
              <div style={{ fontSize: '.68rem', color: '#7a6e55', marginBottom: '.4rem' }}>
                {prop.areaSqm} م²
              </div>
            )}
            <Link to={`/properties/${prop.id}`} className="map3d-pin-popup__link">
              عرض التفاصيل ←
            </Link>
          </div>
        </Html>
      )}
    </group>
  )
}

interface Props {
  properties: MapProperty[]
}

export default function PropertyPins({ properties }: Props) {
  return (
    <group name="property-pins">
      {properties.map(p => <PropertyPin key={p.id} prop={p} />)}
    </group>
  )
}
