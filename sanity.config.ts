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
// Rechtstexte stehen in der Seitenliste gesondert unten
const LEGAL_SLUGS = ['"impressum"', '"datenschutzerklaerung"'].join(', ')

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
            S.listItem()
              .title('Startseite')
              .schemaType('page')
              .child(S.document().schemaType('page').documentId('page-home')),
            S.listItem()
              .title('Seiten')
              .schemaType('page')
              .child(
                S.documentTypeList('page')
                  .title('Seiten')
                  .filter(`_type == "page" && !(slug.current in ["home", ${LEGAL_SLUGS}])`)
                  .defaultOrdering([{field: 'title', direction: 'asc'}]),
              ),
            S.listItem()
              .title('Impressum & Datenschutz')
              .schemaType('page')
              .child(
                S.documentList()
                  .title('Impressum & Datenschutz')
                  .schemaType('page')
                  .filter(`_type == "page" && slug.current in [${LEGAL_SLUGS}]`)
                  .defaultOrdering([{field: 'title', direction: 'asc'}]),
              ),
          ]),
    }),
    // Mediathek mit Tags (statt Ordnern); erscheint auch als „Aus Mediathek wählen“ in jedem Bildfeld
    media(),
    // GROQ-Abfragen (Vision) nur in der lokalen Entwicklung, im Studio der Website nicht sichtbar
    ...(import.meta.env?.DEV ? [visionTool()] : []),
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
