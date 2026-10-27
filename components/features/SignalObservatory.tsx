"use client"
import React from 'react'
import type { Station } from '@/types/station'
import { ArrowDownRight, ArrowUpRight, Globe2, Headphones, Heart, Play, RadioTower, Shuffle, Signal, Sparkles } from 'lucide-react'

interface Props {
  stations: Station[]
  currentStation: Station | null
  stationCount: number
  countriesCount: number
  favoritesCount: number
  onTune: (station: Station) => void
  onRandom: () => void
}
export default function SignalObservatory({
  stations, currentStation, stationCount, countriesCount, favoritesCount, onTune, onRandom
}: Props) {
  const focus = currentStation || stations[0] || null
  return (
    <section className="orbital-hero" aria-labelledby="orbital-title">
      <div className="orbital-grid" aria-hidden="true" />
      <div className="orbital-noise" aria-hidden="true" />
      <div className="orbital-copy">
        <div className="orbital-eyebrow">
          <span className="orbital-lamp" aria-hidden="true" />
          RADIO SATELITAL <span className="orbital-eyebrow-slash">/</span> SINTONIZADOR GLOBAL
        </div>
        <h1 id="orbital-title" className="orbital-headline">
          El mundo tiene <span>una frecuencia.</span><br />
          Encuentra la tuya.
        </h1>
        <p className="orbital-intro">Voces que cruzan fronteras. Música que encuentra caminos. Explora emisoras reales de Perú y el mundo en un solo lugar.</p>
        <div className="orbital-actions">
          <a className="orbital-cta" href="#explorar"><Signal size={18} /> Descubrir emisoras <ArrowUpRight size={17} /></a>
          <button type="button" className="orbital-secondary" onClick={onRandom}><Shuffle size={17} /> Sintonización aleatoria</button>
        </div>
        <div className="orbital-metrics" aria-label="Datos del catálogo">
          <div><strong>{stationCount}</strong><span>Emisoras en catálogo</span></div>
          <div><strong>{countriesCount}</strong><span>Países para explorar</span></div>
          <div><strong>{favoritesCount}</strong><span>Tus favoritas</span></div>
        </div>
      </div>
      <div className="orbital-console" aria-label="Observatorio de emisoras">
        <div className="orbital-console-top">
          <span><RadioTower size={15} /> OBSERVATORIO DE SEÑALES</span>
          <span className="orbital-console-version">RS / WEB · 02</span>
        </div>
        <div className="orbital-disc" aria-hidden="true">
          <div className="orbital-disc-ring orbital-disc-ring-outer" />
          <div className="orbital-disc-ring orbital-disc-ring-middle" />
          <div className="orbital-disc-ring orbital-disc-ring-inner" />
          <div className="orbital-crosshair orbital-crosshair-x" />
          <div className="orbital-crosshair orbital-crosshair-y" />
          <span className="orbital-point orbital-point-one" />
          <span className="orbital-point orbital-point-two" />
          <span className="orbital-point orbital-point-three" />
          <div className="orbital-disc-core">
            <RadioTower size={32} strokeWidth={1.5} />
            <strong>RADIO</strong>
            <span>SATELITAL</span>
          </div>
        </div>
        <div className="orbital-selected">
          <div className="orbital-selected-heading"><span className="orbital-selector-dot" /> {currentStation ? 'ÚLTIMA EMISORA SELECCIONADA' : 'PUNTO DE PARTIDA'}</div>
          <div className="orbital-selected-content">
            <div className="orbital-selected-logo">
              {focus?.logoUrl ? <img src={focus.logoUrl} alt="" loading="lazy" /> : <Headphones size={25} aria-hidden="true" />}
            </div>
            <div className="orbital-selected-text">
              <strong>{focus?.name || 'Explora el universo de la radio'}</strong>
              <span>{[focus?.region, focus?.country].filter(Boolean).join(' · ') || 'Encuentra tu próxima emisora'}</span>
            </div>
            <button className="orbital-selected-play" type="button" onClick={() => focus && onTune(focus)} disabled={!focus}
              aria-label={focus ? 'Escuchar ' + focus.name : 'Sin emisora disponible'}><Play size={20} fill="currentColor" /></button>
          </div>
        </div>
        <div className="orbital-channels">
          <span className="orbital-channels-title"><Sparkles size={14} /> ENCUENTROS EN EL DIAL</span>
          <div className="orbital-channel-list">
            {stations.slice(0, 3).map((station, index) => (
              <button key={station.name + station.url} className="orbital-channel" type="button" onClick={() => onTune(station)}>
                <span className="orbital-channel-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="orbital-channel-name">{station.name}</span>
                <ArrowDownRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="orbital-edge-caption" aria-hidden="true">VOZ · TERRITORIO · CULTURA · SEÑAL</div>
    </section>
  )
}
