import {defineField, defineType} from 'sanity'

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
      description: 'Beschreibt das Bild für Screenreader und Suchmaschinen. Bei rein dekorativen Bildern leer lassen.',
    }),
  ],
})

const href = defineField({
  name: 'href',
  title: 'Ziel',
  type: 'string',
  description: 'Interner Pfad (z. B. /projekte) oder vollständige URL.',
  validation: (rule) => rule.required(),
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
      description: 'Interner Pfad (z. B. /projekte), vollständige URL, mailto:… oder tel:…',
      validation: (rule) => rule.required(),
    }),
    blank,
  ],
}

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [defineField({name: 'label', title: 'Beschriftung', type: 'string'}), href, blank],
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

export const themeField = defineField({
  name: 'theme',
  title: 'Farbschema',
  type: 'string',
  options: {
    list: [
      {title: 'Weiß', value: 'white'},
      {title: 'Hellgrau', value: 'light'},
      {title: 'Dunkel', value: 'dark'},
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
  initialValue: 'white',
})

export const headingField = defineField({name: 'heading', title: 'Überschrift', type: 'string'})
export const leadField = defineField({name: 'lead', title: 'Einleitung', type: 'text', rows: 4})
