"use client"

import React, { memo, useEffect, useState } from 'react'
import type { Station } from '@/types/station'
import { RadioTower } from 'lucide-react'
import { getStationDial } from '@/lib/services/station-frequency'

export function stationColors(name: string) {
  const palettes = [
    ['#152e30', '#0b151e', '#90dec9'],
    ['#2b2644', '#121421', '#cec2f4'],
    ['#343020', '#171a20', '#e7d49c'],
    ['#1c3047', '#101820', '#a4c9e8'],
    ['#25382b', '#131b19', '#c0e4b9'],
  ] as const
  let hash = 0
  for (const char of name) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0
  return palettes[hash % palettes.length]
}

type Props = {
  station: Station | null
  variant?: 'hero' | 'card' | 'rail'
  className?: string
}
function StationArtwork({ station, variant = 'card', className = '' }: Props) {
  const [brokenLogo, setBrokenLogo] = useState(false)
  useEffect(() => setBrokenLogo(false), [station?.logoUrl])
  const name = station?.name || 'Radio Satelital'
  const [start, end, accent] = stationColors(name)
  const dial = getStationDial(name)

  return <span className={['dial-art', 'dial-art--' + variant, className].filter(Boolean).join(' ')}
    style={{ background: 'linear-gradient(145deg, ' + start + ', ' + end + ')', color: accent }}>
    {station?.logoUrl && !brokenLogo
      ? <img src={station.logoUrl} alt="" loading="lazy" decoding="async" className="dial-art-logo"
          onError={() => setBrokenLogo(true)} />
      : <span className="dial-art-fallback">
          <RadioTower className="dial-art-icon" aria-hidden="true" />
          {dial
            ? <span className="dial-art-number">{dial.number}<small>{dial.band}</small></span>
            : <span className="dial-art-label">RADIO</span>}
        </span>}
  </span>
}

export default memo(StationArtwork)
