"use client"
import { useEffect, useState } from 'react'
import type { Station } from '../types/station'
import { getMergedStations } from '../lib/stations'
import { toggleFavorite as toggleFavoriteStorage, getFavorites } from '../lib/favorites'
import { playStation as libPlay } from '../lib/player'

type Filters = {
  countries: string[]
  regions: string[]
  setCountry: (c:string)=>void
  setRegion: (r:string)=>void
}

export default function useStations(){
  const [stations, setStations] = useState<Station[]>([])
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [query, setQuery] = useState('')
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [filters, setFilters] = useState<{country?:string,region?:string}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    async function load(){
      try {
        setLoading(true)
        setError(null)
        const radios = await getMergedStations()
        const favorites = getFavorites()
        
        if (radios.length === 0) {
          setError('No hay emisoras disponibles')
          setStations([])
        } else {
          // Convertir Radio a Station (mapear streamUrl a url)
          const stations = radios.map(radio => ({
            id: radio.id,
            name: radio.name,
            url: radio.streamUrl, // Compatibilidad con código existente
            streamUrl: radio.streamUrl,
            country: radio.country,
            region: radio.region,
            logoUrl: radio.logoUrl,
            isFavorite: favorites.has(`${radio.name}|${radio.streamUrl}`),
            tags: radio.tags,
          } as Station))
          setStations(stations)
        }
      } catch (err) {
        console.error('Error cargando emisoras:', err)
        setError('Error al cargar las emisoras')
        setStations([])
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
  const stationKey = (station: Station) => `${station.name}|${station.url || station.streamUrl}`
  const nextStation = () => {
    if (stations.length === 0) return
    const currentIndex = currentStation
      ? stations.findIndex(station => station.id === currentStation.id || station.streamUrl === currentStation.streamUrl || station.url === currentStation.url)
      : -1
    playAtIndex(currentIndex >= 0 ? currentIndex + 1 : 0)
  }
  const prevStation = () => {
    if (stations.length === 0) return
    const currentIndex = currentStation
      ? stations.findIndex(station => station.id === currentStation.id || station.streamUrl === currentStation.streamUrl || station.url === currentStation.url)
      : -1
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

  const filtered = stations.filter(s=>{
    if(onlyFavs){
      const favs = getFavorites(); if(!favs.has(`${s.name}|${s.url || s.streamUrl}`)) return false
    }
    if(filters.country && s.country !== filters.country) return false
    if(filters.region && s.region !== filters.region) return false
    if(query){
      const nq = query.normalize('NFD').toLowerCase()
      const t = (s.name + ' ' + (s.region||'') + ' ' + (s.country||'')).normalize('NFD').toLowerCase()
      if(!t.includes(nq)) return false
    }
    return true
  })

  const exposedFilters: Filters = {
    countries: Array.from(new Set(stations.map(s=>s.country).filter(Boolean))) as string[],
    regions: Array.from(new Set(stations.map(s=>s.region).filter(Boolean))) as string[],
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
