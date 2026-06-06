import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Radio Satelital',
  description: 'Escucha emisoras de radio en vivo.',
  manifest: '/manifest.json'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#05070a" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){function setScale(){var w=window.innerWidth;var scale=1; if(w<320) scale=0.78; else if(w<360) scale=0.85; else if(w<420) scale=0.92; else if(w<550) scale=0.96; else if(w>2000) scale=1.12; else if(w>1600) scale=1.06; else scale=1; document.documentElement.style.setProperty('--ui-scale', scale);} setScale(); window.addEventListener('resize', setScale); })()` }} />
      </head>
      <body>
        <div className="ambient-bg" aria-hidden />
        {children}
      </body>
    </html>
  )
}
