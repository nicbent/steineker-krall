import '@fontsource-variable/nunito-sans'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {insert, set, setIfMissing, unset, useClient, type ObjectInputProps} from 'sanity'
import {
  CANVAS_COLUMNS,
  CANVAS_MAX_ROWS,
  rowFactor as factorFor,
  usedRows,
  CANVAS_LINK_CQW,
  canvasTextStyle,
  clampArea,
  findFreeArea,
  type CanvasArea,
} from '../../lib/canvas'

export interface CanvasElement extends Partial<CanvasArea> {
  _key: string
  _type: 'canvasImage' | 'canvasVideo' | 'canvasText'
  video?: {asset?: {_ref?: string}}
  poster?: {asset?: {_ref?: string}; hotspot?: {x: number; y: number}}
  image?: {asset?: {_ref?: string}; alt?: string; hotspot?: {x: number; y: number}}
  body?: {_key?: string; style?: string; children?: {text?: string; marks?: string[]}[]}[]
  link?: {label?: string}
  align?: 'center' | 'left'
  background?: 'none' | 'white' | 'dark'
  parallax?: number
}

const areaOf = (element: CanvasElement): CanvasArea =>
  clampArea({column: element.column ?? 1, row: element.row ?? 1, width: element.width ?? 3, height: element.height ?? 3})

const ACCENT = '#2276fc'
const DANGER = '#e5484d'
// Hinweis, dass ein Text auf der Website seine Zeile(n) höher macht (kein Fehler)
const GROW = '#d97706'

interface ViewProps {
  elements: CanvasElement[]
  /** Mindesthöhe einer Zeile als Anteil der Spaltenbreite */
  rowFactor: number
  background?: string
  imageUrl: (element: CanvasElement) => string | undefined
  videoUrl: (element: CanvasElement) => string | undefined
  readOnly?: boolean
  onArea: (key: string, area: CanvasArea) => void
  onAdd: (type: CanvasElement['_type']) => void
  onReorder: (key: string, direction: 'front' | 'back') => void
  onRemove: (key: string) => void
  onEdit: (key: string) => void
}

/**
 * Visueller Editor der Freien Fläche: Elemente verschieben (ziehen), Größe ändern (Ecke ziehen),
 * mit Pfeiltasten verschieben bzw. mit Umschalt + Pfeiltasten Größe ändern. Alles rastet ins Raster ein.
 */
