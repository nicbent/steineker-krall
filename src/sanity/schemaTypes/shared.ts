import {defineField, defineType, type StringRule} from 'sanity'

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Bild',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternativtext',
      type: 'string',
      description:
        'Beschreibt das Bild für Screenreader und Suchmaschinen. Leer lassen: Dann gilt der Alt-Text aus der Mediathek (Media → Bild → Alt text).',
    }),
  ],
})

// Warnt bei Zielen, die im Browser nicht funktionieren (z. B. „www.…“ ohne https:// oder „projekte“ ohne /)
const hrefRule = (rule: StringRule) => [
  rule.required(),
  rule
    .custom((value?: string) =>
      !value || /^(\/|#|https?:\/\/|mailto:|tel:)/.test(value.trim())
        ? true
        : 'Bitte mit / (interne Seite), # (Sprungmarke), https:// (andere Website), mailto: oder tel: beginnen.',
    )
    .warning(),
]

const href = defineField({
  name: 'href',
  title: 'Ziel',
  type: 'string',
  description: 'Interne Seite mit / am Anfang (z. B. /projekte), andere Website mit https://, Kontakt-Panel mit #kontakt.',
  validation: hrefRule,
})

const blank = defineField({
  name: 'blank',
  title: 'In neuem Fenster öffnen',
  type: 'boolean',
  initialValue: false,
})

// Link im Texteditor (Annotation): Ziel plus „In neuem Fenster öffnen“
export const linkAnnotation = {
  name: 'link',
  type: 'object',
  title: 'Link',
  fields: [
    defineField({
      name: 'href',
      title: 'Ziel',
      type: 'string',
      description: 'Interne Seite mit / am Anfang (z. B. /projekte), andere Website mit https://, E-Mail als mailto:…, Telefon als tel:…',
      validation: hrefRule,
    }),
    blank,
  ],
}

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Beschriftung',
      type: 'string',
      description: 'Ohne Beschriftung wird der Link nicht angezeigt.',
      validation: (rule) => rule.required(),
    }),
    href,
    blank,
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

export const navItem = defineType({
  name: 'navItem',
  title: 'Menüpunkt',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Beschriftung', type: 'string', validation: (rule) => rule.required()}),
    href,
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

export const headingField = defineField({name: 'heading', title: 'Überschrift', type: 'string'})
export const leadField = defineField({name: 'lead', title: 'Einleitung', type: 'text', rows: 4})

// Video-Feld für Kopfbereich, Banner und Freie Fläche: gleicher Hinweis, Warnung bei großen Dateien (Ladezeit, Bandbreite)
const VIDEO_WARN_MB = 10
export const videoField = (name: string, description: string, required = false) =>
  defineField({
    name,
    title: 'Video',
    type: 'file',
    description: `${description} MP4 (H.264) ohne Ton, möglichst unter 5 MB. Läuft stumm in Endlosschleife.`,
    options: {accept: 'video/mp4'},
    validation: (rule) => [
      ...(required ? [rule.required()] : []),
      rule
        .custom(async (value: {asset?: {_ref?: string}} | undefined, context) => {
          const ref = value?.asset?._ref
          if (!ref) return true
          const size: number | undefined = await context
            .getClient({apiVersion: '2025-01-01'})
            .fetch('*[_id == $ref][0].size', {ref})
          if (!size || size <= VIDEO_WARN_MB * 1024 * 1024) return true
          return `Das Video ist ${Math.round(size / 1024 / 1024)} MB groß. Große Videos laden langsam, besonders auf dem Handy – möglichst unter 5 MB.`
        })
        .warning(),
    ],
  })
