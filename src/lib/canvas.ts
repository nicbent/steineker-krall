// Gemeinsame Logik der „Freien Fläche“ für Website und Studio-Editor

// 12 Spalten; Zeilen so viele wie belegt. Jede Zeile hat eine Mindesthöhe (Anteil der Spaltenbreite)
// und wächst, wenn ein Text mehr Platz braucht.
export const CANVAS_COLUMNS = 12
export const CANVAS_MAX_ROWS = 48

export const CANVAS_ROW_HEIGHTS = {
  low: {title: 'Niedrig', factor: 0.5625},
  medium: {title: 'Mittel', factor: 0.75},
  high: {title: 'Hoch', factor: 1},
} as const
export type CanvasRowHeight = keyof typeof CANVAS_ROW_HEIGHTS
export const rowFactor = (rowHeight?: string) => CANVAS_ROW_HEIGHTS[(rowHeight ?? 'medium') as CanvasRowHeight]?.factor ?? 0.75

/** Anzahl belegter Zeilen */
export const usedRows = (areas: {row: number; height: number}[]) => Math.max(1, ...areas.map((a) => a.row + a.height - 1))

// Absatzformate im Text-Element: die Stufen der Website-Skala (Klasse für die Website). cqw ist nur für die
// Vorschau im Editor: Größe relativ zur Flächenbreite, wie sie bei 1440 px Fensterbreite (1232 px Fläche) ausfällt.
export const CANVAS_TEXT_STYLES = {
  h1: {title: 'H1', cqw: 2.71, className: 'text-h1', tag: 'h1'}, // 33,5 px
  h2: {title: 'H2', cqw: 2.24, className: 'text-h2', tag: 'h2'}, // 27,5 px
  h3: {title: 'H3', cqw: 1.92, className: 'text-h3', tag: 'h3'}, // 23,5 px
  h4: {title: 'H4', cqw: 1.65, className: 'text-h4', tag: 'h4'}, // 20,5 px
  lead: {title: 'Einleitung', cqw: 1.83, className: 'text-lead', tag: 'p'}, // 22,5 px
  normal: {title: 'Normal', cqw: 1.46, className: 'text-body', tag: 'p'}, // 18 px
  small: {title: 'Klein', cqw: 1.22, className: 'text-small', tag: 'p'}, // 15 px
} as const
export type CanvasTextStyle = keyof typeof CANVAS_TEXT_STYLES
export const canvasTextStyle = (style?: string) => CANVAS_TEXT_STYLES[(style ?? 'normal') as CanvasTextStyle] ?? CANVAS_TEXT_STYLES.normal
// Der Link mit Pfeil unter dem Text hat die Größe von normalem Fließtext
export const CANVAS_LINK_CQW = CANVAS_TEXT_STYLES.normal.cqw

// Parallax: Stufen −3 … +3. Je Stufe verschiebt sich ein Element um 6 % seines Abstands zur Fenstermitte,
// bei Stufe 3 also um bis zu knapp ein Fünftel einer Fensterhöhe. Negativ = langsamer als die Seite, positiv = schneller.
export const PARALLAX_STEP = 0.06
export const PARALLAX_LEVELS = [-3, -2, -1, 0, 1, 2, 3] as const

export interface CanvasArea {
  column: number
  row: number
  width: number
  height: number
}

export function clampArea(area: CanvasArea): CanvasArea {
  const width = Math.min(Math.max(1, Math.round(area.width)), CANVAS_COLUMNS)
  const height = Math.min(Math.max(1, Math.round(area.height)), CANVAS_MAX_ROWS)
  const column = Math.min(Math.max(1, Math.round(area.column)), CANVAS_COLUMNS - width + 1)
  const row = Math.min(Math.max(1, Math.round(area.row)), CANVAS_MAX_ROWS - height + 1)
  return {column, row, width, height}
}

export function areasOverlap(a: CanvasArea, b: CanvasArea): boolean {
  return (
    a.column < b.column + b.width &&
    b.column < a.column + a.width &&
    a.row < b.row + b.height &&
    b.row < a.row + a.height
  )
}

/** Erstes freies Feld der gewünschten Größe (Lesereihenfolge), sonst unter allen anderen */
export function findFreeArea(areas: CanvasArea[], width: number, height: number): CanvasArea {
  const last = areas.length ? usedRows(areas) : 0
  for (let row = 1; row <= Math.min(last + 1, CANVAS_MAX_ROWS - height + 1); row++) {
    for (let column = 1; column <= CANVAS_COLUMNS - width + 1; column++) {
      const candidate = {column, row, width, height}
      if (!areas.some((area) => areasOverlap(area, candidate))) return candidate
    }
  }
  return {column: 1, row: Math.min(last + 1, CANVAS_MAX_ROWS - height + 1), width, height}
}
