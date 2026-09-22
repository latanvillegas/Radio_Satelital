"use client"
import React, { useEffect, useState } from 'react'
import type { Station } from '@/types/station'
import {
  getQuickPresets,
  setQuickPreset,
  clearQuickPreset,
  subscribeQuickPresets,
  initQuickPresets,
} from '@/lib/services/quick-presets'
import { BookmarkPlus, Radio, X } from 'lucide-react'

type Props = {
  currentStation: Station | null
  onPlayStation: (station: Station) => void
  stations: Station[]
}

export default function QuickPresetsBar({ currentStation, onPlayStation, stations }: Props) {
  const [presets, setPresets] = useState<(Station | null)[]>([])

  useEffect(() => {
    initQuickPresets(stations.slice(0, 6))
    return subscribeQuickPresets((updated) => {
      setPresets([...updated])
    })
  }, [stations])

  // Atajos de teclado numéricos (teclas 1 a 6) para cambio instantáneo de dial
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return
      }

      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 6) {
        const slot = num - 1
        const target = presets[slot]
        if (target) {
          e.preventDefault()
          onPlayStation(target)
        } else if (currentStation) {
          e.preventDefault()
          setQuickPreset(slot, currentStation)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [presets, currentStation, onPlayStation])

  const handleSlotClick = (index: number) => {
    const target = presets[index]
    if (target) {
      onPlayStation(target)
    } else if (currentStation) {
      setQuickPreset(index, currentStation)
    }
  }

  const handleSaveCurrent = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentStation) {
      setQuickPreset(index, currentStation)
    }
  }

  const handleClear = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    clearQuickPreset(index)
  }

  return (
    <div className="bg-zinc-950/70 border border-white/[0.08] rounded-2xl p-3 sm:p-4 mb-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Presets de Dial Rápido (Teclas 1 - 6)
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
          {currentStation ? 'Haz clic en + para memorizar emisora activa' : 'Sintoniza con un toque'}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, index) => {
          const station = presets[index]
          const isCurrent = currentStation && station && currentStation.name === station.name

          return (
            <div
              key={index}
              onClick={() => handleSlotClick(index)}
              className={`relative group rounded-xl p-2 sm:p-2.5 border text-left cursor-pointer transition-all select-none flex flex-col justify-between min-h-[58px] ${
                isCurrent
                  ? 'bg-red-500/20 border-red-500/60 shadow-lg shadow-red-500/20 ring-1 ring-red-500/40'
                  : station
                  ? 'bg-zinc-900/80 border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20'
                  : 'bg-zinc-950/40 border-dashed border-white/[0.08] hover:border-red-500/40 hover:bg-red-500/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono font-black px-1.5 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-red-500 text-white'
                      : 'bg-white/[0.08] text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {index + 1}
                </span>

                {station ? (
                  <button
                    type="button"
                    onClick={(e) => handleClear(index, e)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity p-0.5"
                    title="Borrar preset"
                  >
                    <X size={12} />
                  </button>
                ) : currentStation ? (
                  <button
                    type="button"
                    onClick={(e) => handleSaveCurrent(index, e)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                    title="Memorizar emisora actual en este dial"
                  >
                    <BookmarkPlus size={13} />
                  </button>
                ) : null}
              </div>

              {station ? (
                <div className="mt-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-100 truncate leading-tight">
                    {station.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {station.country || 'En vivo'}
                  </p>
                </div>
              ) : (
                <div className="mt-1">
                  <p className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300">
                    + Asignar
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
