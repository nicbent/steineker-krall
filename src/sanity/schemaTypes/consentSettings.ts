import {defineField, defineType} from 'sanity'
import {consentDefaults} from '../../lib/consentDefaults'

// Ein Textfeld mit dem Standardtext als Platzhalter; leer bleibt der Standard
const text = (name: keyof typeof consentDefaults, title: string, rows?: number) =>
  defineField({
    name,
    title,
    type: rows ? 'text' : 'string',
    ...(rows ? {rows} : {}),
    placeholder: consentDefaults[name],
    group: 'texts',
  })

export const consentSettings = defineType({
  name: 'consentSettings',
  title: 'Cookie-Banner',
  type: 'document',
  groups: [
    {name: 'settings', title: 'Einstellungen', default: true},
    {name: 'texts', title: 'Texte'},
  ],
  fields: [
    defineField({
      name: 'enabled',
      title: 'Cookie-Banner aktivieren',
      type: 'boolean',
      description:
        'Nur nötig, wenn ein Dienst eingebunden ist, der Cookies setzt oder Daten an Dritte schickt (z. B. Google Analytics). Ohne eingetragenen Dienst erscheint kein Banner.',
      initialValue: false,
      group: 'settings',
    }),
    defineField({
      name: 'analyticsId',
      title: 'Google-Analytics-ID',
      type: 'string',
      description: 'Mess-ID im Format G-XXXXXXXXXX. Analytics lädt erst nach Zustimmung, und nur auf der veröffentlichten Website.',
      validation: (rule) => rule.regex(/^G-[A-Z0-9]+$/, {name: 'Mess-ID'}).warning('Format: G-XXXXXXXXXX'),
      group: 'settings',
    }),
    defineField({
      name: 'position',
      title: 'Position des Banners',
      type: 'string',
      options: {
        list: [
          {title: 'Unten links', value: 'bottom left'},
          {title: 'Unten mittig', value: 'bottom center'},
          {title: 'Unten rechts', value: 'bottom right'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'bottom left',
      group: 'settings',
    }),
    text('title', 'Titel'),
    text('description', 'Beschreibung', 3),
    text('acceptAllLabel', 'Knopf „Alle akzeptieren“'),
    text('acceptNecessaryLabel', 'Knopf „Nur notwendige“'),
    text('settingsLabel', 'Knopf „Einstellungen“'),
    text('saveLabel', 'Knopf „Auswahl speichern“'),
    text('necessaryTitle', 'Kategorie „Notwendig“: Titel'),
    text('necessaryText', 'Kategorie „Notwendig“: Text', 2),
    text('analyticsTitle', 'Kategorie „Statistik“: Titel'),
    text('analyticsText', 'Kategorie „Statistik“: Text', 2),
    text('privacyLabel', 'Link zur Datenschutzerklärung'),
    text('footerLinkLabel', 'Link im Footer'),
  ],
  preview: {
    select: {enabled: 'enabled', id: 'analyticsId'},
    prepare: ({enabled, id}) => ({title: 'Cookie-Banner', subtitle: enabled && id ? `aktiv · ${id}` : 'aus'}),
  },
})
