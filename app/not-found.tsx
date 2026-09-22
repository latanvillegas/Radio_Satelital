import React from 'react'

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: 40,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: "if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().indexOf('docs') !== -1) { window.location.replace('/'); }",
        }}
      />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Página no encontrada</h1>
      <p style={{ color: '#9ca3af', marginBottom: 24, fontSize: 15 }}>
        La dirección solicitada no existe o ha sido trasladada al inicio.
      </p>
      <a
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 22px',
          borderRadius: 8,
          backgroundColor: '#dc2626',
          color: '#ffffff',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
        }}
      >
        Ir a Radio Satelital
      </a>
    </div>
  )
}


