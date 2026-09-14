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
import NotFoundPage from './pages/NotFoundPage'
import { ChatBrokerWidget } from './components/chat/ChatBrokerWidget'

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const isMap   = pathname === '/map'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdmin && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/finishing-packages" element={<PackagesPage />} />
          <Route path="/finishing-packages/:slug" element={<PackageDetailPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAdmin && !isMap && <Footer />}
      {!isAdmin && <ChatBrokerWidget />}
    </div>
  )
}

