"use client"
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Heart, Maximize2, MoreHorizontal, Pause, Play, Radio, Share2, SkipBack, SkipForward, Sliders, Volume2, VolumeX, X } from 'lucide-react'
import type { Station } from '@/types/station'
import { usePlayer } from '@/hooks/player'
import AudioVisualizer from '@/components/features/AudioVisualizer'
import SleepTimerModal from '@/components/features/SleepTimerModal'
import EqualizerModal from '@/components/features/EqualizerModal'
import StudioDisplayModal from '@/components/features/StudioDisplayModal'

type Props={currentStation:Station|null;onNextStation:()=>void;onPrevStation:()=>void;stations?:Station[];onPlayStation?:(station:Station)=>void;visible?:boolean}

function Artwork({station,size='mini'}:{station:Station|null;size?:'mini'|'large'}){
 const [bad,setBad]=useState(false); const large=size==='large'; const name=station?.name||'Radio Satelital'; const parts=name.split(/\s+/).filter(Boolean); const initials=((parts[0]?.[0]||'R')+(parts[1]?.[0]||parts[0]?.[1]||'A')).toUpperCase()
 return <div className={`${large?'w-40 h-40 sm:w-48 sm:h-48 rounded-3xl mx-auto flex items-center justify-center':'w-11 h-11 rounded-xl'} shrink-0 overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl`}>
  {station?.logoUrl&&!bad?<img src={station.logoUrl} alt={name} className={`${large?'max-w-full max-h-full w-auto h-auto object-contain mx-auto':'w-full h-full object-contain'} bg-white/[0.03]`} onError={()=>setBad(true)}/>:<div className="w-full h-full grid place-items-center font-black text-zinc-300">{large?<div className="text-center"><Radio size={42} className="mx-auto mb-2"/><span className="text-2xl">{initials}</span></div>:initials}</div>}
 </div>
}

