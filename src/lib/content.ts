import {createClient} from '@sanity/client'
import seed from '../../seed/content.json'

export interface SiteImage {
  url: string
  width: number
  height: number
  alt: string
  kind: 'sanity' | 'squarespace' | 'plain'
  position?: string
}

export interface Link {
  label?: string
  href: string
  blank?: boolean
}

export interface Settings {
  title: string
  description?: string
  navigation?: Link[]
  company?: string
  street?: string
  city?: string
  phone?: string
  fax?: string
  email?: string
  mapsUrl?: string
  socialText?: string
  socialLabel?: string
  socialUrl?: string
  legalLinks?: Link[]
  copyright?: string
  smoothScroll?: string
  contactPanel?: {
    title?: string
    groups?: {_key: string; title?: string; body?: any[]; highlight?: boolean}[]
    image?: SiteImage
  }
}

export interface ConsentSettings {
  enabled?: boolean
  analyticsId?: string
  position?: string
  [text: string]: unknown
}

export interface Section {
  _type: string
  _key: string
  [field: string]: any
}

export interface Page {
  title: string
  slug: string
  description?: string
  anchorNav?: boolean
  hero?: {size?: 'full' | 'half' | 'none'; image?: SiteImage; eyebrow?: string; title?: string; overlay?: string}
  sections?: Section[]
}

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production'

// Asset-Referenzen enthalten Hash, Maße und Format, daher lassen sich die CDN-URLs ohne weitere Abfrage bilden
function resolve(value: any): any {
  // Bilder ohne hochgeladene Datei (z. B. leere Einträge im Studio) fallen weg
  if (Array.isArray(value)) return value.map(resolve).filter((item) => item !== undefined)
  if (!value || typeof value !== 'object') return value

  if (value._type === 'image' || value._type === 'imageWithAlt') {
    if (value.source) {
      const url: string = value.source.url
      const kind = url.includes('cdn.sanity.io') ? 'sanity' : url.includes('images.squarespace-cdn.com') ? 'squarespace' : 'plain'
      return {
        ...value.source,
        alt: value.alt ?? '',
        kind,
        position: value.hotspot && `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`,
      } satisfies SiteImage
    }
    const match = value.asset?._ref?.match(/^image-(.+)-(\d+)x(\d+)-(\w+)$/)
    if (!match) return undefined
    const [, id, width, height, ext] = match
    return {
      url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${width}x${height}.${ext}`,
      width: Number(width),
      height: Number(height),
      alt: value.alt ?? '',
      kind: 'sanity',
      position: value.hotspot && `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`,
    } satisfies SiteImage
  }

  if (value._type === 'file') {
    if (value.source?.url) return value.source.url
    const match = value.asset?._ref?.match(/^file-(.+)-(\w+)$/)
    return match ? `https://cdn.sanity.io/files/${projectId}/${dataset}/${match[1]}.${match[2]}` : undefined
  }

  if (value._type === 'slug') return value.current

  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolve(child)]))
}

let cache: Promise<{settings: Settings; consent?: ConsentSettings; pages: Page[]}> | undefined

async function load() {
  if (!projectId) return resolve(seed)
  const client = createClient({projectId, dataset, apiVersion: '2025-01-01', useCdn: false})
  const data = await client.fetch(`{
    "settings": *[_id == "siteSettings"][0],
    "consent": *[_id == "consentSettings"][0],
    "pages": *[_type == "page" && defined(slug.current)]
  }`)
  if (!data.settings) throw new Error(`Im Sanity-Dataset "${dataset}" fehlen die Website-Einstellungen (siteSettings).`)
  return resolve(data)
}

export function getContent() {
  // Im Dev-Server bei jedem Aufruf neu laden, damit Änderungen aus dem Studio sofort sichtbar sind
  if (import.meta.env.DEV) return load()
  return (cache ??= load())
}
