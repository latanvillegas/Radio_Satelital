"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { Station, StationScope } from '@/types/station'
import {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationByParam,
  findStationIndex,
  getLocalStations,
  getMergedStations,
  normalizeSearch,
  stationKey,
  stationSlug,
  type StationFilterState,
} from '@/lib/services/stations'
import { toggleFavorite as toggleFavoriteStorage, getFavorites } from '@/lib/storage/favorites'
import { getRecentStations } from '@/lib/storage/recents'
import {
  playStation as libPlay,
  prepareStation,
  getCurrentPlayingStation,
  bindMediaNavigation,
  subscribePlaybackStatus,
} from '@/lib/services/player'
import { parseExplorerUrlState, serializeExplorerUrlState } from '@/lib/utils/url-state'

export interface ExposedFilters {
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

export default function useStations(
  initialStations?: Station[],
  initialSelectedStation?: Station | null
) {
  const [baseStations, setBaseStations] = useState<Station[]>(
    () => initialStations && initialStations.length > 0 ? initialStations : getLocalStations()
  )
  const [favoritesSet, setFavoritesSet] = useState<Set<string>>(() => new Set())
  const [recentKeys, setRecentKeys] = useState<string[]>([])
  const [currentStation, setCurrentStation] = useState<Station | null>(
    () => initialSelectedStation ?? null
  )
  const [query, setQueryState] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [scope, setScopeState] = useState<StationScope>('all')
  const [filters, setFilters] = useState<StationFilterState>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urlInitializedRef = useRef(false)

  // Hidratación cliente: favoritos, recientes y estado inicial desde URL (?station=..., ?scope=..., ?q=...)
  useEffect(() => {
    setFavoritesSet(getFavorites())
    setRecentKeys(getRecentStations())

    const applyUrlParams = () => {
      if (typeof window === 'undefined') return
      const parsed = parseExplorerUrlState(window.location.search)

      if (parsed.q !== undefined) setQueryState(parsed.q)
      else setQueryState('')

      if (parsed.scope) {
        setScopeState(parsed.scope)
        setFilters({
          country:
            parsed.scope === 'jaen' || parsed.scope === 'cajamarca' || parsed.scope === 'peru'
              ? 'Perú'
              : undefined,
          region:
            parsed.scope === 'jaen'
              ? 'Jaén'
              : parsed.scope === 'cajamarca'
              ? 'Cajamarca'
              : undefined,
          genre: parsed.genre,
        })
      } else {
        setScopeState('all')
        setFilters({
          country: parsed.country,
          region: parsed.region,
          genre: parsed.genre,
        })
      }

      if (parsed.station) {
        const matched = findStationByParam(baseStations, parsed.station)
        if (matched) {
          prepareStation(matched)
          setCurrentStation(matched)
        }
      } else if (initialSelectedStation && !getCurrentPlayingStation()) {
        prepareStation(initialSelectedStation)
        setCurrentStation(initialSelectedStation)
      }
    }

    applyUrlParams()
    urlInitializedRef.current = true

    window.addEventListener('popstate', applyUrlParams)
    return () => window.removeEventListener('popstate', applyUrlParams)
  }, [baseStations, initialSelectedStation])

  // Carga asíncrona segura en caso de fusión futura de catálogos
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const radios = await getMergedStations()
        if (!cancelled && radios.length > 0) {
          setBaseStations(radios)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando emisoras')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const stationsWithFavs = useMemo(
    () => applyFavoriteState(baseStations, favoritesSet),
    [baseStations, favoritesSet]
  )

  // Prepara la emisora inicial (URL -> en reproducción -> reciente -> Activa Jaén -> primera) sin autoplay intrusivo
  useEffect(() => {
    if (currentStation || stationsWithFavs.length === 0) return

    if (typeof window !== 'undefined') {
      const parsed = parseExplorerUrlState(window.location.search)
      if (parsed.station) {
        const matched = findStationByParam(stationsWithFavs, parsed.station)
        if (matched) {
          prepareStation(matched)
          setCurrentStation(matched)
          return
        }
      }
    }

    const active = getCurrentPlayingStation()
    if (active) {
      setCurrentStation(active)
      return
    }

    const byKey = new Map(stationsWithFavs.map((station) => [stationKey(station), station]))
    const recent = getRecentStations()
      .map((key) => byKey.get(key))
      .find((s): s is Station => Boolean(s))
    const fallback =
      recent ||
      stationsWithFavs.find((s) => normalizeSearch(s.name) === 'activa jaen') ||
      stationsWithFavs[0]

    if (fallback) {
      prepareStation(fallback)
      setCurrentStation(fallback)
    }
  }, [stationsWithFavs, currentStation])

  // Sincronización reactiva con eventos de reproducción
  useEffect(() => {
    return subscribePlaybackStatus((status) => {
      if (status !== 'loading' && status !== 'playing') return
      const active = getCurrentPlayingStation()
      if (active) setCurrentStation(active)
      setRecentKeys(getRecentStations())
    })
  }, [])

  // Sincronización limpia hacia la barra de direcciones sin recargar la página
  useEffect(() => {
    if (!urlInitializedRef.current || typeof window === 'undefined') return
    const currentSlug = currentStation ? stationSlug(currentStation) : undefined
    const cleanPath = window.location.pathname.replace(/\/+$/, '')
    const isCanonicalStationPath =
      Boolean(currentSlug) && cleanPath === `/emisora/${currentSlug}`

    const nextSearch = serializeExplorerUrlState({
      station: isCanonicalStationPath ? undefined : currentSlug,
      scope: scope !== 'all' ? scope : undefined,
      q: deferredQuery || undefined,
      country: scope === 'all' ? filters.country : undefined,
      region: scope === 'all' ? filters.region : undefined,
      genre: filters.genre,
    })

    if (window.location.search !== nextSearch) {
      const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`
      window.history.replaceState(null, '', nextUrl)
    }
  }, [currentStation, scope, deferredQuery, filters.country, filters.region, filters.genre])

  const recentStations = useMemo(() => {
    if (recentKeys.length === 0 || stationsWithFavs.length === 0) return []
    const keyMap = new Map(stationsWithFavs.map((s) => [stationKey(s), s]))
    return recentKeys
      .map((k) => keyMap.get(k))
      .filter((s): s is Station => Boolean(s))
  }, [recentKeys, stationsWithFavs])

  const onlyFavs = scope === 'favorites'

  const filteredStations = useMemo(() => {
    if (scope === 'recent' && !deferredQuery && !filters.genre) {
      return recentStations
    }

    const baseFiltered = filterStations(stationsWithFavs, {
      query: deferredQuery,
      onlyFavs,
      filters,
      favorites: favoritesSet,
    })

    if (scope === 'world') {
      return baseFiltered.filter((s) => {
        const c = normalizeSearch(s.country || '')
        return Boolean(c) && c !== 'peru'
      })
    }

    return baseFiltered
  }, [scope, deferredQuery, filters, onlyFavs, favoritesSet, stationsWithFavs, recentStations])

  const filterOptions = useMemo(
    () => buildStationFilterOptions(stationsWithFavs),
    [stationsWithFavs]
  )

  const playStation = useCallback((s: Station) => {
    setCurrentStation(s)
    libPlay(s)
    setRecentKeys(getRecentStations())
  }, [])

  const playAtIndex = useCallback(
    (list: Station[], index: number) => {
      if (list.length === 0) return
      const normalizedIndex = ((index % list.length) + list.length) % list.length
      const station = list[normalizedIndex]
      if (station) playStation(station)
    },
    [playStation]
  )

  const navigationPool = filteredStations.length > 0 ? filteredStations : stationsWithFavs

  const nextStation = useCallback(() => {
    if (navigationPool.length === 0) return
    const currentIndex = findStationIndex(navigationPool, currentStation)
    playAtIndex(navigationPool, currentIndex >= 0 ? currentIndex + 1 : 0)
  }, [navigationPool, currentStation, playAtIndex])

  const prevStation = useCallback(() => {
    if (navigationPool.length === 0) return
    const currentIndex = findStationIndex(navigationPool, currentStation)
    playAtIndex(
      navigationPool,
      currentIndex >= 0 ? currentIndex - 1 : navigationPool.length - 1
    )
  }, [navigationPool, currentStation, playAtIndex])

  const playRandomStation = useCallback(() => {
    const pool = filteredStations.length > 0 ? filteredStations : stationsWithFavs
    if (pool.length === 0) return
    const randomIndex = Math.floor(Math.random() * pool.length)
    const chosen = pool[randomIndex]
    if (chosen) playStation(chosen)
  }, [filteredStations, stationsWithFavs, playStation])

  useEffect(() => {
    bindMediaNavigation(nextStation, prevStation)
  }, [nextStation, prevStation])

  const toggleFavorite = useCallback((s: Station) => {
    const key = stationKey(s)
    const updated = toggleFavoriteStorage(key)
    setFavoritesSet(new Set(updated))
  }, [])

  const setQuery = useCallback((value: string) => {
    setQueryState(value)
    setScopeState((prev) => (prev === 'recent' ? 'all' : prev))
  }, [])

  const selectScope = useCallback((nextScope: StationScope) => {
    setScopeState((prev) => {
      const resolved = prev === nextScope && nextScope !== 'all' ? 'all' : nextScope
      setQueryState('')
      setFilters((f) => ({
        country:
          resolved === 'jaen' || resolved === 'cajamarca' || resolved === 'peru'
            ? 'Perú'
            : undefined,
        region:
          resolved === 'jaen'
            ? 'Jaén'
            : resolved === 'cajamarca'
            ? 'Cajamarca'
            : undefined,
        genre: f.genre,
      }))
      return resolved
    })
  }, [])

  const resetAllFilters = useCallback(() => {
    setQueryState('')
    setScopeState('all')
    setFilters({})
  }, [])

  const exposedFilters: ExposedFilters = useMemo(
    () => ({
      ...filterOptions,
      setCountry: (c: string) => {
        setScopeState('all')
        setFilters((f) => ({ ...f, country: c || undefined, region: undefined }))
      },
      setRegion: (r: string) => {
        setScopeState('all')
        setFilters((f) => ({ ...f, region: r || undefined }))
      },
      setGenre: (g: string) => {
        setFilters((f) => ({ ...f, genre: g || undefined }))
      },
      activeCountry: filters.country,
      activeRegion: filters.region,
      activeGenre: filters.genre,
    }),
    [filterOptions, filters.country, filters.region, filters.genre]
  )

  const toggleOnlyFavs = useCallback((val: boolean) => {
    setScopeState(val ? 'favorites' : 'all')
  }, [])

  return {
    stations: filteredStations,
    rawStations: stationsWithFavs,
    recentStations,
    currentStation,
    scope,
    selectScope,
    resetAllFilters,
    onlyFavs,
    playStation,
    nextStation,
    prevStation,
    playRandomStation,
    toggleFavorite,
    setQuery,
    searchQuery: query,
    filters: exposedFilters,
    toggleOnlyFavs,
    loading,
    error,
  }
}
