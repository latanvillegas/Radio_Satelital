"use client"
import React, { useEffect, useState } from 'react'
import { getAvailableThemes, getTheme, getUiScaleMode, setTheme, setUiScaleMode, type ThemeName, type UiScaleMode } from '@/lib/utils/theme'
import { X, Sliders, Palette, Monitor, RotateCcw, Wifi, Gauge, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  open: boolean; onClose: () => void; loading: boolean; error: string | null; stationsCount: number
  setQuery: (value: string) => void
  filters: { countries:string[]; regions:string[]; genres:string[]; setCountry:(value:string)=>void; setRegion:(value:string)=>void; setGenre:(value:string)=>void; activeCountry?:string; activeRegion?:string; activeGenre?:string }
  toggleOnlyFavs: (value:boolean)=>void; onResetFilters:()=>void
}

const scaleOptions: Array<{key:UiScaleMode;label:string}> = [
  {key:'small',label:'Compacto'}, {key:'medium',label:'Estándar'}, {key:'large',label:'Amplio'}
]
const themeLabels: Record<ThemeName,{label:string;color:string}> = {
  amoled:{label:'Rojo',color:'#ef4444'}, gold:{label:'Dorado',color:'#d4af37'}, purple:{label:'Morado',color:'#a855f7'}, white:{label:'Plata',color:'#ffffff'},
  'wear-ocean':{label:'Océano',color:'#06b6d4'}, 'wear-sunset':{label:'Naranja',color:'#f97316'}, 'wear-galaxy':{label:'Azul',color:'#3b82f6'}, 'wear-mint':{label:'Verde',color:'#10b981'}, 'wear-cherry':{label:'Rosa',color:'#f43f5e'}
}

export default function SideMenu({open,onClose,onResetFilters}:Props) {
  const themes=getAvailableThemes(); const [currentTheme,setCurrentTheme]=useState<ThemeName>('amoled'); const [currentScaleMode,setCurrentScaleMode]=useState<UiScaleMode>('auto')
  useEffect(()=>{setCurrentTheme(getTheme());setCurrentScaleMode(getUiScaleMode())},[])
  const selectTheme=(name:ThemeName)=>{setTheme(name);setCurrentTheme(name)}
  const selectScale=(mode:UiScaleMode)=>{setUiScaleMode(mode);setCurrentScaleMode(mode)}
  const effectiveScale = currentScaleMode === 'auto' || currentScaleMode === 'xlarge' ? 'medium' : currentScaleMode

  return <AnimatePresence>{open && <div className="fixed inset-0 z-50 flex justify-end">
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
    <motion.aside initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:28,stiffness:260}} className="relative z-10 w-full sm:w-[400px] max-w-full h-full bg-black border-l border-white/[0.09] shadow-2xl flex flex-col text-zinc-100" role="dialog" aria-modal="true" aria-label="Ajustes">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl grid place-items-center border" style={{backgroundColor:'var(--accent-subtle)',borderColor:'var(--accent-glow)',color:'var(--accent)'}}><Sliders size={17}/></div><div><h2 className="font-bold text-white">Ajustes</h2><p className="text-xs text-zinc-500">Personaliza tu experiencia</p></div></div>
        <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center text-zinc-500 hover:text-white hover:bg-white/[0.07]" aria-label="Cerrar ajustes"><X size={19}/></button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
        <section><div className="flex items-center gap-2 mb-3"><Palette size={14} style={{color:'var(--accent)'}}/><h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Apariencia</h3></div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="text-sm font-semibold text-white">Color de acento</p><p className="text-xs text-zinc-500 mt-0.5">El fondo permanece AMOLED negro.</p>
            <div className="flex flex-wrap gap-3 mt-4">{themes.map(theme=>{const info=themeLabels[theme]||{label:theme,color:'#fff'};const selected=currentTheme===theme;return <button key={theme} onClick={()=>selectTheme(theme)} title={info.label} aria-label={`Tema ${info.label}`} aria-pressed={selected} className="relative w-10 h-10 rounded-full grid place-items-center border-2 transition-transform hover:scale-105" style={{backgroundColor:info.color,borderColor:selected?'white':'rgba(255,255,255,.10)',boxShadow:selected?`0 0 0 3px ${info.color}30`:'none'}}>{selected&&<Check size={16} className={theme==='white'?'text-black':'text-white'} strokeWidth={3}/>}</button>})}</div>
            <p className="mt-3 text-xs font-medium text-zinc-400">{themeLabels[currentTheme]?.label || currentTheme}</p>
          </div>
        </section>

        <section><div className="flex items-center gap-2 mb-3"><Monitor size={14} style={{color:'var(--accent)'}}/><h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Interfaz</h3></div>
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-white/[0.07]">{scaleOptions.map(opt=>{const selected=effectiveScale===opt.key;return <button key={opt.key} onClick={()=>selectScale(opt.key)} className="h-10 rounded-xl text-xs font-semibold transition-colors" style={selected?{backgroundColor:'var(--accent-subtle)',color:'var(--accent)',border:'1px solid var(--accent-glow)'}:{color:'#a1a1aa',border:'1px solid transparent'}}>{opt.label}</button>})}</div>
          <p className="text-[11px] text-zinc-600 mt-2">Estándar funciona mejor en la mayoría de dispositivos.</p>
        </section>

        <section><div className="flex items-center gap-2 mb-3"><Wifi size={14} style={{color:'var(--accent)'}}/><h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Reproducción</h3></div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] divide-y divide-white/[0.06]">
            <div className="p-4 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-zinc-200">Reconexión automática</p><p className="text-xs text-zinc-500 mt-0.5">Recupera el audio si la señal se corta.</p></div><span className="shrink-0 px-2 py-1 rounded-full text-[10px] font-bold" style={{color:'var(--accent)',backgroundColor:'var(--accent-subtle)'}}>ACTIVA</span></div>
            <div className="p-4 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-zinc-200">Audio de baja latencia</p><p className="text-xs text-zinc-500 mt-0.5">Optimizado para radio en directo.</p></div><Gauge size={18} className="text-zinc-500 shrink-0"/></div>
          </div>
        </section>

        <section className="pt-1"><button onClick={onResetFilters} className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.025] hover:bg-white/[0.06] border border-white/[0.07]"><RotateCcw size={14}/> Restablecer filtros</button></section>
      </div>

      <div className="sm:hidden p-4 border-t border-white/[0.08] bg-black"><button onClick={onClose} className="w-full h-12 rounded-xl text-sm font-bold text-black" style={{backgroundColor:'var(--accent)'}}>Listo</button></div>
    </motion.aside>
  </div>}</AnimatePresence>
}
