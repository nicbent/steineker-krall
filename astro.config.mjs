import {defineConfig} from 'astro/config'
import {existsSync} from 'node:fs'
import react from '@astrojs/react'
import sanity from '@sanity/astro'
import tailwindcss from '@tailwindcss/vite'

// astro.config läuft, bevor Astro die .env lädt, daher hier einlesen
if (existsSync('.env')) process.loadEnvFile('.env')
const {PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET} = process.env

export default defineConfig({
  // Die frühere Kontaktseite: Kontakt ist jetzt ein Panel, das sich über #kontakt öffnet
  redirects: {'/kontakt': '/#kontakt'},
  integrations: [
    react(),
    // Ohne Projekt-ID gibt es kein Studio; das Frontend nutzt dann seed/content.json
    PUBLIC_SANITY_PROJECT_ID &&
      sanity({
        projectId: PUBLIC_SANITY_PROJECT_ID,
        dataset: PUBLIC_SANITY_DATASET || 'production',
        apiVersion: '2025-01-01',
        useCdn: false,
        studioBasePath: '/studio',
      }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Studio beim Start vollständig vorbündeln. Entdeckt Vite eine Abhängigkeit erst während der Arbeit im Studio
    // (z. B. beim ersten Upload), baut es neu und der offene Studio-Tab stürzt mit „504 Outdated Optimize Dep“ ab.
    optimizeDeps: {
      entries: ['src/**/*.{astro,ts,tsx}', 'sanity.config.ts'],
      include: [
        'sanity',
        'sanity/structure',
        '@sanity/vision',
        'sanity-plugin-media',
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'styled-components',
        'lenis',
        'vanilla-cookieconsent',
      ],
    },
  },
})
