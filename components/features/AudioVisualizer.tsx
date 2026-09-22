"use client"
import React, { useEffect, useRef } from 'react'
import { getAnalyserData } from '@/lib/services/audio-dsp'

type Props = {
  isPlaying: boolean
  variant?: 'mini' | 'card' | 'full' | 'compact' | 'studio'
  barCount?: number
}

export default function AudioVisualizer({ isPlaying, variant = 'mini', barCount }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    const count =
      barCount ||
      (variant === 'mini' ? 12 : variant === 'card' ? 24 : variant === 'studio' ? 48 : 36)
    const heights = new Array(count).fill(4)

    const render = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const gap = variant === 'mini' ? 1.5 : 2
      const barWidth = Math.max(2, Math.floor((width - (count - 1) * gap) / count))

      // Intentar obtener datos reales del Analyser de Web Audio
      const realData = isPlaying ? getAnalyserData() : null
      const hasRealAudio =
        realData && realData.some((val) => val > 5)

      for (let i = 0; i < count; i++) {
        if (isPlaying) {
          let targetHeight: number
          if (hasRealAudio && realData) {
            // Mapear el índice de barra a los bins de frecuencia (rango logarítmico para mejor visual)
            const binIndex = Math.min(
              realData.length - 1,
              Math.floor(Math.pow(i / count, 1.3) * (realData.length * 0.85))
            )
            const normalized = realData[binIndex] / 255
            targetHeight = Math.max(3, normalized * height)
          } else {
            // Animación armónica rítmica fluida de contingencia
            targetHeight = Math.min(
              height,
              Math.max(
                4,
                Math.sin(Date.now() / 140 + i * 0.38) * (height * 0.35) +
                  Math.cos(Date.now() / 310 - i * 0.55) * (height * 0.3) +
                  height * 0.42
              )
            )
          }
          heights[i] += (targetHeight - heights[i]) * 0.28
        } else {
          // Bajar suavemente a reposo
          heights[i] += (3 - heights[i]) * 0.15
        }

        const barHeight = Math.max(2, heights[i])
        const x = i * (barWidth + gap)
        const y = height - barHeight

        // Gradiente profesional de estudio adaptado al tema actual
        const accent =
          (typeof window !== 'undefined'
            ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
            : '') || '#ef4444'
        const accentHover =
          (typeof window !== 'undefined'
            ? getComputedStyle(document.documentElement).getPropertyValue('--accent-hover').trim()
            : '') || '#f87171'

        const grad = ctx.createLinearGradient(0, height, 0, 0)
        grad.addColorStop(0, accent)
        grad.addColorStop(0.6, accentHover)
        grad.addColorStop(1, '#ffffff')

        ctx.fillStyle = grad
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0])
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }

      animFrame = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animFrame)
    }
  }, [isPlaying, variant, barCount])

  const dimensions =
    variant === 'mini'
      ? { width: 72, height: 20 }
      : variant === 'card'
      ? { width: 180, height: 36 }
      : variant === 'studio'
      ? { width: 440, height: 64 }
      : { width: 280, height: 48 }

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={`audio-visualizer-canvas audio-visualizer-${variant}`}
      aria-label="Visualizador de espectro acústico"
    />
  )
}
