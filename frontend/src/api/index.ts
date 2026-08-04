import type { PagedResult, PropertyListItem, PropertyDetail, PropertyQuery, PackageListItem, PackageDetail } from '../types'

const BASE = '/api'

async function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v))
      }
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Properties ───────────────────────────────────────────────────
export const api = {
  getProperties(q: PropertyQuery = {}): Promise<PagedResult<PropertyListItem>> {
    return get(`${BASE}/properties`, q as Record<string, string | number | boolean | undefined>)
  },
  getProperty(id: number): Promise<PropertyDetail> {
    return get(`${BASE}/properties/${id}`)
  },

  // ── Finishing Packages ─────────────────────────────────────────
  getPackages(): Promise<PackageListItem[]> {
    return get(`${BASE}/finishing-packages`)
  },
  getPackage(idOrSlug: string | number): Promise<PackageDetail> {
    return get(`${BASE}/finishing-packages/${idOrSlug}`)
  },
}
