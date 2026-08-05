import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import type { PropertyMedia } from '../types'
import './ImageGallery.css'

interface Props { media: PropertyMedia[] }

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'

export default function ImageGallery({ media }: Props) {
  const list = media.length ? media : [{ id: 0, mediaType: 'Image', url: PLACEHOLDER, sortOrder: 0 }]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const activeMedia = list[active]
  const isVideo = activeMedia.mediaType.toLowerCase() === 'video'

  const prev = () => setActive(i => (i - 1 + list.length) % list.length)
  const next = () => setActive(i => (i + 1) % list.length)

  return (
    <div className="gallery">
      {/* Main image */}
      <div className="gallery__main" onClick={() => setLightbox(true)}>
        {isVideo ? (
          <video src={activeMedia.url} className="gallery__main-img" controls onClick={e => e.stopPropagation()} />
        ) : (
          <img src={activeMedia.url} alt="" className="gallery__main-img" />
        )}
        <button className="gallery__zoom"><ZoomIn size={18} /></button>
        {list.length > 1 && (
          <>
            <button className="gallery__nav gallery__nav--prev" onClick={e => { e.stopPropagation(); prev() }}><ChevronRight size={20} /></button>
            <button className="gallery__nav gallery__nav--next" onClick={e => { e.stopPropagation(); next() }}><ChevronLeft size={20} /></button>
          </>
        )}
        <div className="gallery__counter">{active + 1} / {list.length}</div>
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="gallery__thumbs">
          {list.map((img, i) => (
            <button key={img.id} className={`gallery__thumb ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>
              {img.mediaType.toLowerCase() === 'video'
                ? <video src={img.url} muted preload="metadata" />
                : <img src={img.url} alt="" />}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
          <div className="gallery__lightbox" onClick={() => setLightbox(false)}>
            <button className="gallery__lb-close"><X size={24} /></button>
            <button className="gallery__lb-nav gallery__lb-nav--prev" onClick={e => { e.stopPropagation(); prev() }}><ChevronRight size={28} /></button>
          {isVideo ? (
            <video src={activeMedia.url} className="gallery__lb-img" controls autoPlay onClick={e => e.stopPropagation()} />
          ) : (
            <img src={activeMedia.url} alt="" className="gallery__lb-img" onClick={e => e.stopPropagation()} />
          )}
          <button className="gallery__lb-nav gallery__lb-nav--next" onClick={e => { e.stopPropagation(); next() }}><ChevronLeft size={28} /></button>
        </div>
      )}
    </div>
  )
}
