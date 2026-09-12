interface Props {
  available: number
  reserved: number
  sold: number
}

export default function MapLegend({ available, reserved, sold }: Props) {
  const total = available + reserved + sold
  return (
    <div className="map-legend">
      <div className="map-legend__item">
        <span className="map-legend__dot map-legend__dot--available" />
        <span>متاح ({available})</span>
      </div>
      <div className="map-legend__item">
        <span className="map-legend__dot map-legend__dot--reserved" />
        <span>محجوز ({reserved})</span>
      </div>
      <div className="map-legend__item">
        <span className="map-legend__dot map-legend__dot--sold" />
        <span>مباع ({sold})</span>
      </div>
      {total === 0 && (
        <div className="map-legend__item" style={{ color: 'var(--clr-text-faint)', fontSize: '.65rem' }}>
          لا توجد وحدات على الخريطة بعد
        </div>
      )}
    </div>
  )
}
