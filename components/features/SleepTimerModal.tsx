"use client"
import React, { useState } from 'react'
import { Moon, Check, X } from 'lucide-react'

type Props = {
  currentMinutes: number | null
  onSetTimer: (minutes: number | null) => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 90]

export default function SleepTimerModal({ currentMinutes, onSetTimer }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sleep-timer-wrapper">
      <button
        type="button"
        className={`sleep-timer-toggle-btn ${currentMinutes ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={currentMinutes ? `Apagado en ${currentMinutes} min` : 'Temporizador de apagado'}
        aria-label="Temporizador de apagado"
      >
        <Moon size={16} strokeWidth={2.2} />
        {currentMinutes ? <span>{currentMinutes}m</span> : <span>Dormir</span>}
      </button>

      {isOpen && (
        <div className="sleep-timer-popover glass-panel shadow-lg">
          <div className="sleep-timer-header">
            <h4>Temporizador</h4>
            <button
              type="button"
              className="sleep-timer-close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
          <p className="sleep-timer-desc">El audio se pausará automáticamente:</p>
          <div className="sleep-timer-options">
            {TIMER_OPTIONS.map((min) => (
              <button
                key={min}
                type="button"
                className={`sleep-timer-opt ${currentMinutes === min ? 'selected' : ''}`}
                onClick={() => {
                  onSetTimer(min)
                  setIsOpen(false)
                }}
              >
                <span>{min} min</span>
                {currentMinutes === min && <Check size={14} />}
              </button>
            ))}
            {currentMinutes && (
              <button
                type="button"
                className="sleep-timer-opt cancel"
                onClick={() => {
                  onSetTimer(null)
                  setIsOpen(false)
                }}
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
