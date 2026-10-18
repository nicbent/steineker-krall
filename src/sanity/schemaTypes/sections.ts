import {defineArrayMember, defineField, defineType} from 'sanity'
import {CANVAS_ROW_HEIGHTS, CANVAS_TEXT_STYLES} from '../../lib/canvas'
import {CanvasInput} from '../components/CanvasEditor'
import {headingField, leadField, linkAnnotation} from './shared'

const linkField = defineField({name: 'link', title: 'Link', type: 'link'})

// Name des Abschnitts in der Sprungnavigation der Seite (nur wirksam, wenn sie auf der Seite aktiviert ist)
const anchorLabelField = defineField({
  name: 'anchorLabel',
  title: 'Name in der Sprungnavigation',
  type: 'string',
  description: 'Leer lassen, wenn der Abschnitt nicht in der Sprungnavigation erscheinen soll.',
})

// Intro: H1 der Seite mit Einleitung, optionalem Link und der Sprungnavigation darunter
const introSection = defineType({
  name: 'introSection',
  title: 'Intro',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Überschrift (H1)',
      type: 'string',
      description: 'Die Hauptüberschrift der Seite. Pro Seite nur ein Intro verwenden.',
      validation: (rule) => rule.required(),
    }),
    leadField,
    linkField,
    defineField({
      name: 'theme',
      title: 'Hintergrund',
      type: 'string',
      options: {
        list: [
          {title: 'Weiß', value: 'white'},
          {title: 'Hellgrau', value: 'light'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'white',
    }),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title, subtitle: 'Intro'})},
})

