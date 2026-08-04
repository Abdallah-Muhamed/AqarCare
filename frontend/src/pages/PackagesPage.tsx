import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { api } from '../api'
import type { PackageListItem } from '../types'
import PackageCard from '../components/PackageCard'
import './PackagesPage.css'

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPackages()
      .then(setPackages)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pkgs-page">
      {/* Page header */}
      <div className="pkgs-page__header">
        <div className="container pkgs-page__header-inner">
          <div>
            <h1 className="section-title">باقات <span>التشطيب</span></h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              {loading ? 'جاري التحميل...' : `${packages.length} باقة تشطيب احترافية`}
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container section-sm">
        {loading ? (
          <div className="row">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="col-12 col-md-4 col-lg-4"><div className="skeleton" style={{ height: 420 }} /></div>)}
          </div>
        ) : packages.length === 0 ? (
          <div className="empty-state">
            <Search size={56} />
            <h3>لا توجد باقات متاحة</h3>
            <p>يرجى التواصل معنا للاستفسار عن الباقات المتاحة</p>
          </div>
        ) : (
          <div className="row">
            {packages.sort((a, b) => a.sortOrder - b.sortOrder).map(pkg => (
              <div key={pkg.id} className="col-12 col-md-4 col-lg-4"><PackageCard pkg={pkg} /></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
