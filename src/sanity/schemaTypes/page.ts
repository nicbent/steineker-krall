import {defineArrayMember, defineField, defineType} from 'sanity'
import {HERO_OVERLAYS} from '../../lib/heroOverlay'
import {sectionTypes} from './sections'
import {videoField} from './shared'

const hiddenWithoutHero = ({parent}: {parent?: {size?: string}}) => parent?.size === 'none'

export const page = defineType({
  name: 'page',
  title: 'Seite',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Titel', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'URL-Pfad',
      type: 'slug',
      description:
        'Die Adresse der Seite, z. B. „projekte“ für /projekte. Achtung: Nach einer Änderung auch die Links im Menü und auf anderen Seiten anpassen. Die Startseite hat den Pfad „home“ – nicht ändern.',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'description', title: 'Beschreibung (SEO)', type: 'text', rows: 3}),
    defineField({
      name: 'anchorNav',
      title: 'Sprungnavigation anzeigen',
      type: 'boolean',
      description:
        'Zeigt unter dem Intro des ersten Abschnitts Links zu allen Abschnitten, die einen „Namen in der Sprungnavigation“ haben.',
      initialValue: false,
    }),
    defineField({
      name: 'hero',
      title: 'Kopfbereich',
      type: 'object',
      fields: [
        defineField({
          name: 'size',
          title: 'Höhe',
          type: 'string',
          description:
            'Bei „Kein Kopfbild“ beginnt die Seite mit dem ersten Abschnitt. Ist das ein Banner, werden Bild und Video dort eingestellt.',
          options: {
            list: [
              {title: 'Volle Bildschirmhöhe', value: 'full'},
              {title: 'Halbe Bildschirmhöhe', value: 'half'},
              {title: 'Kein Kopfbild', value: 'none'},
            ],
            layout: 'radio',
          },
          initialValue: 'half',
        }),
        defineField({
          name: 'image',
          title: 'Bild',
          type: 'imageWithAlt',
          description: 'Bei einem Video das Vorschaubild, bis das Video geladen ist.',
          hidden: hiddenWithoutHero,
          // Ohne Bild und Video wird der Kopfbereich nicht angezeigt
          validation: (rule) =>
            rule
              .custom((value, context) => {
                const hero = context.parent as {size?: string; video?: unknown} | undefined
                if (hero?.size === 'none' || value || hero?.video) return true
                return 'Ohne Bild wird der Kopfbereich nicht angezeigt. Bild wählen oder Höhe auf „Kein Kopfbild“ stellen.'
              })
              .warning(),
        }),
        {...videoField('video', 'Optional, läuft statt des Bildes.'), hidden: hiddenWithoutHero},
        defineField({
          name: 'title',
          title: 'Titel',
          type: 'text',
          rows: 2,
          description: 'Steht groß im Bild. Hat die Seite kein Intro, ist er die H1 der Seite.',
          hidden: hiddenWithoutHero,
        }),
        defineField({
          name: 'lead',
          title: 'Text',
          type: 'text',
          rows: 3,
          description: 'Optional, steht unter dem Titel.',
          hidden: hiddenWithoutHero,
        }),
        defineField({
          name: 'link',
          title: 'Link',
          type: 'link',
          description: 'Optional, steht unter dem Titel bzw. Text.',
          hidden: hiddenWithoutHero,
        }),
        defineField({
          name: 'align',
          title: 'Position des Titels',
          type: 'string',
          options: {
            list: [
              {title: 'Unten links', value: 'bottom'},
              {title: 'Mittig', value: 'center'},
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'bottom',
          hidden: hiddenWithoutHero,
        }),
        defineField({
          name: 'overlay',
          title: 'Abdunklung',
          type: 'string',
          description: 'Dunkelt das Bild ab, damit weißer Text, Logo und Menü gut lesbar sind.',
          options: {
            list: Object.entries(HERO_OVERLAYS).map(([value, {title}]) => ({title, value})),
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'medium',
          hidden: hiddenWithoutHero,
        }),
        defineField({
          name: 'eyebrow',
          title: 'Dachzeile',
          type: 'string',
          description: 'Optional, kleine Zeile über dem Titel.',
          hidden: hiddenWithoutHero,
        }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Abschnitte',
      type: 'array',
      of: sectionTypes.filter((type) => type.name.endsWith('Section')).map((type) => defineArrayMember({type: type.name})),
      // Mehrere Intros ergäben mehrere H1-Überschriften
      validation: (rule) =>
        rule
          .custom((sections?: {_type: string}[]) =>
            (sections ?? []).filter((section) => section._type === 'introSection').length > 1
              ? 'Pro Seite nur ein Intro verwenden (es enthält die Hauptüberschrift der Seite).'
              : true,
          )
          .warning(),
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', media: 'hero.image'},
    prepare: ({title, slug, media}) => ({title, subtitle: slug === 'home' ? '/' : `/${slug}`, media}),
  },
})
