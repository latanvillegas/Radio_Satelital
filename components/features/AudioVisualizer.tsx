"use client"
import React, { useEffect, useRef } from 'react'

type Props = {
  isPlaying: boolean
  variant?: 'mini' | 'card' | 'full' | 'compact'
  barCount?: number
}

export default function AudioVisualizer({ isPlaying, variant = 'mini', barCount = 16 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    const count = variant === 'mini' ? 12 : variant === 'card' ? 24 : 36
    const heights = new Array(count).fill(4)

    const render = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const barWidth = Math.max(2, Math.floor((width - (count - 1) * 2) / count))
      const gap = 2

      for (let i = 0; i < count; i++) {
        if (isPlaying) {
          // Generar movimiento rítmico armónico
          const targetHeight = Math.min(
            height,
            Math.max(
              4,
              Math.sin(Date.now() / 150 + i * 0.4) * (height * 0.35) +
                Math.cos(Date.now() / 320 - i * 0.6) * (height * 0.3) +
                height * 0.4
            )
          )
          heights[i] += (targetHeight - heights[i]) * 0.25
        } else {
          // Bajar suavemente a reposo
          heights[i] += (3 - heights[i]) * 0.15
        }

        const barHeight = Math.max(2, heights[i])
        const x = i * (barWidth + gap)
        const y = height - barHeight

        // Gradiente profesional rojo/ámbar
        const grad = ctx.createLinearGradient(0, height, 0, 0)
        grad.addColorStop(0, '#ff4444')
        grad.addColorStop(0.6, '#ff6b6b')
        grad.addColorStop(1, '#ff9e7d')

        ctx.fillStyle = grad
        ctx.beginPath()
        // Bordes redondeados sutiles en la parte superior
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
  }, [isPlaying, variant])

  const dimensions =
    variant === 'mini'
      ? { width: 72, height: 20 }
      : variant === 'card'
      ? { width: 180, height: 36 }
      : { width: 280, height: 48 }

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={`audio-visualizer-canvas audio-visualizer-${variant}`}
      aria-label="Visualizador acústico"
    />
  )
}
