import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import PackagesPage from './pages/PackagesPage'
import PackageDetailPage from './pages/PackageDetailPage'
import AdminPanelPage from './pages/AdminPanelPage'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import MyInquiriesPage from './pages/MyInquiriesPage'
import MyPropertiesPage from './pages/MyPropertiesPage'
import NotFoundPage from './pages/NotFoundPage'
import { initUtmTracking } from './utils/analytics'

export default function App() {
  const { pathname, search } = useLocation()
  const isPortal = pathname.startsWith('/admin') || pathname.startsWith('/my-properties')
  const isMap   = pathname === '/map'

  useEffect(() => {
    initUtmTracking()
  }, [pathname, search])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isPortal && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/finishing-packages" element={<PackagesPage />} />
          <Route path="/finishing-packages/:slug" element={<PackageDetailPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-inquiries" element={<MyInquiriesPage />} />
          <Route path="/my-properties" element={<MyPropertiesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isPortal && !isMap && <Footer />}
    </div>
  )
}
