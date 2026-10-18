# Steineker & Krall – Website

Astro + Tailwind CSS mit eingebettetem Sanity Studio.

```sh
npm install
npm run dev      # Website auf http://localhost:4321, Studio unter /studio
npm run build    # statischer Build nach dist/
```

Ist Port 4321 belegt, nimmt Astro den nächsten freien Port.

## Sanity

Projekt-ID und Dataset stehen in `.env` (siehe `.env.example`). Ohne Projekt-ID rendert das Frontend die
lokalen Inhalte aus `seed/content.json`, und es gibt kein Studio.

- Schemas: `src/sanity/schemaTypes/`, Studio-Konfiguration: `sanity.config.ts`
- `npm run seed` importiert `seed/import.ndjson` und **überschreibt** dabei die Dokumente im Dataset.
- `npm run seed:snapshot` aktualisiert `seed/content.json` (lokaler Fallback) und `seed/import.ndjson` aus den veröffentlichten Inhalten.
- Jede Adresse, unter der das Studio läuft, muss im Sanity-Projekt als CORS-Origin mit Credentials erlaubt
  sein: `npx sanity cors add https://deine-domain.de --credentials`

## Inhalte

- **Website-Einstellungen**: Navigation, Kontaktdaten, Footer.
- **Seiten**: Kopfbereich plus Abschnitte – Intro (H1, Einleitung, Sprungnavigation), Freie Fläche (Bilder und Texte frei auf 12 × 12 Feldern), Banner (Bild oder Video mit Text). Dazu Galerie für Projekte und Rechtstext für Impressum/Datenschutz. Die Seite mit dem Pfad `home` ist die Startseite.
- **Medien**: Mediathek mit Tags unter `/studio#/media`.

Die Seite wird statisch gebaut: Nach Änderungen im Studio ist ein neuer Build nötig (z. B. per Deploy-Webhook).
