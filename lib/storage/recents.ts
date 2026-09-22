const RECENT_KEY = 'radio_recent_stations'
const MAX_RECENTS = 8

export function getRecentStations(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function addRecentStation(key: string): string[] {
  if (typeof window === 'undefined' || !key) return []
  try {
    const existing = getRecentStations().filter((k) => k !== key)
    const updated = [key, ...existing].slice(0, MAX_RECENTS)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}