// Banner: Bild oder Video über die volle Breite mit Überschrift, Text und Link (Teaser)
const bannerSection = defineType({
  name: 'bannerSection',
  title: 'Banner',
  type: 'object',
  fields: [
    anchorLabelField,
    headingField,
    leadField,
    linkField,
    defineField({
      name: 'align',
      title: 'Ausrichtung des Textes',
      type: 'string',
      options: {
        list: [
          {title: 'Linksbündig', value: 'left'},
          {title: 'Zentriert', value: 'center'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Bild',
      type: 'imageWithAlt',
      description: 'Hintergrundbild; bei einem Video das Vorschaubild.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'backgroundVideo',
      title: 'Video',
      type: 'file',
      description: 'Optional, MP4 ohne Ton.',
      options: {accept: 'video/mp4'},
    }),
  ],
  preview: {select: {title: 'heading', media: 'backgroundImage'}, prepare: (value) => ({...value, subtitle: 'Banner'})},
})

// Freie Fläche: Elemente (Bild, Text) frei auf einem 12 × 12-Raster. Positionen setzt der visuelle Editor;
// die Positionsfelder sind deshalb im Formular ausgeblendet.
const areaFields = ['column', 'row', 'width', 'height'].map((name) =>
  defineField({name, type: 'number', hidden: true, initialValue: name === 'width' || name === 'height' ? 3 : 1}),
)
const mobileField = defineField({
  name: 'mobile',
  title: 'Auf dem Handy',
  type: 'string',
  options: {
    list: [
      {title: 'Automatisch', value: 'auto'},
      {title: 'Volle Breite', value: 'full'},
      {title: 'Ausblenden', value: 'hidden'},
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
  initialValue: 'auto',
  description: 'Automatisch: Bilder stehen zu zweit nebeneinander, Texte über die volle Breite.',
})
const parallaxField = defineField({
  name: 'parallax',
  title: 'Parallax',
  type: 'number',
  description:
    'Bewegung beim Scrollen im Verhältnis zur Seite: negativ = langsamer (wirkt weiter hinten), positiv = schneller (wirkt weiter vorne), 0 = aus. Nur auf dem Desktop.',
  options: {
    list: [
      {title: '−3', value: -3},
      {title: '−2', value: -2},
      {title: '−1', value: -1},
      {title: 'Aus', value: 0},
      {title: '+1', value: 1},
      {title: '+2', value: 2},
      {title: '+3', value: 3},
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
  initialValue: 0,
})

const canvasImage = defineType({
  name: 'canvasImage',
  title: 'Bild',
  type: 'object',
  fields: [
    defineField({name: 'image', title: 'Bild', type: 'imageWithAlt', validation: (rule) => rule.required()}),
    mobileField,
    parallaxField,
    ...areaFields,
  ],
  preview: {
    select: {media: 'image', alt: 'image.alt', column: 'column', row: 'row', width: 'width', height: 'height'},
    prepare: ({media, alt, column, row, width, height}) => ({
      title: alt || 'Bild',
      subtitle: `Spalten ${column}–${column + width - 1} · Zeilen ${row}–${row + height - 1}`,
      media,
    }),
  },
})

const canvasVideo = defineType({
  name: 'canvasVideo',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      description: 'Kurzes MP4 (H.264) ohne Ton, möglichst unter 5 MB. Läuft stumm in Endlosschleife.',
      options: {accept: 'video/mp4'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Vorschaubild',
      type: 'imageWithAlt',
      description: 'Optional. Wird gezeigt, bis das Video geladen ist, und bei „Bewegung reduzieren“ statt des Videos.',
    }),
    defineField({
      name: 'label',
      title: 'Beschreibung',
      type: 'string',
      description: 'Optional, kurz: was im Video zu sehen ist (für Screenreader).',
    }),
    mobileField,
    parallaxField,
    ...areaFields,
  ],
  preview: {
    select: {media: 'poster', label: 'label', file: 'video.asset.originalFilename', column: 'column', row: 'row', width: 'width', height: 'height'},
    prepare: ({media, label, file, column, row, width, height}) => ({
      title: label || file || 'Video',
      subtitle: `Video · Spalten ${column}–${column + width - 1} · Zeilen ${row}–${row + height - 1}`,
      media,
    }),
  },
})

const canvasText = defineType({
  name: 'canvasText',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      description: 'Format je Absatz wählen: H1–H4 für Überschriften, Einleitung, Normal oder Klein.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: Object.entries(CANVAS_TEXT_STYLES).map(([value, {title}]) => ({title, value})),
          lists: [],
          marks: {
            decorators: [
              {title: 'Fett', value: 'strong'},
              {title: 'Kursiv', value: 'em'},
            ],
            annotations: [linkAnnotation],
          },
        }),
      ],
    }),
    {...linkField, title: 'Link darunter (mit Pfeil)'},
    defineField({
      name: 'align',
      title: 'Ausrichtung',
      type: 'string',
      options: {
        list: [
          {title: 'Zentriert', value: 'center'},
          {title: 'Linksbündig', value: 'left'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'center',
    }),
    defineField({
      name: 'background',
      title: 'Hintergrund',
      type: 'string',
      description: 'Mit Hintergrund bleibt der Text auch über einem Bild lesbar.',
      options: {
        list: [
          {title: 'Ohne', value: 'none'},
          {title: 'Weiß', value: 'white'},
          {title: 'Dunkel', value: 'dark'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'none',
    }),
    mobileField,
    parallaxField,
    ...areaFields,
  ],
  preview: {
    select: {body: 'body', column: 'column', row: 'row', width: 'width', height: 'height'},
    prepare: ({body, column, row, width, height}) => ({
      title:
        (body ?? [])
          .flatMap((b: {children?: {text?: string}[]}) => b.children ?? [])
          .map((c: {text?: string}) => c.text)
          .join(' ')
          .slice(0, 60) || 'Text',
      subtitle: `Text · Spalten ${column}–${column + width - 1} · Zeilen ${row}–${row + height - 1}`,
    }),
  },
})

const canvasSection = defineType({
  name: 'canvasSection',
  title: 'Freie Fläche',
  type: 'object',
  components: {input: CanvasInput},
  fields: [
    anchorLabelField,
    {...headingField, description: 'Optional, steht zentriert über der Fläche.'},
    {...leadField, description: 'Optional, unter der Überschrift.'},
    defineField({
      name: 'theme',
      title: 'Hintergrund der Fläche',
      type: 'string',
      options: {
        list: [
          {title: 'Weiß', value: 'white'},
          {title: 'Hellgrau', value: 'light'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'white',
    }),
    defineField({
      name: 'rowHeight',
      title: 'Zeilenhöhe',
      type: 'string',
      description:
        'Mindesthöhe jeder Zeile im Verhältnis zur Spaltenbreite. Braucht ein Text mehr Platz, wird seine Zeile automatisch höher.',
      options: {
        list: Object.entries(CANVAS_ROW_HEIGHTS).map(([value, {title}]) => ({title, value})),
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'medium',
    }),
    defineField({
      name: 'mobileOrder',
      title: 'Reihenfolge auf dem Handy',
      type: 'string',
      description:
        'Lesereihenfolge: von oben nach unten wie auf dem Desktop. Bilder – Text – Bilder: erste Hälfte der Bilder, dann die Texte, dann der Rest. Eigene Reihenfolge: unter der Fläche per Pfeil sortieren.',
      options: {
        list: [
          {title: 'Lesereihenfolge', value: 'reading'},
          {title: 'Bilder – Text – Bilder', value: 'grouped'},
          {title: 'Eigene Reihenfolge', value: 'custom'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'reading',
    }),
    // Eigene Handy-Reihenfolge als Liste der Element-Schlüssel; wird im Editor unter der Fläche gepflegt
    defineField({name: 'mobileSequence', type: 'array', of: [defineArrayMember({type: 'string'})], hidden: true}),
    defineField({
      name: 'elements',
      title: 'Elemente',
      type: 'array',
      description: 'Position und Größe werden auf der Fläche oben gesetzt; hier nur Inhalte bearbeiten.',
      of: [defineArrayMember({type: 'canvasImage'}), defineArrayMember({type: 'canvasVideo'}), defineArrayMember({type: 'canvasText'})],
    }),
  ],
  preview: {
    select: {heading: 'heading', anchorLabel: 'anchorLabel', elements: 'elements'},
    prepare: ({heading, anchorLabel, elements}) => ({
      title: heading || anchorLabel || 'Freie Fläche',
      subtitle: `${(elements ?? []).length} Elemente`,
      media: (elements ?? []).find((element: {image?: unknown}) => element.image)?.image,
    }),
  },
})

const gallerySection = defineType({
  name: 'gallerySection',
  title: 'Galerie',
  type: 'object',
  fields: [
    anchorLabelField,
    headingField,
    defineField({
      name: 'images',
      title: 'Bilder',
      type: 'array',
      of: [defineArrayMember({type: 'imageWithAlt'})],
      options: {layout: 'grid'},
    }),
  ],
  preview: {select: {title: 'heading', media: 'images.0'}, prepare: (value) => ({...value, subtitle: 'Galerie'})},
})

const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Rechtstext (nur Impressum/Datenschutz)',
  type: 'object',
  fields: [
    anchorLabelField,
    headingField,
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Absatz', value: 'normal'},
            {title: 'Überschrift 2', value: 'h2'},
            {title: 'Überschrift 3', value: 'h3'},
            {title: 'Überschrift 4', value: 'h4'},
          ],
          marks: {
            decorators: [
              {title: 'Fett', value: 'strong'},
              {title: 'Kursiv', value: 'em'},
            ],
            annotations: [linkAnnotation],
          },
        }),
      ],
    }),
  ],
  preview: {select: {title: 'heading'}, prepare: (value) => ({...value, subtitle: 'Fließtext'})},
})

// Seitenbau: Intro, Freie Fläche, Banner; dazu Galerie (Projekte) und Rechtstext (Impressum, Datenschutz)
export const sectionTypes = [
  introSection,
  canvasSection,
  bannerSection,
  gallerySection,
  richTextSection,
  canvasImage,
  canvasVideo,
  canvasText,
]
