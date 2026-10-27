"use client"
import React, { memo, useEffect, useState } from 'react'
import type { Station } from '@/types/station'
import { RadioTower } from 'lucide-react'

const palettes = [
  ['#113e46','#0a1727','#64e9ce'],
  ['#553047','#18152c','#f4a8c8'],
  ['#50321b','#171d2d','#ffc183'],
  ['#253e57','#121827','#9cd0ff'],
  ['#2e4030','#142120','#baf39f'],
  ['#453451','#191927','#d3b5ff'],
] as const

export function stationColors(name: string) {
  let hash = 0
  for (const char of name) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0
  return palettes[hash % palettes.length]
}

export function stationInitials(name: string) {
  const p = name.replace(/[^\p{L}\p{N}\s]/gu,' ').trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] || 'R') + (p[1]?.[0] || p[0]?.[1] || 'S')).toLocaleUpperCase('es')
}

type Props = {
  station: Station | null
  variant?: 'hero' | 'card' | 'rail'
  className?: string
}
function StationArtwork({station,variant='card',className=''}: Props) {
  const [error, setError] = useState(false)
  useEffect(() => setError(false), [station?.logoUrl])
  const name = station?.name || 'Radio Satelital'
  const [primary,secondary,accent] = stationColors(name)
  return <span className={`live-art live-art--${variant} ${className}`}
    style={{background:`radial-gradient(circle at 80% 10%, ${primary}, transparent 65%),linear-gradient(145deg,${secondary},#080f18)`,color:accent}}>
    {station?.logoUrl && !error
      ? <img key={station.logoUrl} src={station.logoUrl} loading="lazy" decoding="async"
          className="live-art-logo" alt="" onError={()=>setError(true)}/>
      : <><span className="live-art-lines" aria-hidden="true"/><span className="live-art-initials" aria-hidden="true">{stationInitials(name)}</span>
        <RadioTower size={variant==='hero'?18:12} className="live-art-symbol" aria-hidden="true"/></>}
  </span>
}
export default memo(StationArtwork)
