"use client"

import React, { useEffect, useState } from 'react'
import { RefreshCw, WifiOff, X } from 'lucide-react'
import { installWebVitalsObserver } from '@/lib/services/telemetry'

/**
 * Registra el Service Worker con actualización controlada (sin interrumpir un stream en vivo)
 * y expone estado de red offline en tiempo real.
 */
export default function ServiceWorkerRegistration() {
  const updateRequested = React.useRef(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [dismissedUpdate, setDismissedUpdate] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    installWebVitalsObserver()
    setIsOnline(navigator.onLine)

    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    if (!('serviceWorker' in navigator)) {
      return () => {
        window.removeEventListener('online', onOnline)
        window.removeEventListener('offline', onOffline)
      }
    }

    let refreshing = false
    const onControllerChange = () => {
      if (refreshing || !updateRequested.current) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    const trackRegistration = (reg: globalThis.ServiceWorkerRegistration) => {
      if (reg.waiting) {
        setWaitingWorker(reg.waiting)
      }
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(installing)
          }
        })
      })
    }

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(trackRegistration)
        .catch(() => {})
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      window.removeEventListener('load', register)
    }
  }, [])

  const applyUpdate = () => {
    if (!waitingWorker) return
    updateRequested.current = true
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  const showUpdateBanner = Boolean(waitingWorker) && !dismissedUpdate

  if (isOnline && !showUpdateBanner) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 flex flex-col gap-2 pointer-events-none"
    >
      {!isOnline && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-amber-500/35 bg-elevated px-4 py-3 text-xs font-medium text-ink shadow-xl">
          <WifiOff size={16} className="text-amber-500 shrink-0" />
          <span>
            Sin conexión a Internet. La interfaz sigue activa y el audio se reanudará al volver la red.
          </span>
        </div>
      )}

      {showUpdateBanner && (
        <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-accent bg-elevated px-4 py-3 text-xs text-ink shadow-xl">
          <span className="font-medium">Nueva versión de Radio Satelital lista.</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={applyUpdate}
              className="min-h-[44px] px-3 rounded-lg bg-accent text-accent-fg font-bold inline-flex items-center gap-1.5 hover:bg-accent-hover transition-colors"
            >
              <RefreshCw size={13} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissedUpdate(true)}
              aria-label="Posponer actualización"
              className="w-11 h-11 rounded-lg grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
