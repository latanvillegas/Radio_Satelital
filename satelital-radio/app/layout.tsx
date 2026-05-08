import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Radio Satelital',
  description: 'Escucha emisoras de radio en vivo.',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#05070a" />
      </head>
      <body>
        <div className="ambient-bg" aria-hidden />
        {children}
      </body>
    </html>
  )
}
