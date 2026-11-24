"use client"
import { useEffect, useState } from 'react'
import { searchRadioBrowser } from '@/lib/services/radio-browser'
import type { Station } from '@/types/station'

export function useRadioBrowser(enabled: boolean, name: string, country: string, genre: string) {
  const key = JSON.stringify([name.trim(), country, genre])
  const [pagination, setPagination] = useState({ key: '', page: 0 })
  const page = pagination.key === key ? pagination.page : 0
  const [retry, setRetry] = useState(0)
  const requestKey = JSON.stringify([key, page, retry])
  const [result, setResult] = useState<{ key: string; stations: Station[]; hasMore: boolean; error: string | null }>({ key: '', stations: [], hasMore: false, error: null })
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      void searchRadioBrowser({ name, country, genre, page }, controller.signal).then(data => {
        if (!controller.signal.aborted) setResult({ key: requestKey, ...data, error: null })
      }).catch(() => {
        if (!controller.signal.aborted) setResult({ key: requestKey, stations: [], hasMore: false, error: 'Radio Browser no está disponible. Puedes reintentar o volver al catálogo local.' })
      })
    }, 350)
    return () => { clearTimeout(timer); controller.abort() }
  }, [enabled, name, country, genre, page, requestKey])
  const current = enabled && result.key === requestKey
  return {
    stations: current ? result.stations : [],
    loading: enabled && !current,
    error: current ? result.error : null,
    hasMore: current && result.hasMore,
    page,
    next: () => setPagination({ key, page: page + 1 }),
    previous: () => setPagination({ key, page: Math.max(0, page - 1) }),
    retry: () => setRetry(v => v + 1),
  }
}