export function CanvasEditorView(props: ViewProps) {
  const {elements, rowFactor, background = '#fff', imageUrl, videoUrl, readOnly, onArea, onAdd, onReorder, onRemove, onEdit} = props
  const surface = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  // Während des Ziehens nur lokal anzeigen; gespeichert wird beim Loslassen
  const [draft, setDraft] = useState<{key: string; area: CanvasArea} | null>(null)
  const drag = useRef<{key: string; mode: 'move' | 'resize'; x: number; y: number; start: CanvasArea; moved: boolean} | null>(
    null,
  )

  const areas = elements.map((element) => (draft?.key === element._key ? draft.area : areaOf(element)))
  // Angezeigte Zeilen: belegte plus Reserve, damit man Elemente nach unten ziehen kann
  const rows = Math.min(CANVAS_MAX_ROWS, Math.max(6, usedRows(areas)) + 3)

  const startDrag = (event: React.PointerEvent, key: string, mode: 'move' | 'resize') => {
    if (readOnly || event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    const element = elements.find((candidate) => candidate._key === key)!
    drag.current = {key, mode, x: event.clientX, y: event.clientY, start: areaOf(element), moved: false}
    setSelected(key)
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: React.PointerEvent) => {
    const current = drag.current
    if (!current || !surface.current) return
    const rect = surface.current.getBoundingClientRect()
    const dx = Math.round(((event.clientX - current.x) / rect.width) * CANVAS_COLUMNS)
    const dy = Math.round(((event.clientY - current.y) / rect.height) * rows)
    if (dx || dy) current.moved = true
    const {start} = current
    const area =
      current.mode === 'move'
        ? clampArea({...start, column: start.column + dx, row: start.row + dy})
        : clampArea({
            ...start,
            width: Math.min(start.width + dx, CANVAS_COLUMNS - start.column + 1),
            height: Math.min(start.height + dy, CANVAS_MAX_ROWS - start.row + 1),
          })
    setDraft({key: current.key, area})
  }

  const endDrag = () => {
    const current = drag.current
    drag.current = null
    if (current?.moved && draft && draft.key === current.key) {
      const a = draft.area
      const s = current.start
      if (a.column !== s.column || a.row !== s.row || a.width !== s.width || a.height !== s.height) onArea(current.key, a)
    }
    setDraft(null)
  }

  const onKeyDown = (event: React.KeyboardEvent, key: string) => {
    if (readOnly) return
    const steps: Record<string, [number, number]> = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}
    const step = steps[event.key]
    if (!step) return
    event.preventDefault()
    const area = areaOf(elements.find((element) => element._key === key)!)
    const next = event.shiftKey
      ? clampArea({...area, width: area.width + step[0], height: area.height + step[1]})
      : clampArea({...area, column: area.column + step[0], row: area.row + step[1]})
    onArea(key, next)
  }

  const selectedIndex = elements.findIndex((element) => element._key === selected)

  return (
    <div style={{display: 'grid', gap: 10}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center'}}>
        <ToolButton disabled={readOnly} onClick={() => onAdd('canvasImage')}>
          + Bild
        </ToolButton>
        <ToolButton disabled={readOnly} onClick={() => onAdd('canvasVideo')}>
          + Video
        </ToolButton>
        <ToolButton disabled={readOnly} onClick={() => onAdd('canvasText')}>
          + Text
        </ToolButton>
        {selected && selectedIndex >= 0 && (
          <>
            <span style={{width: 1, height: 20, background: 'rgba(127,127,127,.3)', margin: '0 4px'}} />
            <ToolButton onClick={() => onEdit(selected)}>Bearbeiten</ToolButton>
            <ToolButton disabled={readOnly || selectedIndex === 0} onClick={() => onReorder(selected, 'front')}>
              Nach vorne
            </ToolButton>
            <ToolButton disabled={readOnly || selectedIndex === elements.length - 1} onClick={() => onReorder(selected, 'back')}>
              Nach hinten
            </ToolButton>
            <ToolButton
              disabled={readOnly}
              danger
              onClick={() => {
                onRemove(selected)
                setSelected(null)
              }}
            >
              Entfernen
            </ToolButton>
          </>
        )}
      </div>

      <div
        ref={surface}
        data-canvas-surface
        onPointerDown={() => setSelected(null)}
        style={{
          position: 'relative',
          aspectRatio: `${CANVAS_COLUMNS} / ${rows * rowFactor}`,
          containerType: 'inline-size',
          backgroundColor: background,
          border: '1px solid rgba(127,127,127,.35)',
          backgroundImage:
            'linear-gradient(to right, rgba(127,127,127,.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(127,127,127,.14) 1px, transparent 1px)',
          backgroundSize: `calc(100% / ${CANVAS_COLUMNS}) calc(100% / ${rows})`,
          userSelect: 'none',
          touchAction: 'none',
          color: '#1d1b1b',
        }}
      >
        {elements.map((element, i) => {
          const area = areas[i]
          const isSelected = selected === element._key
          return (
            <div
              key={element._key}
              data-canvas-element={element._key}
              role="button"
              tabIndex={0}
              aria-label={`${element._type === 'canvasText' ? 'Text' : element._type === 'canvasVideo' ? 'Video' : 'Bild'} ${i + 1}: Spalte ${area.column}, Zeile ${area.row}, ${area.width} × ${area.height}`}
              onPointerDown={(event) => startDrag(event, element._key, 'move')}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onDoubleClick={() => onEdit(element._key)}
              onFocus={() => setSelected(element._key)}
              onKeyDown={(event) => onKeyDown(event, element._key)}
              style={{
                position: 'absolute',
                left: `${((area.column - 1) / CANVAS_COLUMNS) * 100}%`,
                top: `${((area.row - 1) / rows) * 100}%`,
                width: `${(area.width / CANVAS_COLUMNS) * 100}%`,
                height: `${(area.height / rows) * 100}%`,
                zIndex: isSelected ? 1000 : elements.length - i,
                cursor: readOnly ? 'default' : 'move',
                outline: isSelected ? `2px solid ${ACCENT}` : '1px solid rgba(29,27,27,.25)',
                outlineOffset: -1,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {element._type === 'canvasImage' ? (
                <ImagePreview url={imageUrl(element)} hotspot={element.image?.hotspot} />
              ) : element._type === 'canvasVideo' ? (
                <VideoPreview url={videoUrl(element)} poster={imageUrl({...element, image: element.poster})} />
              ) : (
                <TextPreview element={element} />
              )}
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  padding: '1px 6px',
                  borderRadius: 3,
                  fontSize: 11,
                  fontFamily: 'system-ui, sans-serif',
                  background: 'rgba(29,27,27,.75)',
                  color: '#fff',
                  pointerEvents: 'none',
                }}
              >
                {i + 1}
                {element.parallax ? ` · ↕ ${element.parallax > 0 ? '+' : '−'}${Math.abs(element.parallax)}` : ''}
              </span>
              {!readOnly && (
                <span
                  data-canvas-resize
                  onPointerDown={(event) => startDrag(event, element._key, 'resize')}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 16,
                    height: 16,
                    cursor: 'nwse-resize',
                    background: isSelected ? ACCENT : 'rgba(29,27,27,.6)',
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      <div style={{fontSize: 12, opacity: 0.7, fontFamily: 'system-ui, sans-serif'}}>
        Ziehen zum Verschieben, untere rechte Ecke ziehen für die Größe, Doppelklick zum Bearbeiten. Unten kommen beim
        Ziehen automatisch Zeilen dazu; braucht ein Text mehr Platz, wird seine Zeile auf der Website höher (orange markiert). Mit der Tastatur:
        Pfeiltasten verschieben, Umschalt + Pfeiltasten ändern die Größe. Elemente dürfen sich überlappen; die Nummer
        entspricht der Reihenfolge in der Liste (1 liegt vorne, „Nach vorne“/„Nach hinten“ ändert sie).
      </div>
    </div>
  )
}

function ToolButton(props: {children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      style={{
        padding: '6px 10px',
        borderRadius: 4,
        border: '1px solid rgba(127,127,127,.4)',
        background: 'transparent',
        color: props.danger ? DANGER : 'inherit',
        fontSize: 13,
        cursor: props.disabled ? 'default' : 'pointer',
        opacity: props.disabled ? 0.45 : 1,
      }}
    >
      {props.children}
    </button>
  )
}

function VideoPreview({url, poster}: {url?: string; poster?: string}) {
  if (!url)
    return (
      <div style={{height: '100%', display: 'grid', placeItems: 'center', background: 'rgba(127,127,127,.15)', fontSize: 12, fontFamily: 'system-ui, sans-serif'}}>
        Kein Video
      </div>
    )
  return (
    <video
      src={url}
      poster={poster}
      muted
      loop
      autoPlay
      playsInline
      style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none'}}
    />
  )
}

function ImagePreview({url, hotspot}: {url?: string; hotspot?: {x: number; y: number}}) {
  if (!url)
    return (
      <div
        style={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(127,127,127,.15)',
          fontSize: 12,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Kein Bild
      </div>
    )
  return (
    <img
      src={url}
      alt=""
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: hotspot ? `${hotspot.x * 100}% ${hotspot.y * 100}%` : 'center',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}

/** Zeigt den Text in derselben relativen Größe wie auf der Website und warnt, wenn er nicht ins Feld passt */
function TextPreview({element}: {element: CanvasElement}) {
  const box = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(false)
  const dark = element.background === 'dark'

  useEffect(() => {
    const el = box.current
    if (!el) return
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    document.fonts?.ready.then(check)
    return () => observer.disconnect()
  }, [element.body, element.link?.label])

  return (
    <div
      ref={box}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: element.align === 'left' ? 'flex-start' : 'center',
        textAlign: element.align === 'left' ? 'left' : 'center',
        padding: element.background && element.background !== 'none' ? '4cqw' : '0 1cqw',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: "'Nunito Sans Variable', system-ui, sans-serif",
        background: dark ? '#1d1b1b' : element.background === 'white' ? '#fff' : 'rgba(255,255,255,.6)',
        color: dark ? '#fff' : '#1d1b1b',
        pointerEvents: 'none',
        boxShadow: overflow ? `inset 0 -3px 0 ${GROW}` : undefined,
      }}
    >
      {(element.body ?? []).map((block, i) => {
        const style = canvasTextStyle(block.style)
        return (
          <div
            key={block._key ?? i}
            style={{
              fontSize: `${style.cqw}cqw`,
              fontWeight: style.tag === 'p' ? 300 : 700,
              lineHeight: style.tag === "p" ? 1.5 : 1.2,
              letterSpacing: style.tag === 'p' ? undefined : '-0.02em',
              marginTop: i ? '0.7em' : 0,
            }}
          >
            {(block.children ?? []).map((child, j) => (
              <span key={j} style={{fontWeight: child.marks?.includes('strong') ? 700 : undefined, fontStyle: child.marks?.includes('em') ? 'italic' : undefined}}>
                {child.text}
              </span>
            ))}
          </div>
        )
      })}
      {element.link?.label && (
        <div style={{fontSize: `${CANVAS_LINK_CQW}cqw`, textDecoration: 'underline', marginTop: '1.4em'}}>
          {element.link.label} →
        </div>
      )}
      {!element.body?.length && <div style={{fontSize: 12, opacity: 0.6}}>Leerer Text</div>}
      {overflow && (
        <span
          style={{
            position: 'absolute',
            right: 20,
            bottom: 4,
            fontSize: 11,
            fontFamily: 'system-ui, sans-serif',
            color: '#fff',
            background: GROW,
            padding: '1px 6px',
            borderRadius: 3,
          }}
        >
          Zeile wird höher
        </span>
      )}
    </div>
  )
}

/** Kurzer Name eines Elements für Listen */
function labelOf(element: CanvasElement) {
  if (element._type === 'canvasText') {
    const text = (element.body ?? []).flatMap((b) => b.children ?? []).map((c) => c.text).join(' ').trim()
    return text ? (text.length > 60 ? text.slice(0, 60) + '…' : text) : 'Leerer Text'
  }
  if (element._type === 'canvasVideo') return 'Video'
  return element.image?.alt || 'Bild'
}

/** Liste der Elemente in Handy-Reihenfolge, per Pfeil sortierbar */
export function MobileOrderList(props: {
  elements: CanvasElement[]
  sequence: string[]
  thumbnail: (element: CanvasElement) => string | undefined
  readOnly?: boolean
  onChange: (sequence: string[]) => void
}) {
  const {elements, sequence, thumbnail, readOnly, onChange} = props
  // Gespeicherte Reihenfolge, dazu neue Elemente in Lesereihenfolge hinten anhängen
  const byReading = [...elements].sort((a, b) => areaOf(a).row - areaOf(b).row || areaOf(a).column - areaOf(b).column)
  const ordered = [
    ...sequence.map((key) => elements.find((e) => e._key === key)).filter((e): e is CanvasElement => Boolean(e)),
    ...byReading.filter((e) => !sequence.includes(e._key)),
  ]
  const move = (index: number, delta: number) => {
    const next = ordered.map((e) => e._key)
    ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
    onChange(next)
  }
  return (
    <div style={{display: 'grid', gap: 8, fontFamily: 'system-ui, sans-serif'}} data-mobile-order>
      <div style={{fontSize: 13, fontWeight: 600}}>Reihenfolge auf dem Handy</div>
      <div style={{fontSize: 12, opacity: 0.7}}>
        Von oben nach unten. Bilder und Videos stehen zu zweit nebeneinander, Texte über die volle Breite.
      </div>
      <ol style={{listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4}}>
        {ordered.map((element, i) => {
          const thumb = element._type === 'canvasText' ? undefined : thumbnail(element)
          return (
            <li
              key={element._key}
              data-mobile-item={element._key}
              style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', border: '1px solid rgba(127,127,127,.3)', borderRadius: 4}}
            >
              <span style={{width: 20, fontSize: 12, opacity: 0.6, textAlign: 'right'}}>{i + 1}</span>
              <span
                style={{
                  width: 40,
                  height: 30,
                  flexShrink: 0,
                  background: thumb ? `center / cover url(${thumb})` : 'rgba(127,127,127,.15)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 11,
                }}
              >
                {thumb ? '' : element._type === 'canvasText' ? 'T' : '▶'}
              </span>
              <span style={{flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{labelOf(element)}</span>
              <ToolButton disabled={readOnly || i === 0} onClick={() => move(i, -1)}>
                ↑
              </ToolButton>
              <ToolButton disabled={readOnly || i === ordered.length - 1} onClick={() => move(i, 1)}>
                ↓
              </ToolButton>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Studio-Eingabe der Freien Fläche: Editor oben, darunter die normalen Felder (Liste der Elemente) */
export function CanvasInput(props: ObjectInputProps) {
  const {onChange, onPathFocus, readOnly} = props
  const value = (props.value ?? {}) as {
    rowHeight?: string
    theme?: 'white' | 'light'
    mobileOrder?: string
    mobileSequence?: string[]
    elements?: CanvasElement[]
  }
  const elements = useMemo(() => value.elements ?? [], [value.elements])
  const client = useClient({apiVersion: '2025-01-01'})
  const {projectId, dataset} = client.config()

  const videoUrl = useCallback(
    (element: CanvasElement) => {
      const match = element.video?.asset?._ref?.match(/^file-(.+)-(\w+)$/)
      return match && `https://cdn.sanity.io/files/${projectId}/${dataset}/${match[1]}.${match[2]}`
    },
    [projectId, dataset],
  )

  const imageUrl = useCallback(
    (element: CanvasElement) => {
      const match = element.image?.asset?._ref?.match(/^image-(.+)-(\d+x\d+)-(\w+)$/)
      return match && `https://cdn.sanity.io/images/${projectId}/${dataset}/${match[1]}-${match[2]}.${match[3]}?w=400&auto=format`
    },
    [projectId, dataset],
  )

  const path = (key: string, field?: string) => (field ? ['elements', {_key: key}, field] : ['elements', {_key: key}])

  return (
    <div style={{display: 'grid', gap: 24}}>
      <CanvasEditorView
        elements={elements}
        rowFactor={factorFor(value.rowHeight)}
        background={value.theme === 'light' ? '#f5f5f5' : '#fff'}
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        readOnly={readOnly}
        onArea={(key, area) =>
          onChange([
            set(area.column, path(key, 'column')),
            set(area.row, path(key, 'row')),
            set(area.width, path(key, 'width')),
            set(area.height, path(key, 'height')),
          ])
        }
        onAdd={(type) => {
          const size = type === 'canvasText' ? {width: 4, height: 4} : {width: 3, height: 4}
          const area = findFreeArea(elements.map(areaOf), size.width, size.height)
          const item = {
            _type: type,
            _key: Math.random().toString(36).slice(2, 10),
            ...area,
            mobile: 'auto',
            ...(type === 'canvasText' ? {align: 'center', background: 'none'} : {}),
          }
          onChange([setIfMissing([], ['elements']), insert([item], 'after', ['elements', -1])])
          onPathFocus(path(item._key, type === 'canvasText' ? 'body' : type === 'canvasVideo' ? 'video' : 'image'))
        }}
        onReorder={(key, direction) => {
          const index = elements.findIndex((element) => element._key === key)
          const target = direction === 'front' ? index - 1 : index + 1
          if (index < 0 || target < 0 || target >= elements.length) return
          const next = [...elements]
          ;[next[index], next[target]] = [next[target], next[index]]
          onChange(set(next, ['elements']))
        }}
        onRemove={(key) => onChange(unset(path(key)))}
        onEdit={(key) => {
          const element = elements.find((candidate) => candidate._key === key)
          onPathFocus(path(key, element?._type === 'canvasText' ? 'body' : element?._type === 'canvasVideo' ? 'video' : 'image'))
        }}
      />
      {value.mobileOrder === 'custom' && (
        <MobileOrderList
          elements={elements}
          sequence={value.mobileSequence ?? []}
          thumbnail={(element) => imageUrl(element._type === 'canvasVideo' ? {...element, image: element.poster} : element)}
          readOnly={readOnly}
          onChange={(sequence) => onChange(set(sequence, ['mobileSequence']))}
        />
      )}
      {props.renderDefault(props)}
    </div>
  )
}
