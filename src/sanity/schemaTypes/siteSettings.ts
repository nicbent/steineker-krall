import {defineArrayMember, defineField, defineType} from 'sanity'
import {SMOOTH_SCROLL_LEVELS} from '../../lib/smoothScroll'
import {linkAnnotation} from './shared'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Website-Einstellungen',
  type: 'document',
  groups: [
    {name: 'general', title: 'Allgemein', default: true},
    {name: 'contact', title: 'Kontakt'},
    {name: 'footer', title: 'Footer'},
    {name: 'contactPanel', title: 'Kontakt-Panel'},
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
      group: 'general',
    }),
    defineField({
      name: 'navigation',
      title: 'Hauptnavigation',
      type: 'array',
      of: [defineArrayMember({type: 'navItem'})],
      group: 'general',
    }),
    defineField({name: 'company', title: 'Firma', type: 'string', group: 'contact'}),
    defineField({name: 'street', title: 'Straße und Hausnummer', type: 'string', group: 'contact'}),
    defineField({name: 'city', title: 'PLZ und Ort', type: 'string', group: 'contact'}),
    defineField({name: 'phone', title: 'Telefon', type: 'string', group: 'contact'}),
    defineField({name: 'fax', title: 'Telefax', type: 'string', group: 'contact'}),
    defineField({name: 'email', title: 'E-Mail', type: 'string', group: 'contact'}),
    defineField({name: 'mapsUrl', title: 'Link zur Wegbeschreibung', type: 'url', group: 'contact'}),
    defineField({name: 'socialText', title: 'Social-Media-Hinweis', type: 'string', group: 'footer'}),
    defineField({name: 'socialLabel', title: 'Social-Media-Linktext', type: 'string', group: 'footer'}),
    defineField({name: 'socialUrl', title: 'Social-Media-Link', type: 'string', group: 'footer'}),
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
                  name: 'body',
                  title: 'Inhalt',
                  type: 'array',
                  description: 'Links für Telefon als "tel:+494054089 89", für E-Mail als "mailto:adresse@…" anlegen.',
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
              preview: {select: {title: 'title', highlight: 'highlight'}, prepare: ({title, highlight}) => ({title, subtitle: highlight ? 'hervorgehoben' : undefined})},
            }),
          ],
        }),
        defineField({name: 'image', title: 'Bild', type: 'imageWithAlt', description: 'Optional, erscheint unter den Gruppen.'}),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Website-Einstellungen'})},
})
