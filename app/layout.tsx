import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Radio Satelital - Sintonizador Global en Vivo',
  description: 'Sintonizador web global en tiempo real con transmisión continua de alta fidelidad.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Radio Satelital - Sintonizador Global en Vivo',
    description: 'Sintonizador web global en tiempo real con transmisión continua de alta fidelidad.',
  },
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
        <meta name="theme-color" content="#000000" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var storedTheme=localStorage.getItem('ultra_theme')||'amoled';var themeMap={'amoled':{accent:'#ef4444',hover:'#f87171',glow:'rgba(239,68,68,0.28)',subtle:'rgba(239,68,68,0.14)'},'gold':{accent:'#d4af37',hover:'#f5d77f',glow:'rgba(212,175,55,0.28)',subtle:'rgba(212,175,55,0.14)'},'purple':{accent:'#a855f7',hover:'#c084fc',glow:'rgba(168,85,247,0.28)',subtle:'rgba(168,85,247,0.14)'},'white':{accent:'#ffffff',hover:'#e2e8f0',glow:'rgba(255,255,255,0.25)',subtle:'rgba(255,255,255,0.12)'},'wear-ocean':{accent:'#06b6d4',hover:'#22d3ee',glow:'rgba(6,182,212,0.28)',subtle:'rgba(6,182,212,0.14)'},'wear-sunset':{accent:'#f97316',hover:'#fb923c',glow:'rgba(249,115,22,0.28)',subtle:'rgba(249,115,22,0.14)'},'wear-galaxy':{accent:'#3b82f6',hover:'#60a5fa',glow:'rgba(59,130,246,0.28)',subtle:'rgba(59,130,246,0.14)'},'wear-mint':{accent:'#10b981',hover:'#34d399',glow:'rgba(16,185,129,0.28)',subtle:'rgba(16,185,129,0.14)'},'wear-cherry':{accent:'#f43f5e',hover:'#fb7185',glow:'rgba(244,63,94,0.28)',subtle:'rgba(244,63,94,0.14)'}};var t=themeMap[storedTheme]||themeMap['amoled'];document.documentElement.setAttribute('data-theme',storedTheme);document.documentElement.style.setProperty('--bg-dark','#000000');document.documentElement.style.setProperty('--accent',t.accent);document.documentElement.style.setProperty('--accent-hover',t.hover);document.documentElement.style.setProperty('--accent-glow',t.glow);document.documentElement.style.setProperty('--accent-subtle',t.subtle);}catch(e){}function setScale(){var w=window.innerWidth;var scale=1;if(w<320)scale=0.78;else if(w<360)scale=0.85;else if(w<420)scale=0.92;else if(w<550)scale=0.96;else if(w>2000)scale=1.12;else if(w>1600)scale=1.06;else scale=1;document.documentElement.style.setProperty('--ui-scale',scale);}setScale();window.addEventListener('resize',setScale);})()` }} />
      </head>
      <body>
        <div className="ambient-bg" aria-hidden />
        {children}
      </body>
    </html>
  )
}
