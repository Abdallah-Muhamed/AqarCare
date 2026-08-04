import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  const links = [
    { to: '/', label: 'الرئيسية' },
    { to: '/properties', label: 'العقارات' },
    { to: '/finishing-packages', label: 'باقات التشطيب' },
  ]

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src="/logo.png" alt="AqarCare" className="navbar__logo-img" />
        </Link>

        {/* Desktop links */}
        <nav className="navbar__links">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar__link ${location.pathname === l.to ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button className="navbar__toggle" onClick={() => setOpen(o => !o)} aria-label="القائمة">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${open ? 'open' : ''}`}>
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`navbar__drawer-link ${location.pathname === l.to ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