export default function Player({currentStation,onNextStation,onPrevStation,visible=true}:Props){
 const {isPlaying,togglePlay,playbackStatus,secondsElapsed,sleepTimerMinutes,setSleepTimer}=usePlayer()
 const [expanded,setExpanded]=useState(false),[eq,setEq]=useState(false),[studio,setStudio]=useState(false),[more,setMore]=useState(false),[copied,setCopied]=useState(false)
 const [volume,setVolume]=useState(()=>typeof window==='undefined'?0.85:Number(localStorage.getItem('radio_player_volume')||0.85)); const [prevVolume,setPrevVolume]=useState(.85)
 useEffect(()=>{const a=document.getElementById('radioPlayer') as HTMLAudioElement|null;if(a)a.volume=volume},[volume])
 const setVol=(v:number)=>{setVolume(v);localStorage.setItem('radio_player_volume',String(v));const a=document.getElementById('radioPlayer') as HTMLAudioElement|null;if(a)a.volume=v}
 const mute=()=>{if(volume>0){setPrevVolume(volume);setVol(0)}else setVol(prevVolume||.8)}
 const share=async()=>{if(!currentStation)return;const text=`Escuchando ${currentStation.name} en Radio Satelital`;try{if(navigator.share){await navigator.share({title:currentStation.name,text,url:location.href})}else{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1800)}}catch{}}
 const name=currentStation?.name||'Radio Satelital'; const meta=currentStation?.country?`${currentStation.country}${currentStation.region?` · ${currentStation.region}`:''}`:'Selecciona una emisora'; const live=playbackStatus==='loading'?'Conectando':isPlaying?'En vivo':'Listo'; const time=new Date(secondsElapsed*1000).toISOString().substring(14,19)
 return <>
  <footer className={`fixed bottom-0 inset-x-0 z-40 bg-black/95 border-t border-white/[0.08] backdrop-blur-xl transition-transform ${visible?'translate-y-0':'translate-y-full'}`}>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
    <button onClick={()=>setExpanded(true)} className="flex items-center gap-3 min-w-0 flex-1 text-left"><Artwork station={currentStation}/><div className="min-w-0"><div className="text-sm font-bold truncate" style={isPlaying?{color:'var(--accent)'}:undefined}>{name}</div><div className="text-[11px] text-zinc-500 truncate">{meta}</div></div></button>
    <div className="flex items-center gap-1 sm:gap-2"><button onClick={onPrevStation} className="w-9 h-9 grid place-items-center text-zinc-400 hover:text-white"><SkipBack size={18}/></button><button onClick={togglePlay} className="w-11 h-11 rounded-full grid place-items-center text-white shadow-lg" style={{backgroundColor:'var(--accent)'}}>{isPlaying?<Pause size={20} fill="currentColor"/>:<Play size={20} fill="currentColor" className="ml-0.5"/>}</button><button onClick={onNextStation} className="w-9 h-9 grid place-items-center text-zinc-400 hover:text-white"><SkipForward size={18}/></button></div>
    <div className="hidden sm:flex flex-1 justify-end items-center gap-2"><span className="text-[10px] font-bold uppercase" style={{color:isPlaying?'var(--accent)':'#71717a'}}>{live}</span><SleepTimerModal currentMinutes={sleepTimerMinutes} onSetTimer={setSleepTimer}/><button onClick={()=>setExpanded(true)} className="w-9 h-9 grid place-items-center text-zinc-400 hover:text-white"><Maximize2 size={16}/></button></div>
   </div>
  </footer>

  <AnimatePresence>{expanded&&<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={()=>setExpanded(false)}/><motion.div initial={{opacity:0,scale:.96,y:15}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.97}} className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-7 shadow-2xl">
   <div className="flex items-center justify-between mb-5"><span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.16em]" style={{color:'var(--accent)'}}><span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:'var(--accent)'}}/>{live}</span><div className="flex gap-1"><button onClick={()=>setMore(v=>!v)} className="w-9 h-9 rounded-full grid place-items-center text-zinc-400 hover:bg-white/[.06] hover:text-white"><MoreHorizontal size={19}/></button><button onClick={()=>setExpanded(false)} className="w-9 h-9 rounded-full grid place-items-center text-zinc-400 hover:bg-white/[.06] hover:text-white"><X size={19}/></button></div></div>
   {more&&<div className="absolute right-14 top-14 z-20 w-52 p-1.5 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl"><button onClick={()=>{setExpanded(false);setEq(true);setMore(false)}} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-white/[.06]"><Sliders size={15}/> Ecualizador</button><button onClick={()=>{setExpanded(false);setStudio(true);setMore(false)}} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-white/[.06]"><Radio size={15}/> Herramientas avanzadas</button></div>}
   <div className="text-center flex flex-col items-center"><Artwork station={currentStation} size="large"/><h2 className="mt-5 text-2xl font-black tracking-tight text-white">{name}</h2><p className="mt-1 text-sm text-zinc-400 truncate max-w-full">{meta}</p></div>
   <div className="my-5 h-14 rounded-2xl bg-black/40 border border-white/[.05] flex items-center justify-center"><AudioVisualizer isPlaying={isPlaying} variant="card"/></div>
   <div className="flex items-center justify-center gap-7"><button onClick={onPrevStation} className="w-12 h-12 rounded-full grid place-items-center text-zinc-300 hover:bg-white/[.06]"><SkipBack size={23}/></button><button onClick={togglePlay} className="w-16 h-16 rounded-full grid place-items-center text-white shadow-xl active:scale-95" style={{backgroundColor:'var(--accent)',boxShadow:'0 8px 30px var(--accent-glow)'}}>{isPlaying?<Pause size={27} fill="currentColor"/>:<Play size={27} fill="currentColor" className="ml-1"/>}</button><button onClick={onNextStation} className="w-12 h-12 rounded-full grid place-items-center text-zinc-300 hover:bg-white/[.06]"><SkipForward size={23}/></button></div>
   <div className="mt-5 text-center text-[11px] text-zinc-600">{isPlaying?`Escuchando · ${time}`:'Pulsa reproducir para escuchar'}</div>
   <div className="mt-5 pt-4 border-t border-white/[.07] flex items-center gap-3"><button onClick={mute} className="text-zinc-400 hover:text-white">{volume===0?<VolumeX size={18}/>:<Volume2 size={18}/>}</button><input type="range" min="0" max="1" step=".01" value={volume} onChange={e=>setVol(Number(e.target.value))} className="flex-1" style={{accentColor:'var(--accent)'}}/><button onClick={share} className="h-9 px-3 rounded-xl inline-flex items-center gap-2 bg-white/[.05] hover:bg-white/[.09] text-xs font-semibold text-zinc-300">{copied?<Check size={14}/>:<Share2 size={14}/>}<span className="hidden sm:inline">{copied?'Copiado':'Compartir'}</span></button></div>
  </motion.div></div>}</AnimatePresence>
  <EqualizerModal isOpen={eq} onClose={()=>setEq(false)}/><StudioDisplayModal isOpen={studio} onClose={()=>setStudio(false)} currentStation={currentStation} isPlaying={isPlaying} togglePlay={togglePlay} onNextStation={onNextStation} onPrevStation={onPrevStation} onOpenEq={()=>{setStudio(false);setEq(true)}}/>
 </>
}
