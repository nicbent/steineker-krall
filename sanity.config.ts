import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './src/sanity/schemaTypes'

// Das eingebettete Studio bekommt die Werte von Vite, die Sanity-CLI nur über process.env (siehe sanity.cli.ts)
const cliEnv = typeof process === 'undefined' ? undefined : process.env
const projectId = import.meta.env?.PUBLIC_SANITY_PROJECT_ID ?? cliEnv?.PUBLIC_SANITY_PROJECT_ID
const dataset = import.meta.env?.PUBLIC_SANITY_DATASET ?? cliEnv?.PUBLIC_SANITY_DATASET

const singletons = new Set(['siteSettings', 'consentSettings'])

export default defineConfig({
  name: 'steineker-krall',
  title: 'Steineker & Krall',
  projectId,
  dataset: dataset || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Inhalte')
          .items([
            S.listItem()
              .title('Website-Einstellungen')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.listItem()
              .title('Cookie-Banner')
              .child(S.document().schemaType('consentSettings').documentId('consentSettings')),
            S.divider(),
            S.documentTypeListItem('page').title('Seiten'),
          ]),
    }),
    // Mediathek mit Tags (statt Ordnern); erscheint auch als „Aus Mediathek wählen“ in jedem Bildfeld
    media(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !singletons.has(schemaType)),
  },
  document: {
    actions: (actions, {schemaType}) =>
      singletons.has(schemaType)
        ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
})
