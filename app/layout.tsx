import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'
import { buildThemeInitScript } from '@/lib/utils/theme'

export const metadata: Metadata = {
  metadataBase: new URL('https://latanvillegas.online'),
  alternates: { canonical: '/' },
  title: 'Radio Satelital — Observatorio de Señales | Radios en vivo',
  description:
    'Explora radios en vivo de Jaén, Cajamarca, Perú y el mundo. Sintoniza música, noticias y cultura en alta fidelidad desde Radio Satelital.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Satelital',
  },
  openGraph: {
    title: 'Radio Satelital — Observatorio de Señales | Radios en vivo',
    description:
      'Explora radios en vivo de Jaén, Cajamarca, Perú y el mundo. Sintoniza música, noticias y cultura en alta fidelidad desde Radio Satelital.',
    siteName: 'Radio Satelital',
    type: 'website',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radio Satelital — Observatorio de Señales | Radios en vivo',
    description:
      'Explora radios en vivo de Jaén, Cajamarca, Perú y el mundo. Sintoniza música, noticias y cultura en alta fidelidad desde Radio Satelital.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

const THEME_INIT_SCRIPT = buildThemeInitScript()

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Radio Satelital',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web, Android, iOS',
  inLanguage: 'es',
  url: 'https://latanvillegas.online',
  description:
    'Sintonizador web global en tiempo real con radios de Jaén, Cajamarca, Perú y el mundo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#060a0e" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body className="bg-canvas text-ink font-sans antialiased">{children}</body>
    </html>
  )
}
