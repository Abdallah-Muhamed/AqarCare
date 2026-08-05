/** ألوان بصرية لتمييز الباقات — للعرض فقط، وليست جزءاً من التسمية */
export interface TierColor {
  from: string
  to: string
  accent: string
  dim: string
}

export const TIER_COLORS: Record<string, TierColor> = {
  essential: {
    from: '#3b82f6',
    to: '#1d4ed8',
    accent: '#60a5fa',
    dim: 'rgba(59, 130, 246, 0.18)',
  },
  bronze: {
    from: '#d97706',
    to: '#92400e',
    accent: '#f59e0b',
    dim: 'rgba(217, 119, 6, 0.18)',
  },
  silver: {
    from: '#94a3b8',
    to: '#475569',
    accent: '#cbd5e1',
    dim: 'rgba(148, 163, 184, 0.18)',
  },
  gold: {
    from: '#c9a84c',
    to: '#92650a',
    accent: '#e8c76a',
    dim: 'rgba(201, 168, 76, 0.18)',
  },
  platinum: {
    from: '#06b6d4',
    to: '#0e7490',
    accent: '#22d3ee',
    dim: 'rgba(6, 182, 212, 0.18)',
  },
  diamond: {
    from: '#8b5cf6',
    to: '#5b21b6',
    accent: '#a78bfa',
    dim: 'rgba(139, 92, 246, 0.18)',
  },
}

export function getTierColors(slug: string): TierColor {
  return TIER_COLORS[slug] ?? TIER_COLORS.essential
}
