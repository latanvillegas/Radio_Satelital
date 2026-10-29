"use client"
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Maximize2, Pause, Play, Radio, Share2, SkipBack, SkipForward, Sliders, Volume2, VolumeX, X } from 'lucide-react'
import type { Station } from '@/types/station'
import { usePlayer } from '@/hooks/player'
import AudioVisualizer from '@/components/features/AudioVisualizer'
import StationArtwork from '@/components/features/StationArtwork'
import SleepTimerModal from '@/components/features/SleepTimerModal'
import EqualizerModal from '@/components/features/EqualizerModal'
import StudioDisplayModal from '@/components/features/StudioDisplayModal'

type Props={currentStation:Station|null;onNextStation:()=>void;onPrevStation:()=>void;stations?:Station[];onPlayStation?:(station:Station)=>void;visible?:boolean}

export default function Player({currentStation,onNextStation,onPrevStation,visible=true}:Props){
 const {isPlaying,togglePlay,playbackStatus,statusMessage,secondsElapsed,sleepTimerMinutes,setSleepTimer}=usePlayer()
 const [expanded,setExpanded]=useState(false),[eq,setEq]=useState(false),[studio,setStudio]=useState(false),[copied,setCopied]=useState(false)
 const closeRef=useRef<HTMLButtonElement|null>(null)
 const dialogRef=useRef<HTMLDivElement|null>(null)
 useEffect(()=>{
  if(!expanded)return
  const previousFocus=document.activeElement instanceof HTMLElement ? document.activeElement : null
  const previousOverflow=document.body.style.overflow
  document.body.style.overflow='hidden'
  closeRef.current?.focus()
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();setExpanded(false);return}
   if(event.key!=='Tab'||!dialogRef.current)return
   const focusable=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])')).filter(el=>el.getClientRects().length>0)
   if(!focusable.length){event.preventDefault();dialogRef.current.focus();return}
   const first=focusable[0],last=focusable[focusable.length-1]
   if(event.shiftKey&&(document.activeElement===first||!dialogRef.current.contains(document.activeElement))){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&(document.activeElement===last||!dialogRef.current.contains(document.activeElement))){event.preventDefault();first.focus()}
  }
  document.addEventListener('keydown',onKey)
  return ()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow;previousFocus?.focus()}
 },[expanded])
 const [volume,setVolume]=useState(()=>typeof window==='undefined'?0.85:Number(localStorage.getItem('radio_player_volume')||0.85)); const [prevVolume,setPrevVolume]=useState(.85)
 useEffect(()=>{const a=document.getElementById('radioPlayer') as HTMLAudioElement|null;if(a)a.volume=volume},[volume])
 const setVol=(v:number)=>{setVolume(v);localStorage.setItem('radio_player_volume',String(v));const a=document.getElementById('radioPlayer') as HTMLAudioElement|null;if(a)a.volume=v}
 const mute=()=>{if(volume>0){setPrevVolume(volume);setVol(0)}else setVol(prevVolume||.8)}
 const share=async()=>{if(!currentStation)return;const text=`Escuchando ${currentStation.name} en Radio Satelital`;try{if(navigator.share){await navigator.share({title:currentStation.name,text,url:location.href})}else{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1800)}}catch{}}
 const name=currentStation?.name||'Radio Satelital'; const meta=currentStation?.country?`${currentStation.country}${currentStation.region?` · ${currentStation.region}`:''}`:'Selecciona una emisora'; const live=playbackStatus==='reconnecting'?'Reconectando':playbackStatus==='loading'?'Conectando':playbackStatus==='offline'?'Sin conexión':playbackStatus==='error'?'Sin señal':isPlaying?'En vivo':'Listo'; const time=new Date(secondsElapsed*1000).toISOString().substring(14,19)
 return <>
  <footer className={`observatory-player-bar fixed bottom-0 inset-x-0 z-40 bg-black/95 border-t border-white/[0.08] backdrop-blur-xl transition-transform ${visible?'translate-y-0':'translate-y-full'}`}>
   <div className="observatory-player-inner max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
    <button type="button" onClick={()=>setExpanded(true)} aria-label="Abrir reproductor de pantalla completa" aria-haspopup="dialog" aria-expanded={expanded} className="flex items-center gap-3 min-w-0 flex-1 text-left"><StationArtwork station={currentStation} variant="card"/><div className="min-w-0"><div className="text-sm font-bold truncate" style={isPlaying?{color:'var(--accent)'}:undefined}>{name}</div><div className="text-[11px] text-zinc-400 truncate" role="status">{statusMessage || meta}</div></div></button>
    <div className="flex items-center gap-1 sm:gap-2"><button type="button" onClick={onPrevStation} aria-label="Emisora anterior" className="w-10 h-11 grid place-items-center text-zinc-400 hover:text-white"><SkipBack size={18}/></button><button onClick={togglePlay} disabled={!currentStation} aria-label={isPlaying ? "Pausar radio" : "Reproducir radio"} className="w-11 h-11 rounded-full grid place-items-center text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed" style={{backgroundColor:'var(--accent)'}}>{isPlaying?<Pause size={20} fill="currentColor"/>:<Play size={20} fill="currentColor" className="ml-0.5"/>}</button><button type="button" onClick={onNextStation} aria-label="Emisora siguiente" className="w-10 h-11 grid place-items-center text-zinc-400 hover:text-white"><SkipForward size={18}/></button></div>
    <div className="hidden sm:flex flex-1 justify-end items-center gap-2"><span className="observatory-player-status text-[10px] font-bold uppercase" style={{color:isPlaying?'var(--accent)':'#71717a'}}>{live}</span><button type="button" onClick={()=>setExpanded(true)} aria-label="Ampliar reproductor" className="w-10 h-11 grid place-items-center text-zinc-400 hover:text-white"><Maximize2 size={17}/></button></div>
   </div>
  </footer>

  <AnimatePresence>{expanded&&<div className="dial-player-overlay fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={()=>setExpanded(false)}/><motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="dial-player-dialog-title" tabIndex={-1} initial={{opacity:0,scale:.98,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.98}} className="dial-player-fullscreen relative w-full rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-7 shadow-2xl">
   <div className="flex items-center justify-between mb-5"><span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.16em]" style={{color:'var(--accent)'}}><span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:'var(--accent)'}}/>{live}</span><div className="flex gap-1"><button ref={closeRef} type="button" onClick={()=>setExpanded(false)} aria-label="Cerrar reproductor de pantalla completa" className="dial-player-close w-11 h-11 rounded-full grid place-items-center text-zinc-400 hover:bg-white/[.06] hover:text-white"><X size={23}/></button></div></div>
   <div className="dial-player-identity text-center flex flex-col items-center"><StationArtwork station={currentStation} variant="hero" className="dial-expanded-art"/><h2 id="dial-player-dialog-title" className="dial-player-title mt-5 text-2xl font-black tracking-tight text-white">{name}</h2><p className="mt-1 text-sm text-zinc-400 truncate max-w-full">{meta}</p></div>
   <div className="dial-player-spectrum my-5 h-14 rounded-2xl bg-black/40 border border-white/[.05] flex items-center justify-center"><AudioVisualizer isPlaying={isPlaying} variant="card"/></div>
   <div className="dial-player-transport flex items-center justify-center gap-7"><button type="button" aria-label="Emisora anterior" onClick={onPrevStation} className="w-12 h-12 rounded-full grid place-items-center text-zinc-300 hover:bg-white/[.06]"><SkipBack size={23}/></button><button onClick={togglePlay} disabled={!currentStation} aria-label={isPlaying ? "Pausar radio" : "Reproducir radio"} className="w-16 h-16 rounded-full grid place-items-center text-white shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{backgroundColor:'var(--accent)',boxShadow:'0 8px 30px var(--accent-glow)'}}>{isPlaying?<Pause size={27} fill="currentColor"/>:<Play size={27} fill="currentColor" className="ml-1"/>}</button><button type="button" aria-label="Emisora siguiente" onClick={onNextStation} className="w-12 h-12 rounded-full grid place-items-center text-zinc-300 hover:bg-white/[.06]"><SkipForward size={23}/></button></div>
   <div className="mt-5 text-center text-[11px] text-zinc-600">{isPlaying?`Escuchando · ${time}`:'Pulsa reproducir para escuchar'}</div>
   <div className="dial-player-volume mt-5 pt-4 border-t border-white/[.07] flex items-center gap-3"><button onClick={mute} className="text-zinc-400 hover:text-white">{volume===0?<VolumeX size={18}/>:<Volume2 size={18}/>}</button><input aria-label="Volumen" type="range" min="0" max="1" step=".01" value={volume} onChange={e=>setVol(Number(e.target.value))} className="flex-1" style={{accentColor:'var(--accent)'}}/><button onClick={share} className="h-9 px-3 rounded-xl inline-flex items-center gap-2 bg-white/[.05] hover:bg-white/[.09] text-xs font-semibold text-zinc-300">{copied?<Check size={14}/>:<Share2 size={14}/>}<span className="hidden sm:inline">{copied?'Copiado':'Compartir'}</span></button></div>
  <div className="dial-player-expanded-tools"><SleepTimerModal currentMinutes={sleepTimerMinutes} onSetTimer={setSleepTimer}/><button type="button" onClick={()=>{setExpanded(false);setEq(true)}}><Sliders size={16}/> Ecualizador</button><button type="button" onClick={()=>{setExpanded(false);setStudio(true)}}><Radio size={16}/> Cabina</button></div></motion.div></div>}</AnimatePresence>
  <EqualizerModal isOpen={eq} onClose={()=>setEq(false)}/><StudioDisplayModal isOpen={studio} onClose={()=>setStudio(false)} currentStation={currentStation} isPlaying={isPlaying} togglePlay={togglePlay} onNextStation={onNextStation} onPrevStation={onPrevStation} onOpenEq={()=>{setStudio(false);setEq(true)}}/>
 </>
}
