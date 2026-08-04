/** ألوان بصرية لتمييز الباقات — للعرض فقط، وليست جزءاً من التسمية */
export interface TierColor {
  from: string
  to: string
  accent: string
  dim: string
}

export const TIER_COLORS: Record<string, TierColor> = {
  essential: {
    from: '#6b7280',
    to: '#4b5563',
    accent: '#6b7280',
    dim: 'rgba(107, 114, 128, 0.15)',
  },
  bronze: {
    from: '#cd7f32',
    to: '#8b5a2b',
    accent: '#cd7f32',
    dim: 'rgba(205, 127, 50, 0.15)',
  },
  silver: {
    from: '#c0c0c0',
    to: '#a8a8a8',
    accent: '#c0c0c0',
    dim: 'rgba(192, 192, 192, 0.15)',
  },
  gold: {
    from: '#ffd700',
    to: '#daa520',
    accent: '#ffd700',
    dim: 'rgba(255, 215, 0, 0.15)',
  },
  platinum: {
    from: '#00bcd4',
    to: '#00838f',
    accent: '#00bcd4',
    dim: 'rgba(0, 188, 212, 0.15)',
  },
  diamond: {
    from: '#9b59b6',
    to: '#6c3483',
    accent: '#9b59b6',
    dim: 'rgba(155, 89, 182, 0.15)',
  },
}

export function getTierColors(slug: string): TierColor {
  return TIER_COLORS[slug] ?? TIER_COLORS.essential
}
