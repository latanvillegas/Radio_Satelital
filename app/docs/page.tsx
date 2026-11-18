import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Radio Satelital',
}

export default function DocsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-canvas text-ink">
      <script
        dangerouslySetInnerHTML={{
          __html: "window.location.replace('/');",
        }}
      />
      <p className="text-lg font-semibold mb-3 text-ink">Redirigiendo a Radio Satelital…</p>
      <Link href="/" className="text-sm font-medium text-accent underline underline-offset-4">
        Haz clic aquí si no eres redirigido automáticamente
      </Link>
    </main>
  )
}
