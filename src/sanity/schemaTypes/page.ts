import {defineArrayMember, defineField, defineType} from 'sanity'
import {HERO_OVERLAYS} from '../../lib/heroOverlay'
import {sectionTypes} from './sections'

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
      description: 'Die Seite mit dem Pfad "home" ist die Startseite.',
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
        defineField({name: 'image', title: 'Bild', type: 'imageWithAlt', hidden: ({parent}) => parent?.size === 'none'}),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'file',
          description: 'Optional, MP4 ohne Ton. Läuft stumm in Endlosschleife statt des Bildes; das Bild dient als Vorschaubild.',
          options: {accept: 'video/mp4'},
          hidden: ({parent}) => parent?.size === 'none',
        }),
        defineField({
          name: 'overlay',
          title: 'Abdunklung',
          type: 'string',
          description: 'Dunkelt das Bild ab, damit weißer Text, Logo und Menü gut lesbar sind. Am stärksten unten, wo der Titel steht.',
          options: {
            list: Object.entries(HERO_OVERLAYS).map(([value, {title}]) => ({title, value})),
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'medium',
          hidden: ({parent}) => parent?.size === 'none',
        }),
        defineField({name: 'eyebrow', title: 'Dachzeile', type: 'string', hidden: ({parent}) => parent?.size === 'none'}),
        defineField({
          name: 'title',
          title: 'Titel',
          type: 'text',
          rows: 2,
          description: 'Steht groß im Bild (unten links oder mittig). Hat die Seite kein Intro, ist er die H1 der Seite.',
          hidden: ({parent}) => parent?.size === 'none',
        }),
        defineField({
          name: 'lead',
          title: 'Text',
          type: 'text',
          rows: 3,
          description: 'Optional, steht unter dem Titel.',
          hidden: ({parent}) => parent?.size === 'none',
        }),
        defineField({
          name: 'link',
          title: 'Link',
          type: 'link',
          description: 'Optional, steht unter dem Titel bzw. Text.',
          hidden: ({parent}) => parent?.size === 'none',
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
          hidden: ({parent}) => parent?.size === 'none',
        }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Abschnitte',
      type: 'array',
      of: sectionTypes.filter((type) => type.name.endsWith('Section')).map((type) => defineArrayMember({type: type.name})),
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({title, subtitle: slug === 'home' ? '/' : `/${slug}`}),
  },
})
