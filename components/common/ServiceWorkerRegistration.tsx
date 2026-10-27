'use client'

import { useEffect } from 'react'

/** Registra la caché de interfaz. Los streams de audio nunca se interceptan. */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const register = () => { navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {}) }
    if (document.readyState === 'complete') register()
    else {
      window.addEventListener('load', register, { once: true })
      return () => window.removeEventListener('load', register)
    }
  }, [])
  return null
}
