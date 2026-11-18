import React from 'react'
import { getLocalStations } from '@/lib/services/stations'
import RadioExplorer from '@/components/features/RadioExplorer'

export default function Page() {
  const initialStations = getLocalStations()
  const countriesCount = new Set(
    initialStations.map((station) => station.country).filter(Boolean)
  ).size

  return (
    <RadioExplorer
      initialStations={initialStations}
      countriesCount={countriesCount}
    />
  )
}
