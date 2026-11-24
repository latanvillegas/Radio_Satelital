"use client"

import React, { memo, useState } from 'react'
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
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return palettes[hash % palettes.length]
}

interface Props {
  station: Station | null
  variant?: 'hero' | 'card' | 'dock'
  className?: string
}

function StationArtwork({ station, variant = 'card', className = '' }: Props) {
  const [loadedLogo, setLoadedLogo] = useState<string | null>(null)
  const logoUrl = station?.logoUrl
  const logoReady = Boolean(logoUrl && loadedLogo === logoUrl)

  const name = station?.name || 'Radio Satelital'
  const [start, end, accent] = stationColors(name)
  const dial = getStationDial(name)

  const variantClass =
    variant === 'hero'
      ? 'dial-art--hero'
      : variant === 'dock'
      ? 'dial-art--dock'
      : ''

  return (
    <span
      className={['dial-art', variantClass, className].filter(Boolean).join(' ')}
      style={{
        background: `linear-gradient(145deg, ${start}, ${end})`,
        color: accent,
      }}
    >
      <span className="dial-art-fallback" aria-hidden="true">

          <RadioTower className="dial-art-icon" />
          {dial ? (
            <span className="dial-art-number">
              {dial.number}
              <small>{dial.band}</small>
            </span>
          ) : (
            <span className="dial-art-label">RADIO</span>
          )}
      </span>
      {logoUrl && (
        <img
          key={logoUrl}
          src={logoUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`dial-art-logo ${logoReady ? 'is-ready' : ''}`}
          onLoad={() => setLoadedLogo(logoUrl)}
          onError={() => setLoadedLogo(null)}
        />
      )}
    </span>
  )
}

export default memo(StationArtwork)
