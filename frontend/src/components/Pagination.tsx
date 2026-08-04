import { ChevronRight, ChevronLeft } from 'lucide-react'
import './Pagination.css'

interface Props {
  page: number
  totalPages: number
  onChange: (p: number) => void
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)

  return (
    <nav className="pagination">
      <button className="pagination__btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronRight size={18} />
      </button>
      {pages.map(p => (
        <button
          key={p}
          className={`pagination__btn ${p === page ? 'active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button className="pagination__btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronLeft size={18} />
      </button>
    </nav>
  )
}
