/**
 * UTM & Lead Attribution Analytics Helper for AqarCare
 * Captures campaign parameters from Facebook Ads / Google / referrals
 * and persists them for lead attribution in WhatsApp inquiries.
 */

export interface UtmTrackingData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  landingPage?: string
  referrer?: string
  capturedAt: string
}

const STORAGE_SESSION_KEY = 'aqar_utm_tracking'
const STORAGE_PERSISTENT_KEY = 'aqar_utm_persistent'
export const WHATSAPP_PHONE = '201055937687'

const CAMPAIGN_FRIENDLY_NAMES: Record<string, string> = {
  under_million: 'شقق ومنازل أقل من مليون',
  under_1m: 'شقق أقل من مليون',
  installment_prime: 'استلام فوري بالتقسيط',
  installment: 'عقارات بالتقسيط المباشر',
  invest_high_roi: 'فرص استثمارية وتجارية',
  commercial_land: 'أراضي ومحلات تجارية',
  villas_houses: 'بيوت ومنازل عائلية كاملة',
  luxury_apartments: 'شقق مميزة وتشطيب سوبر لوكس',
  fb_campaign_1: 'حملة فيسبوك - فئة أقل من مليون',
  fb_campaign_2: 'حملة فيسبوك - استلام فوري وتقسيط',
  fb_campaign_3: 'حملة فيسبوك - استثمار وأراضي',
}

/**
 * Initializes UTM capturing on application boot or page navigation.
 * Saves detected query parameters into sessionStorage and localStorage.
 */
export function initUtmTracking(): void {
  if (typeof window === 'undefined') return

  try {
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')
    const utmContent = params.get('utm_content')
    const utmTerm = params.get('utm_term')
    const fbclid = params.get('fbclid')
    const gclid = params.get('gclid')

    if (utmSource || utmCampaign || fbclid || gclid) {
      const data: UtmTrackingData = {
        utm_source: utmSource || (fbclid ? 'facebook' : gclid ? 'google' : undefined),
        utm_medium: utmMedium || (fbclid || gclid ? 'cpc' : undefined),
        utm_campaign: utmCampaign || undefined,
        utm_content: utmContent || undefined,
        utm_term: utmTerm || undefined,
        fbclid: fbclid || undefined,
        gclid: gclid || undefined,
        landingPage: window.location.pathname + window.location.search,
        referrer: document.referrer || undefined,
        capturedAt: new Date().toISOString(),
      }

      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(data))
      localStorage.setItem(STORAGE_PERSISTENT_KEY, JSON.stringify(data))
    }
  } catch (err) {
    console.debug('Failed to record UTM analytics:', err)
  }
}

/**
 * Retrieves stored UTM attribution data, prioritizing sessionStorage then localStorage.
 */
export function getStoredUtm(): UtmTrackingData | null {
  if (typeof window === 'undefined') return null

  try {
    const rawSession = sessionStorage.getItem(STORAGE_SESSION_KEY)
    if (rawSession) return JSON.parse(rawSession) as UtmTrackingData

    const rawLocal = localStorage.getItem(STORAGE_PERSISTENT_KEY)
    if (rawLocal) return JSON.parse(rawLocal) as UtmTrackingData
  } catch (err) {
    console.debug('Failed to read UTM analytics:', err)
  }

  return null
}

/**
 * Converts a raw campaign tag or source to a human-readable Arabic description.
 */
export function getCampaignAttributionText(): string | null {
  const utm = getStoredUtm()
  if (!utm) return null

  const parts: string[] = []

  if (utm.utm_campaign) {
    const friendlyName = CAMPAIGN_FRIENDLY_NAMES[utm.utm_campaign.toLowerCase()] 
      || utm.utm_campaign.replace(/[-_]/g, ' ')
    parts.push(friendlyName)
  }

  if (utm.utm_source) {
    const sourceMap: Record<string, string> = {
      facebook: 'فيسبوك',
      fb: 'فيسبوك',
      instagram: 'إنستجرام',
      google: 'جوجل',
      tiktok: 'تيك توك',
      whatsapp: 'واتساب',
    }
    const sourceLabel = sourceMap[utm.utm_source.toLowerCase()] || utm.utm_source
    parts.push(sourceLabel)
  }

  return parts.length > 0 ? parts.join(' • ') : null
}

export interface PropertyWhatsAppPayload {
  id: number | string
  title?: string | null
  price?: number | null
  installmentPrice?: number | null
  propertyType?: string | null
  district?: string | null
  city?: string | null
  isSold?: boolean
}

/**
 * Formats a comprehensive, sales-optimized WhatsApp message for property inquiries.
 */
export function buildPropertyWhatsAppMessage(p: PropertyWhatsAppPayload): string {
  const locationText = [p.district, p.city].filter(Boolean).join('، ') || 'المحلة الكبرى'
  const campaignAttribution = getCampaignAttributionText()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const propertyUrl = origin ? `${origin}/properties/${p.id}` : ''

  const priceLines: string[] = []
  if (p.price != null && p.price > 0) {
    priceLines.push(`💵 السعر كاش: ${p.price.toLocaleString('ar-EG')} جنيه`)
  }
  if (p.installmentPrice != null && p.installmentPrice > 0) {
    priceLines.push(`💳 السعر تقسيط: ${p.installmentPrice.toLocaleString('ar-EG')} جنيه`)
  }

  if (p.isSold) {
    const msg = [
      'السلام عليكم ورحمة الله وبركاته،',
      `أود الاستفسار عن بدائل ومقترحات مشابهة للوحدة رقم #${p.id}:`,
      `🏢 العنوان: ${p.title || 'وحدة عقارية'}`,
      `📍 المنطقة: ${locationText}`,
      priceLines.length > 0 ? priceLines.join('\n') : null,
      campaignAttribution ? `📊 مصدر الطلب: ${campaignAttribution}` : null,
      propertyUrl ? `🔗 الرابط: ${propertyUrl}` : null,
      'هل تتوفر لديكم وحدات مماثلة حالياً؟',
    ].filter(Boolean).join('\n')

    return msg
  }

  const msg = [
    'السلام عليكم ورحمة الله وبركاته،',
    `أود الاستفسار والتواصل بخصوص العقار رقم #${p.id}:`,
    `🏢 العنوان: ${p.title || 'وحدة عقارية'}`,
    `📍 المنطقة: ${locationText}`,
    priceLines.length > 0 ? priceLines.join('\n') : null,
    campaignAttribution ? `📊 مصدر الإعلان: ${campaignAttribution}` : null,
    propertyUrl ? `🔗 الرابط: ${propertyUrl}` : null,
  ].filter(Boolean).join('\n')

  return msg
}

/**
 * Generates the full WhatsApp URL with encoded message.
 */
export function getPropertyWhatsAppUrl(p: PropertyWhatsAppPayload): string {
  const message = buildPropertyWhatsAppMessage(p)
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
