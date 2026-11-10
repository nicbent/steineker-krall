import {defineArrayMember, defineField, defineType} from 'sanity'
import {SMOOTH_SCROLL_LEVELS} from '../../lib/smoothScroll'
import {linkAnnotation} from './shared'

// Inhalt einer Gruppe im Kontakt-Panel: eigener Text oder Angaben aus den Einstellungen
const CONTACT_SOURCES = {
  text: 'Eigener Text',
  phoneEmail: 'Telefon, Fax und E-Mail (aus „Kontakt“)',
  address: 'Firma, Adresse und Wegbeschreibung (aus „Kontakt“)',
  social: 'Social-Media-Link (aus „Footer“)',
}

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Website-Einstellungen',
  type: 'document',
  groups: [
    {name: 'general', title: 'Allgemein', default: true},
    {name: 'contact', title: 'Kontakt'},
    {name: 'footer', title: 'Footer'},
    {name: 'contactPanel', title: 'Kontakt-Panel'},
    {name: 'technical', title: 'Technik'},
  ],
  fields: [
    defineField({name: 'title', title: 'Website-Titel', type: 'string', group: 'general', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Beschreibung (SEO)', type: 'text', rows: 3, group: 'general'}),
    defineField({
      name: 'smoothScroll',
      title: 'Smooth-Scrolling',
      type: 'string',
      description:
        'Glättet das Scrollen mit Mausrad und Trackpad. Touch auf Handy und Tablet bleibt immer nativ; bei „Bewegung reduzieren“ ist es aus.',
      options: {
        list: Object.entries(SMOOTH_SCROLL_LEVELS).map(([value, {title}]) => ({title, value})),
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'subtle',
      group: 'technical',
    }),
    defineField({
      name: 'navigation',
      title: 'Hauptnavigation',
      type: 'array',
      of: [defineArrayMember({type: 'navItem'})],
      group: 'general',
    }),
    // Kontaktdaten an einer Stelle: Footer und Kontakt-Panel lesen sie von hier
    defineField({name: 'company', title: 'Firma', type: 'string', description: 'Erscheint im Kontakt-Panel über der Adresse.', group: 'contact'}),
    defineField({name: 'street', title: 'Straße und Hausnummer', type: 'string', description: 'Footer und Kontakt-Panel.', group: 'contact'}),
    defineField({name: 'city', title: 'PLZ und Ort', type: 'string', description: 'Footer und Kontakt-Panel.', group: 'contact'}),
    defineField({name: 'phone', title: 'Telefon', type: 'string', description: 'Footer und Kontakt-Panel, z. B. +49 (0)40 540 89 89.', group: 'contact'}),
    defineField({name: 'fax', title: 'Telefax', type: 'string', description: 'Kontakt-Panel. Leer lassen, wenn es kein Fax mehr gibt.', group: 'contact'}),
    defineField({name: 'email', title: 'E-Mail', type: 'string', description: 'Footer und Kontakt-Panel.', group: 'contact'}),
    defineField({
      name: 'mapsUrl',
      title: 'Link zur Wegbeschreibung',
      type: 'url',
      description: 'Kontakt-Panel, unter der Adresse (z. B. ein Google-Maps-Link).',
      group: 'contact',
    }),
    defineField({name: 'socialText', title: 'Social-Media-Hinweis', type: 'string', description: 'Satz im Footer vor dem Link.', group: 'footer'}),
    defineField({name: 'socialLabel', title: 'Social-Media-Linktext', type: 'string', description: 'Footer und Kontakt-Panel, z. B. Instagram.', group: 'footer'}),
    defineField({name: 'socialUrl', title: 'Social-Media-Link', type: 'url', description: 'Footer und Kontakt-Panel, vollständige Adresse mit https://.', group: 'footer'}),
    defineField({
      name: 'legalLinks',
      title: 'Rechtliche Links',
      type: 'array',
      of: [defineArrayMember({type: 'navItem'})],
      group: 'footer',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright-Inhaber',
      type: 'string',
      description: 'Das Jahr wird automatisch ergänzt.',
      group: 'footer',
    }),
    defineField({
      name: 'contactPanel',
      title: 'Kontakt-Panel',
      type: 'object',
      group: 'contactPanel',
      description: 'Fährt von rechts herein, sobald ein Link mit dem Ziel "#kontakt" angeklickt wird (z. B. im Menü).',
      fields: [
        defineField({name: 'title', title: 'Titel', type: 'string', initialValue: 'Kontakt'}),
        defineField({
          name: 'groups',
          title: 'Gruppen',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'contactGroup',
              title: 'Gruppe',
              fields: [
                defineField({name: 'title', title: 'Überschrift', type: 'string'}),
                defineField({
                  name: 'source',
                  title: 'Inhalt',
                  type: 'string',
                  description: 'Telefon, Adresse und Social Media kommen aus den Reitern „Kontakt“ und „Footer“ und müssen nur dort gepflegt werden.',
                  options: {
                    list: Object.entries(CONTACT_SOURCES).map(([value, title]) => ({title, value})),
                    layout: 'radio',
                  },
                  initialValue: 'text',
                }),
                defineField({
                  name: 'body',
                  title: 'Text',
                  type: 'array',
                  description: 'Links für Telefon als "tel:+49405408989", für E-Mail als "mailto:adresse@…" anlegen.',
                  hidden: ({parent}) => Boolean(parent?.source && parent.source !== 'text'),
                  of: [
                    defineArrayMember({
                      type: 'block',
                      styles: [{title: 'Absatz', value: 'normal'}],
                      lists: [],
                      marks: {decorators: [{title: 'Fett', value: 'strong'}], annotations: [linkAnnotation]},
                    }),
                  ],
                }),
                defineField({
                  name: 'highlight',
                  title: 'Hervorheben',
                  type: 'boolean',
                  description: 'Stellt die Gruppe auf eine hellere Fläche.',
                  initialValue: false,
                }),
              ],
              preview: {
                select: {title: 'title', highlight: 'highlight', source: 'source'},
                prepare: ({title, highlight, source}) => ({
                  title,
                  subtitle: [source && source !== 'text' && CONTACT_SOURCES[source as keyof typeof CONTACT_SOURCES], highlight && 'hervorgehoben']
                    .filter(Boolean)
                    .join(' · ') || undefined,
                }),
              },
            }),
          ],
        }),
        defineField({name: 'image', title: 'Bild', type: 'imageWithAlt', description: 'Optional, erscheint unter den Gruppen.'}),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Website-Einstellungen'})},
})
