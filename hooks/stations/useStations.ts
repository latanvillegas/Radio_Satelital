"use client"
import { useEffect, useState, useMemo } from 'react'
import type { Station } from '@/types/station'
import {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationIndex,
  getLocalStations,
  getMergedStations,
  stationKey,
  type Radio,
} from '@/lib/services/stations'
import { toggleFavorite as toggleFavoriteStorage, getFavorites } from '@/lib/storage/favorites'
import { getRecentStations } from '@/lib/storage/recents'
import { playStation as libPlay } from '@/lib/services/player'

type Filters = {
  countries: string[]
  regions: string[]
  genres: string[]
  setCountry: (c: string) => void
  setRegion: (r: string) => void
  setGenre: (g: string) => void
  activeCountry?: string
  activeRegion?: string
  activeGenre?: string
}

export default function useStations() {
  const [stations, setStations] = useState<Station[]>(() => applyFavoriteState(getLocalStations(), getFavorites()))
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [query, setQuery] = useState('')
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [filters, setFilters] = useState<{ country?: string; region?: string; genre?: string }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentKeys, setRecentKeys] = useState<string[]>([])

  useEffect(() => {
    setRecentKeys(getRecentStations())
  }, [currentStation])

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const radios = await getMergedStations()
        const favorites = getFavorites()

        if (radios.length > 0) {
          setStations(applyFavoriteState(radios, favorites))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando emisoras')
        console.error('Error cargando emisoras:', err)
      }
    }
    load()
  }, [])

  const playAtIndex = (index: number) => {
    if (stations.length === 0) return
    const normalizedIndex = ((index % stations.length) + stations.length) % stations.length
    const station = stations[normalizedIndex]
    setCurrentStation(station)
    libPlay(station)
  }

  const playStation = (s: Station) => {
    setCurrentStation(s)
    libPlay(s)
  }

  const nextStation = () => {
    if (stations.length === 0) return
    const currentIndex = findStationIndex(stations as Radio[], currentStation as Radio | null)
    playAtIndex(currentIndex >= 0 ? currentIndex + 1 : 0)
  }

  const prevStation = () => {
    if (stations.length === 0) return
    const currentIndex = findStationIndex(stations as Radio[], currentStation as Radio | null)
    playAtIndex(currentIndex >= 0 ? currentIndex - 1 : stations.length - 1)
  }

  const playRandomStation = () => {
    if (stations.length === 0) return
    const randomIndex = Math.floor(Math.random() * stations.length)
    const randomStation = stations[randomIndex]
    playStation(randomStation)
  }

  const toggleFavorite = (s: Station) => {
    const key = stationKey(s)
    toggleFavoriteStorage(key)
    setStations(prev => prev.map(station => {
      if (stationKey(station) !== key) return station
      return { ...station, isFavorite: !station.isFavorite }
    }))
  }

  const favorites = getFavorites()
  const filtered = filterStations(stations as Radio[], {
    query,
    onlyFavs,
    filters,
    favorites,
  })

  const exposedFilters: Filters = {
    ...buildStationFilterOptions(stations as Radio[]),
    setCountry: (c: string) => setFilters(f => ({ ...f, country: c || undefined })),
    setRegion: (r: string) => setFilters(f => ({ ...f, region: r || undefined })),
    setGenre: (g: string) => setFilters(f => ({ ...f, genre: g || undefined })),
    activeCountry: filters.country,
    activeRegion: filters.region,
    activeGenre: filters.genre,
  }

  // Emisoras escuchadas recientemente resueltas contra el catálogo
  const recentStations = useMemo(() => {
    if (recentKeys.length === 0 || stations.length === 0) return []
    const keyMap = new Map(stations.map(s => [stationKey(s), s]))
    return recentKeys
      .map(k => keyMap.get(k))
      .filter((s): s is Station => Boolean(s))
  }, [recentKeys, stations])

  return {
    stations: filtered,
    rawStations: stations,
    recentStations,
    currentStation,
    onlyFavs,
    playStation,
    nextStation,
    prevStation,
    playRandomStation,
    toggleFavorite,
    setQuery,
    searchQuery: query,
    filters: exposedFilters,
    toggleOnlyFavs: (v: boolean) => setOnlyFavs(v),
    loading,
    error,
  }
}
