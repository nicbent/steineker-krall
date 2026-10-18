// Zieht einen Schnappschuss der veröffentlichten Inhalte aus Sanity und schreibt
//   seed/content.json  – lokaler Fallback fürs Frontend, wenn keine Projekt-ID gesetzt ist
//   seed/import.ndjson – Import-Datei für ein neues Dataset (`npm run seed`)
// Aufruf: npm run seed:snapshot
import {writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

const dir = fileURLToPath(new URL('.', import.meta.url))
const client = getCliClient({apiVersion: '2025-01-01'})
const {projectId, dataset} = client.config()

const docs = await client.fetch('*[_type in ["siteSettings", "page"] && !(_id in path("drafts.**"))] | order(_id asc)')

// Asset-Verweise durch direkte CDN-Adressen ersetzen, damit der Fallback ohne Sanity-Zugang Bilder zeigt
function withSources(value) {
  if (Array.isArray(value)) return value.map(withSources)
  if (!value || typeof value !== 'object') return value
  const ref = value.asset?._ref
  const image = ref?.match(/^image-(.+)-(\d+)x(\d+)-(\w+)$/)
  if (image) {
    const [, id, width, height, ext] = image
    const {asset, ...rest} = value
    return {...rest, source: {url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${width}x${height}.${ext}`, width: Number(width), height: Number(height)}}
  }
  const file = ref?.match(/^file-(.+)-(\w+)$/)
  if (file) {
    const {asset, ...rest} = value
    return {...rest, source: {url: `https://cdn.sanity.io/files/${projectId}/${dataset}/${file[1]}.${file[2]}`}}
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withSources(v)]))
}

// Für den Import: Quellen als _sanityAsset, Systemfelder entfernen
function forImport(value) {
  if (Array.isArray(value)) return value.map(forImport)
  if (!value || typeof value !== 'object') return value
  if (value.source?.url) {
    const {source, ...rest} = value
    return {...rest, _sanityAsset: `${source.width ? 'image' : 'file'}@${source.url}`}
  }
  return Object.fromEntries(Object.entries(value).filter(([k]) => !['_rev', '_createdAt', '_updatedAt'].includes(k)).map(([k, v]) => [k, forImport(v)]))
}

const snapshot = withSources(docs)
const settings = snapshot.find((d) => d._type === 'siteSettings')
const pages = snapshot.filter((d) => d._type === 'page')
writeFileSync(dir + 'content.json', JSON.stringify({settings, pages}, null, 2) + '\n')
writeFileSync(dir + 'import.ndjson', snapshot.map((d) => JSON.stringify(forImport(d))).join('\n') + '\n')
console.log(`Schnappschuss: Einstellungen + ${pages.length} Seiten → content.json, import.ndjson`)
