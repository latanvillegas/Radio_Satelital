import React from 'react'
import Link from 'next/link'
import { RadioTower } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center bg-canvas text-ink">
      <script
        dangerouslySetInnerHTML={{
          __html:
            "if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().indexOf('docs') !== -1) { window.location.replace('/'); }",
        }}
      />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-accent-subtle text-accent border border-accent-glow">
        <RadioTower size={26} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
        Frecuencia no encontrada
      </h1>
      <p className="mt-2 max-w-md text-sm sm:text-base text-ink-secondary">
        La dirección solicitada no existe o ha sido trasladada al catálogo principal de emisoras.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors"
      >
        Volver a Radio Satelital
      </Link>
    </main>
  )
}
