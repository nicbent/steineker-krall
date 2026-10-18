// Standardtexte des Cookie-Banners; leere Felder im Studio werden damit gefüllt
export const consentDefaults = {
  title: 'Cookies & Statistik',
  description:
    'Wir möchten mit Ihrer Zustimmung anonyme Besucherstatistiken erheben, um die Website zu verbessern. Technisch notwendige Funktionen laufen auch ohne Zustimmung.',
  acceptAllLabel: 'Alle akzeptieren',
  acceptNecessaryLabel: 'Nur notwendige',
  settingsLabel: 'Einstellungen',
  saveLabel: 'Auswahl speichern',
  closeLabel: 'Schließen',
  privacyLabel: 'Datenschutzerklärung',
  necessaryTitle: 'Notwendig',
  necessaryText: 'Speichert nur Ihre Auswahl in diesem Banner. Diese Funktion lässt sich nicht abschalten.',
  analyticsTitle: 'Statistik',
  analyticsText:
    'Google Analytics zählt anonymisiert, welche Seiten besucht werden. Dafür werden Cookies gesetzt und Daten an Google übertragen.',
  footerLinkLabel: 'Cookie-Einstellungen',
}
export type ConsentTexts = typeof consentDefaults
