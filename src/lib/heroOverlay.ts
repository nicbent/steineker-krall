// Abdunklung im Hero, damit weißer Text lesbar bleibt: Verlauf von unten (unter dem Titel) plus Grundton über dem ganzen Bild
export const HERO_OVERLAYS = {
  none: {title: 'Aus', bottom: 0, base: 0},
  light: {title: 'Leicht', bottom: 0.35, base: 0.05},
  medium: {title: 'Mittel', bottom: 0.55, base: 0.1},
  strong: {title: 'Stark', bottom: 0.75, base: 0.25},
} as const
export type HeroOverlay = keyof typeof HERO_OVERLAYS
export const heroOverlay = (value?: string) => HERO_OVERLAYS[(value ?? 'medium') as HeroOverlay] ?? HERO_OVERLAYS.medium
