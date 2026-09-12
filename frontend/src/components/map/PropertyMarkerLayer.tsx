import type { MapProperty } from '../../types'
import { statusClass } from './MansheyatMap'

const R  = 8    // marker radius
const PR = 13   // pulse ring radius

interface Props {
  properties: MapProperty[]
  mapW: number
  mapH: number
  selected: MapProperty | null
  onMarkerClick: (prop: MapProperty, svgX: number, svgY: number) => void
}

export default function PropertyMarkerLayer({ properties, mapW, mapH, selected, onMarkerClick }: Props) {
  return (
    <g className="map-markers">
      {properties.map(prop => {
        const cx  = prop.x * mapW
        const cy  = prop.y * mapH
        const cls = statusClass(prop.status)
        const isSel = selected?.id === prop.id
        const isAvail = prop.status === 'Available'

        return (
          <g
            key={prop.id}
            className={`map-marker ${isSel ? 'selected' : ''}`}
            transform={`translate(${cx},${cy})`}
            onClick={e => { e.stopPropagation(); onMarkerClick(prop, cx, cy) }}
            tabIndex={0}
            role="button"
            aria-label={prop.title ?? 'عقار'}
          >
            {/* Pulse for available */}
            {isAvail && (
              <circle className={`map-marker__pulse map-ring--available`} r={PR} cx={0} cy={0} />
            )}

            <g className="map-marker__main">
              {/* Drop shadow */}
              <circle r={R + 1} cx={0} cy={1.5} fill="rgba(0,0,0,.2)" />
              {/* White border */}
              <circle r={R} cx={0} cy={0} fill="#fff" />
              {/* Colored fill */}
              <circle
                className={`map-dot--${cls}`}
                r={R - 2}
                cx={0} cy={0}
                stroke={isSel ? '#fff' : 'none'}
                strokeWidth={isSel ? 2 : 0}
              />
              {/* Selected ring */}
              {isSel && (
                <circle r={R + 3} cx={0} cy={0} fill="none" stroke="#2d4a3e" strokeWidth={2} />
              )}
            </g>
          </g>
        )
      })}
    </g>
  )
}
