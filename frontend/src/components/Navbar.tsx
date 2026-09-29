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
    setOpen(false)
    navigate('/')
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 15)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setOpen(false), [location])

  const baseLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/properties', label: 'العقارات' },
    { to: '/map', label: '🗺 الخريطة' },
  ]

  const userInitial = (user?.fullName || user?.username || 'U').charAt(0).toUpperCase()
  const roleLabel = user?.role === 'Admin' ? 'مدير' : user?.role === 'Agent' ? 'وسيط' : 'عميل'

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Brand & Main Navigation */}
        <div className="navbar__start">
          <Link to="/" className="navbar__brand">
            <img src="/logo-navbar.png" alt="عقار كير" className="navbar__brand-logo" />
            <span className="navbar__brand-name">عقار كير</span>
          </Link>

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

            {hasToken && (
              <Link
                to="/my-inquiries"
                className={`navbar__link ${location.pathname === '/my-inquiries' ? 'active' : ''}`}
              >
                <MessageSquare size={15} />
                <span>طلباتي</span>
              </Link>
            )}

            {(user?.role === 'Admin' || user?.role === 'Agent') && (
              <Link
                to="/admin"
                className={`navbar__link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              >
                <Shield size={15} />
                <span>لوحة الإدارة</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Auth Actions (Desktop & Mobile) */}
        <div className="navbar__actions">
          {hasToken && user ? (
            <div className="navbar__user-pill" title={`${user.fullName} (${roleLabel})`}>
              <div className="navbar__user-avatar">{userInitial}</div>
              <div className="navbar__user-details">
                <span className="navbar__user-name">{user.fullName || user.username}</span>
                <span className="navbar__user-role">{roleLabel}</span>
              </div>
              <button
                type="button"
                className="navbar__logout-btn"
                onClick={handleLogout}
                title="تسجيل الخروج"
                aria-label="تسجيل الخروج"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar__login-btn">
              <User size={15} />
              <span>تسجيل الدخول</span>
            </Link>
          )}

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            className="navbar__toggle"
            onClick={() => setOpen(o => !o)}
            aria-label="فتح القائمة"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`navbar__drawer ${open ? 'open' : ''}`}>
        {hasToken && user ? (
          <div className="navbar__drawer-user">
            <div className="navbar__drawer-user-info">
              <div className="navbar__user-avatar navbar__user-avatar--large">{userInitial}</div>
              <div>
                <div className="navbar__drawer-user-name">{user.fullName || user.username}</div>
                <div className="navbar__drawer-user-role">
                  {user.role === 'Admin' ? 'مدير النظام' : user.role === 'Agent' ? 'وسيط عقاري' : 'عميل مسجل'}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="navbar__drawer-logout"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <div className="navbar__drawer-auth">
            <Link to="/login" className="navbar__drawer-login-btn">
              <User size={16} />
              تسجيل الدخول / إنشاء حساب
            </Link>
          </div>
        )}

        <div className="navbar__drawer-nav">
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
              <MessageSquare size={16} />
              طلباتي واستفساراتي
            </Link>
          )}

          {(user?.role === 'Admin' || user?.role === 'Agent') && (
            <Link
              to="/admin"
              className={`navbar__drawer-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              <Shield size={16} />
              لوحة الإدارة
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
