"use client"
import React from 'react'
import { ArrowDown, ArrowUpRight, Headphones, Pause, Play, RadioTower, Shuffle, Signal, Sparkles } from 'lucide-react'
import type { Station } from '@/types/station'
import { usePlayer } from '@/hooks/player'
import { stationKey } from '@/lib/services/station-normalizer'
import StationArtwork from './StationArtwork'

type Props = {
  featured: Station | null
  stationCount: number
  countryCount: number
  onTune: (station: Station) => void
  onRandom: () => void
}

export default function LiveStage({featured,stationCount,countryCount,onTune,onRandom}:Props) {
  const {currentStation,isPlaying,playbackStatus,togglePlay} = usePlayer()
  const selected = featured && currentStation && stationKey(featured) === stationKey(currentStation)
  const playing = Boolean(selected && isPlaying)
  const connecting = Boolean(selected && (playbackStatus === 'loading' || playbackStatus === 'reconnecting'))
  const tune = () => {
    if (!featured) return
    if (selected) togglePlay()
    else onTune(featured)
  }
  return <section className="live-stage" aria-labelledby="live-stage-title">
    <div className="live-stage-light" aria-hidden="true"/>
    <div className="live-stage-top">
      <span className="live-stage-tag"><span className="live-stage-dot" aria-hidden="true"/> RADIO SATELITAL <span className="live-stage-divider">/</span> EXPERIENCIA EN DIRECTO</span>
      <span className="live-stage-edition"><Signal size={14}/> EXPLORA SIN LÍMITES</span>
    </div>
    <div className="live-stage-body">
      <div className="live-stage-identity">
        <div className="live-cover-frame">
          <StationArtwork station={featured} variant="hero" />
          <span className="live-cover-corner" aria-hidden="true"><RadioTower size={15}/></span>
        </div>
        <div className="live-stage-tune-indicator">
          <span className={playing ? 'live-pulse-dot is-playing':'live-pulse-dot'} aria-hidden="true" />
          {playing ? 'REPRODUCIENDO' : connecting ? 'CONECTANDO' : 'LISTA PARA SINTONIZAR'}
        </div>
      </div>
      <div className="live-stage-details">
        <p className="live-stage-kicker"><Sparkles size={15}/> TU ESCENARIO SONORO</p>
        <h1 id="live-stage-title" className="live-stage-headline">No solo escuches.<br/><span>Conecta con el mundo.</span></h1>
        <p className="live-stage-description">Una emisora puede cambiar tu momento. Descubre nuevas voces, música y ciudades sin salir de Radio Satelital.</p>
        <div className="live-stage-current">
          <span className="live-stage-current-icon"><Headphones size={17}/></span>
          <span className="live-stage-current-info">
            <span className="live-stage-current-overline">{selected && playing ? 'EN TU REPRODUCTOR' : 'TU SIGUIENTE FRECUENCIA'}</span>
            <strong>{featured?.name || 'Radio Satelital'}</strong>
            <span className="live-stage-current-location">{[featured?.region,featured?.country].filter(Boolean).join(' · ') || 'Explora emisoras del mundo'}</span>
          </span>
        </div>
        <div className="live-stage-actions">
          <button type="button" onClick={tune} disabled={!featured} className="live-primary-button">
            {playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
            {playing ? 'Pausar transmisión' : connecting ? 'Conectando…' : 'Escuchar ahora'} <ArrowUpRight size={17}/>
          </button>
          <button type="button" onClick={onRandom} className="live-random-button">
            <Shuffle size={17}/> Sorpresa musical
          </button>
        </div>
      </div>
    </div>
    <div className="live-stage-bottom">
      <span><strong>{stationCount}</strong> emisoras</span>
      <span className="live-stage-separator"/>
      <span><strong>{countryCount}</strong> países</span>
      <span className="live-stage-bottom-note">Tu dial. Tu ritmo.</span>
      <a href="#explorar" className="live-stage-explore">Ir al catálogo <ArrowDown size={15}/></a>
    </div>
  </section>
}
