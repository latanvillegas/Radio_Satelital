import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

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

const THEME_INIT_SCRIPT = `(function(){try{var theme=localStorage.getItem('ultra_theme')||'wear-mint';var app=localStorage.getItem('ultra_appearance')||'dark';var isLight=app==='light'||(app==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches);var map={'wear-mint':{d:['#10b981','#34d399','#041f17','rgba(16,185,129,0.30)','rgba(16,185,129,0.14)'],l:['#059669','#047857','#ffffff','rgba(5,150,105,0.26)','rgba(5,150,105,0.11)']},'amoled':{d:['#ef4444','#f87171','#ffffff','rgba(239,68,68,0.30)','rgba(239,68,68,0.14)'],l:['#dc2626','#b91c1c','#ffffff','rgba(239,68,68,0.30)','rgba(239,68,68,0.14)']},'wear-ocean':{d:['#06b6d4','#22d3ee','#042026','rgba(6,182,212,0.30)','rgba(6,182,212,0.14)'],l:['#0891b2','#0e7490','#ffffff','rgba(8,145,178,0.25)','rgba(8,145,178,0.11)']},'wear-galaxy':{d:['#3b82f6','#60a5fa','#ffffff','rgba(59,130,246,0.30)','rgba(59,130,246,0.14)'],l:['#2563eb','#1d4ed8','#ffffff','rgba(59,130,246,0.30)','rgba(59,130,246,0.14)']},'gold':{d:['#d4af37','#f5d77f','#171203','rgba(212,175,55,0.30)','rgba(212,175,55,0.14)'],l:['#b45309','#92400e','#ffffff','rgba(180,83,9,0.24)','rgba(180,83,9,0.11)']},'wear-sunset':{d:['#f97316','#fb923c','#1c0a02','rgba(249,115,22,0.30)','rgba(249,115,22,0.14)'],l:['#ea580c','#c2410c','#ffffff','rgba(249,115,22,0.30)','rgba(249,115,22,0.14)']},'purple':{d:['#a855f7','#c084fc','#ffffff','rgba(168,85,247,0.30)','rgba(168,85,247,0.14)'],l:['#9333ea','#7e22ce','#ffffff','rgba(168,85,247,0.30)','rgba(168,85,247,0.14)']},'wear-cherry':{d:['#f43f5e','#fb7185','#ffffff','rgba(244,63,94,0.30)','rgba(244,63,94,0.14)'],l:['#e11d48','#be123c','#ffffff','rgba(244,63,94,0.30)','rgba(244,63,94,0.14)']},'white':{d:['#f8fafc','#e2e8f0','#09090b','rgba(248,250,252,0.25)','rgba(248,250,252,0.12)'],l:['#18181b','#27272a','#ffffff','rgba(24,24,27,0.20)','rgba(24,24,27,0.08)']}};var entry=map[theme]||map['wear-mint'];var p=isLight?entry.l:entry.d;var r=document.documentElement;r.setAttribute('data-theme',map[theme]?theme:'wear-mint');r.setAttribute('data-appearance',isLight?'light':'dark');r.style.setProperty('--accent',p[0]);r.style.setProperty('--accent-hover',p[1]);r.style.setProperty('--accent-fg',p[2]);r.style.setProperty('--accent-glow',p[3]);r.style.setProperty('--accent-subtle',p[4]);}catch(e){}})();`

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
