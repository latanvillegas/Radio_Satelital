import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Radio Satelital',
}

export default function DocsPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#05070a',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: "window.location.replace('/');",
        }}
      />
      <p style={{ fontSize: 18, marginBottom: 12, fontWeight: 500 }}>
        Redirigiendo a Radio Satelital...
      </p>
      <a
        href="/"
        style={{
          color: '#38bdf8',
          textDecoration: 'underline',
          fontSize: 14,
        }}
      >
        Haz clic aquí si no eres redirigido automáticamente
      </a>
    </div>
  )
}

