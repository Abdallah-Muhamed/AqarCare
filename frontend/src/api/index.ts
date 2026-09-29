import type {
  PagedResult,
  PropertyListItem,
  PropertyDetail,
  PropertyQuery,
  PackageListItem,
  PackageDetail,
  CityMap,
  MapFilters,
  AuthResponse,
  UserProfile,
  LoginPayload,
  RegisterPayload,
  PropertyInquiry,
  CreateInquiryPayload,
  ApiError
} from '../types'
import { API_BASE_URL } from '../constants/api'

const BASE = '/api'

// ── Auth Token & Session Storage ──────────────────────────────────
export const AUTH_TOKEN_KEY = 'aqarcare_token'
export const AUTH_USER_KEY  = 'aqarcare_user'

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('jwt')
}

export function setAuth(auth: AuthResponse): void {
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token)
  localStorage.setItem('jwt', auth.token) // backward compatibility
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
    userId: auth.userId,
    username: auth.username,
    fullName: auth.fullName || auth.username,
    role: auth.role,
    expiresAt: auth.expiresAt,
  }))
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem('jwt')
  localStorage.removeItem(AUTH_USER_KEY)
  sessionStorage.removeItem('adminApiKey')
}

export function getStoredUser(): { userId?: number; username: string; fullName: string; role: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getAdminApiKey(): string | null {
  return sessionStorage.getItem('adminApiKey')
}

function buildHeaders(options: RequestInit = {}, includeAuth = true): HeadersInit {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (includeAuth) {
    const token = getAuthToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    const apiKey = getAdminApiKey()
    if (apiKey && !headers.has('X-Api-Key')) {
      headers.set('X-Api-Key', apiKey)
    }
  }

  return headers
}

async function request<T>(path: string, options: RequestInit = {}, includeAuth = true): Promise<T> {
  const baseUrl = API_BASE_URL || window.location.origin
  const url = new URL(path, baseUrl)

  const res = await fetch(url.toString(), {
    ...options,
    headers: buildHeaders(options, includeAuth),
  })

  if (!res.ok) {
    if (res.status === 401 && includeAuth) {
      clearAuth()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        const fromUrl = window.location.pathname + window.location.search
        window.location.href = `/login?from=${encodeURIComponent(fromUrl)}`
        return new Promise(() => {}) as Promise<T>
      }
    }

    let errBody: ApiError | null = null
    try {
      errBody = await res.json()
    } catch {
      // not json
    }

    const message = errBody?.message
      || (errBody?.validationErrors ? Object.values(errBody.validationErrors).flat().join(', ') : null)
      || `HTTP ${res.status}: ${res.statusText}`

    const error = new Error(message) as Error & { details?: string; traceId?: string; statusCode?: number }
    error.statusCode = res.status
    error.details = errBody?.details
    error.traceId = errBody?.traceId
    throw error
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T
  }

  return res.json()
}

async function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>, includeAuth = false): Promise<T> {
  const baseUrl = API_BASE_URL || window.location.origin
  const url = new URL(path, baseUrl)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v))
      }
    })
  }

  return request<T>(url.pathname + url.search, { method: 'GET' }, includeAuth)
}

// ── Exported API Client ───────────────────────────────────────────
export const api = {
  // ── Properties ──────────────────────────────────────────────────
  getProperties(q: PropertyQuery = {}): Promise<PagedResult<PropertyListItem>> {
    return get(`${BASE}/properties`, q as Record<string, string | number | boolean | undefined>)
  },
  getProperty(id: number): Promise<PropertyDetail> {
    return get(`${BASE}/properties/${id}`)
  },

  // ── Finishing Packages ──────────────────────────────────────────
  getPackages(): Promise<PackageListItem[]> {
    return get(`${BASE}/finishing-packages`)
  },
  getPackage(idOrSlug: string | number): Promise<PackageDetail> {
    return get(`${BASE}/finishing-packages/${idOrSlug}`)
  },

  // ── Custom Map ──────────────────────────────────────────────────
  getMap(citySlug: string, filters?: MapFilters): Promise<CityMap> {
    return get(`${BASE}/maps/${citySlug}`, filters as Record<string, string | number | boolean | undefined>)
  },

  // ── Authentication ──────────────────────────────────────────────
  async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const payload: LoginPayload = { username: usernameOrEmail, password }
    const result = await request<AuthResponse>(`${BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, false)
    setAuth(result)
    return result
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const result = await request<AuthResponse>(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, false)
    setAuth(result)
    return result
  },

  getMe(): Promise<UserProfile> {
    return request<UserProfile>(`${BASE}/auth/me`, { method: 'GET' }, true)
  },

  // ── Inquiries ───────────────────────────────────────────────────
  createInquiry(propertyId: number, payload: CreateInquiryPayload): Promise<PropertyInquiry> {
    return request<PropertyInquiry>(`${BASE}/properties/${propertyId}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true)
  },

  getMyInquiries(): Promise<PropertyInquiry[]> {
    return request<PropertyInquiry[]>(`${BASE}/inquiries/my`, { method: 'GET' }, true)
  },

  getInquiries(status?: string): Promise<PropertyInquiry[]> {
    const path = status ? `${BASE}/inquiries?status=${encodeURIComponent(status)}` : `${BASE}/inquiries`
    return request<PropertyInquiry[]>(path, { method: 'GET' }, true)
  },

  updateInquiryStatus(id: number, status: string): Promise<PropertyInquiry> {
    return request<PropertyInquiry>(`${BASE}/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true)
  },

  // ── Customer Properties ─────────────────────────────────────────
  getMyProperties(): Promise<PropertyListItem[]> {
    return request<PropertyListItem[]>(`${BASE}/properties/my`, { method: 'GET' }, true)
  },

  getMyProperty(id: number): Promise<PropertyDetail> {
    return request<PropertyDetail>(`${BASE}/properties/my/${id}`, { method: 'GET' }, true)
  },

  createMyProperty(payload: any): Promise<PropertyDetail> {
    return request<PropertyDetail>(`${BASE}/properties/my`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true)
  },

  updateMyProperty(id: number, payload: any): Promise<PropertyDetail> {
    return request<PropertyDetail>(`${BASE}/properties/my/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true)
  },

  deleteMyProperty(id: number): Promise<void> {
    return request<void>(`${BASE}/properties/my/${id}`, {
      method: 'DELETE',
    }, true)
  },

  async uploadMyPropertyMedia(id: number, file: File): Promise<any> {
    const fd = new FormData()
    fd.append('file', file)
    return request<any>(`${BASE}/properties/my/${id}/media/upload`, {
      method: 'POST',
      body: fd,
    }, true)
  },

  removeMyPropertyMedia(id: number, mediaId: number): Promise<void> {
    return request<void>(`${BASE}/properties/my/${id}/media/${mediaId}`, {
      method: 'DELETE',
    }, true)
  },

  // ── Admin Property Moderation / Approval ────────────────────────
  adminSetPublished(id: number, isPublished: boolean): Promise<PropertyDetail> {
    return request<PropertyDetail>(`${BASE}/admin/properties/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }, true)
  },
}
