"use client"
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard, Command } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItem {
  keys: string[]
  label: string
  category: 'Control de Audio' | 'Consola de Estudio' | 'Navegación'
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Espacio'], label: 'Reproducir / Pausar transmisión', category: 'Control de Audio' },
  { keys: ['M'], label: 'Silenciar / Restaurar volumen (Mute)', category: 'Control de Audio' },
  { keys: ['Ctrl', '→'], label: 'Siguiente emisora en el dial', category: 'Control de Audio' },
  { keys: ['Ctrl', '←'], label: 'Emisora anterior en el dial', category: 'Control de Audio' },
  { keys: ['1 ... 6'], label: 'Sintonizar presets rápidos memorizados', category: 'Control de Audio' },
  { keys: ['E'], label: 'Abrir Ecualizador Paramétrico DSP', category: 'Consola de Estudio' },
  { keys: ['O'], label: 'Abrir Modo Cabina "On-Air" / Vúmetros', category: 'Consola de Estudio' },
  { keys: ['R'], label: 'Sintonizar emisora aleatoria (Sorpréndeme)', category: 'Navegación' },
  { keys: ['?'], label: 'Mostrar este panel de atajos', category: 'Navegación' },
  { keys: ['Esc'], label: 'Cerrar ventana o modal activo', category: 'Navegación' },
]

export default function ShortcutsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-6 text-zinc-100 max-h-[85vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Atajos de Teclado de Radio Satelital"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-200">
                <Keyboard size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Atajos de Teclado Broadcast
                </h3>
                <p className="text-xs text-zinc-400">
                  Controla la transmisión rápidamente sin levantar las manos del teclado
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar atajos"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {SHORTCUTS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900/50 border border-white/[0.04] text-xs"
              >
                <span className="text-zinc-300 font-medium">{item.label}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.keys.map((k, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px] font-bold shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.06] text-center text-[11px] text-zinc-500 font-mono">
            Puedes pulsar <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">?</kbd> en cualquier momento para abrir esta guía.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
