"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Moon, Check, X } from 'lucide-react'

interface Props {
  currentMinutes: number | null
  onSetTimer: (minutes: number | null) => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 90] as const

export default function SleepTimerModal({ currentMinutes, onSetTimer }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape, true)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [isOpen])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={
          currentMinutes
            ? `Temporizador activo: apagado en ${currentMinutes} minutos`
            : 'Configurar temporizador de apagado'
        }
        className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap ${
          currentMinutes
            ? 'bg-accent-subtle border-accent text-accent'
            : 'bg-subtle hover:bg-surface border-line text-ink'
        }`}
      >
        <Moon size={16} />
        <span className="tabular-nums">
          {currentMinutes ? `${currentMinutes} min` : 'Dormir'}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Temporizador de apagado automático"
          className="absolute bottom-[calc(100%+10px)] left-0 sm:left-auto sm:right-0 w-60 rounded-2xl bg-elevated border border-line-strong shadow-2xl p-3.5 z-50"
        >
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-sm font-bold text-ink">Apagado automático</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar temporizador"
              className="w-8 h-8 rounded-lg grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle"
            >
              <X size={15} />
            </button>
          </div>
          <p className="text-xs text-ink-secondary mb-3">
            Detener la transmisión después de:
          </p>
          <div className="flex flex-col gap-1.5">
            {TIMER_OPTIONS.map((min) => {
              const selected = currentMinutes === min
              return (
                <button
                  key={min}
                  type="button"
                  onClick={() => {
                    onSetTimer(min)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between w-full min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold tabular-nums transition-colors ${
                    selected
                      ? 'bg-accent-subtle border-accent text-accent'
                      : 'bg-subtle hover:bg-surface border-line text-ink'
                  }`}
                >
                  <span>{min} minutos</span>
                  {selected && <Check size={14} />}
                </button>
              )
            })}

            {currentMinutes !== null && (
              <button
                type="button"
                onClick={() => {
                  onSetTimer(null)
                  setIsOpen(false)
                }}
                className="mt-1 min-h-[40px] w-full px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                Desactivar temporizador
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
