"use client"
import React, { useState } from 'react'
import type { Station } from '@/types/station'
import { ArrowUpRight, Globe2, MapPin, Play } from 'lucide-react'
import StationArtwork from './StationArtwork'
import { stationKey } from '@/lib/services/station-normalizer'

type Props = { quick: Station[]; cajamarca: Station[]; world: Station[]; onTune: (station: Station) => void }
function StationRail({title,eyebrow,stations,onTune}:{
 title:string; eyebrow:string; stations:Station[]; onTune:(s:Station)=>void
}) {
 if (!stations.length) return null
 return <section className="live-rail" aria-label={title}>
   <div className="live-rail-heading">
     <div className="live-rail-heading-main">
       <div><p className="live-rail-eyebrow">{eyebrow}</p><h2>{title}</h2></div>
     </div>
     <span className="live-rail-count">{stations.length} opciones <ArrowUpRight size={14}/></span>
   </div>
   <div className="live-rail-scroller">
     {stations.map(s=><button type="button" key={stationKey(s)} onClick={()=>onTune(s)} className="live-rail-item"
       aria-label={`Escuchar ${s.name}`}>
       <StationArtwork station={s} variant="rail"/>
       <span className="live-rail-item-copy"><strong>{s.name}</strong>
         <span>{[s.region,s.country].filter(Boolean).join(' · ') || 'Radio en directo'}</span>
       </span>
       <span className="live-rail-play" aria-hidden="true"><Play size={15} fill="currentColor"/></span>
     </button>)}
   </div>
 </section>
}
export default function DiscoveryRails({quick,cajamarca,world,onTune}:Props) {
 const [place,setPlace] = useState<'cajamarca'|'world'>('cajamarca')
 const options = place === 'cajamarca' ? cajamarca : world
 return <div className="live-discovery" aria-label="Descubrimiento de emisoras">
   <StationRail title="Tu siguiente frecuencia" eyebrow="PARA SEGUIR ESCUCHANDO" stations={quick} onTune={onTune}/>
   {(cajamarca.length > 0 || world.length > 0) && <div className="live-place-section">
     <div className="live-place-heading">
       <div><p className="live-rail-eyebrow">UNA NUEVA CIUDAD, UNA NUEVA HISTORIA</p><h2>Viaja con el dial</h2></div>
       <div className="live-place-tabs" role="group" aria-label="Explorar por ubicación">
         <button type="button" onClick={()=>setPlace('cajamarca')} aria-pressed={place==='cajamarca'}
           disabled={!cajamarca.length}><MapPin size={14}/> Cajamarca</button>
         <button type="button" onClick={()=>setPlace('world')} aria-pressed={place==='world'}
           disabled={!world.length}><Globe2 size={14}/> Mundo</button>
       </div>
     </div>
     <div className="live-rail-scroller live-place-results" aria-live="polite">
       {options.map(s=><button type="button" key={stationKey(s)} className="live-rail-item" onClick={()=>onTune(s)} aria-label={`Escuchar ${s.name}`}>
         <StationArtwork station={s} variant="rail"/>
         <span className="live-rail-item-copy"><strong>{s.name}</strong><span>{[s.region,s.country].filter(Boolean).join(' · ') || 'Radio en directo'}</span></span>
         <span className="live-rail-play" aria-hidden="true"><Play size={15} fill="currentColor"/></span>
       </button>)}
     </div>
   </div>}
 </div>
}
