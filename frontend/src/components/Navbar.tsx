import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, MessageSquare, Shield } from 'lucide-react'
import { getStoredUser, clearAuth, getAuthToken } from '../api'
import './Navbar.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState(getStoredUser())
  const hasToken = !!getAuthToken()

  useEffect(() => {
    setUser(getStoredUser())
  }, [location.pathname])

  const handleLogout = () => {
    clearAuth()
    setUser(null)
    navigate('/')
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setOpen(false), [location])

  const baseLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/properties', label: 'العقارات' },
    { to: '/map', label: '🗺 الخريطة' },
  ]

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <img src="/logo-navbar.png" alt="عقار كير" className="navbar__brand-logo" />
          <span className="navbar__brand-name">عقار كير</span>
        </Link>

        {/* Desktop navigation links */}
        <nav className="navbar__links">
          {baseLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar__link ${location.pathname === l.to ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}

          {/* Authenticated user links */}
          {hasToken && (
            <Link
              to="/my-inquiries"
              className={`navbar__link ${location.pathname === '/my-inquiries' ? 'active' : ''}`}
            >
              <MessageSquare size={15} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
              طلباتي
            </Link>
          )}

          {(user?.role === 'Admin' || user?.role === 'Agent') && (
            <Link
              to="/admin"
              className={`navbar__link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              <Shield size={15} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} />
              لوحة الإدارة
            </Link>
          )}

          {/* User badge or Login action */}
          <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {hasToken && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>
                  <User size={12} /> {user.fullName || user.username}
                </span>
                <button
                  type="button"
                  className="navbar__link"
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--clr-danger)' }}
                >
                  <LogOut size={15} /> خروج
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-outline"
                style={{ minHeight: 38, padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <User size={15} /> تسجيل الدخول
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <button className="navbar__toggle" onClick={() => setOpen(o => !o)} aria-label="القائمة">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${open ? 'open' : ''}`}>
        {baseLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`navbar__drawer-link ${location.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}

        {hasToken && (
          <Link
            to="/my-inquiries"
            className={`navbar__drawer-link ${location.pathname === '/my-inquiries' ? 'active' : ''}`}
          >
            طلباتي واستفساراتي
          </Link>
        )}

        {(user?.role === 'Admin' || user?.role === 'Agent') && (
          <Link
            to="/admin"
            className={`navbar__drawer-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            لوحة الإدارة
          </Link>
        )}

        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
          {hasToken && user ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-gold">
                <User size={12} /> {user.fullName || user.username}
              </span>
              <button
                type="button"
                className="navbar__drawer-link"
                onClick={handleLogout}
                style={{ color: 'var(--clr-danger)' }}
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar__drawer-link" style={{ fontWeight: 800, color: 'var(--clr-gold)' }}>
              تسجيل الدخول / إنشاء حساب
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
