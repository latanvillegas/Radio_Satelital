"use client"
import { useEffect, useState } from 'react'
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
import { playStation as libPlay } from '@/lib/services/player'

type Filters = {
  countries: string[]
  regions: string[]
  setCountry: (c:string)=>void
  setRegion: (r:string)=>void
}

export default function useStations(){
  const [stations, setStations] = useState<Station[]>(() => applyFavoriteState(getLocalStations(), getFavorites()))
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [query, setQuery] = useState('')
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [filters, setFilters] = useState<{country?:string,region?:string}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    async function load(){
      try {
        setError(null)
        setLoading(true)
        const radios = await getMergedStations()
        const favorites = getFavorites()

        if (radios.length > 0) {
          setStations(applyFavoriteState(radios, favorites))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando emisoras')
        console.error('Error cargando emisoras:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  },[])

  const playAtIndex = (index: number) => {
    if (stations.length === 0) return

    const normalizedIndex = ((index % stations.length) + stations.length) % stations.length
    const station = stations[normalizedIndex]

    setCurrentStation(station)
    libPlay(station)
  }

  const playStation = (s:Station)=>{
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
  const toggleFavorite = (s:Station)=>{
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
    setCountry: (c:string)=> setFilters(f=>({...f,country:c})),
    setRegion: (r:string)=> setFilters(f=>({...f,region:r}))
  }

  return { 
    stations: filtered,
    rawStations: stations,
    currentStation,
    onlyFavs,
    playStation,
    nextStation,
    prevStation,
    toggleFavorite,
    setQuery,
    filters: exposedFilters,
    toggleOnlyFavs: (v:boolean)=>setOnlyFavs(v),
    loading,
    error
  }
}
