import {existsSync} from 'node:fs'
import {defineCliConfig} from 'sanity/cli'

// Die CLI lädt von sich aus nur SANITY_STUDIO_*-Variablen, daher .env hier einlesen
if (existsSync('.env')) process.loadEnvFile('.env')

export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  },
})
