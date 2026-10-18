// Stufen fürs Smooth-Scrolling (Lenis). lerp = Anteil des Restwegs je Bild: kleiner = weicher und träger.
export const SMOOTH_SCROLL_LEVELS = {
  off: {title: 'Aus', lerp: 0},
  subtle: {title: 'Dezent', lerp: 0.18},
  medium: {title: 'Mittel', lerp: 0.12},
  soft: {title: 'Weich', lerp: 0.08},
} as const
export type SmoothScrollLevel = keyof typeof SMOOTH_SCROLL_LEVELS
export const smoothScrollLerp = (level?: string) =>
  SMOOTH_SCROLL_LEVELS[(level ?? 'subtle') as SmoothScrollLevel]?.lerp ?? SMOOTH_SCROLL_LEVELS.subtle.lerp
