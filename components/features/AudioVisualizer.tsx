"use client"
import React, { useEffect, useRef } from 'react'
import { getAnalyserData } from '@/lib/services/audio-dsp'
import { visualizerFrameInterval } from '@/lib/utils/render-budget'

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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!isPlaying) return

    const count = barCount || (variant === 'mini' ? 12 : variant === 'card' ? 24 : variant === 'studio' ? 48 : 36)
    const heights = new Float32Array(count).fill(3)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    const frameMs = visualizerFrameInterval({
      saveData: Boolean(connection?.saveData),
      mobile: window.matchMedia('(max-width: 767px)').matches,
    })
    const gap = variant === 'mini' ? 1.5 : 2
    const barWidth = Math.max(2, Math.floor((canvas.width - (count - 1) * gap) / count))
    let raf = 0
    let lastFrame = 0
    let inViewport = true
    let gradient: CanvasGradient | null = null

    const updateGradient = () => {
      const style = getComputedStyle(document.documentElement)
      gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
      gradient.addColorStop(0, style.getPropertyValue('--accent').trim() || '#ef4444')
      gradient.addColorStop(.6, style.getPropertyValue('--accent-hover').trim() || '#f87171')
      gradient.addColorStop(1, '#ffffff')
    }
    updateGradient()
    const draw = (timestamp: number) => {
      raf = 0
      if (document.hidden || !inViewport || reducedMotion.matches) return
      if (timestamp - lastFrame >= frameMs) {
        lastFrame = timestamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const data = getAnalyserData()
        // The existing visual fallback is decorative, not a verified audio level.
        const hasAudio = Boolean(data && data.some(value => value > 5))
        for (let i = 0; i < count; i++) {
          let targetHeight: number
          if (hasAudio && data) {
            const bin = Math.min(data.length - 1, Math.floor(Math.pow(i / count, 1.3) * data.length * .85))
            targetHeight = Math.max(3, data[bin] / 255 * canvas.height)
          } else {
            targetHeight = Math.min(canvas.height, Math.max(4,
              Math.sin(timestamp / 140 + i * .38) * canvas.height * .35 +
              Math.cos(timestamp / 310 - i * .55) * canvas.height * .3 +
              canvas.height * .42))
          }
          heights[i] += (targetHeight - heights[i]) * .28
          const barHeight = Math.max(2, heights[i])
          ctx.fillStyle = gradient || '#10b981'
          ctx.beginPath()
          if (ctx.roundRect) ctx.roundRect(i * (barWidth + gap), canvas.height - barHeight, barWidth, barHeight, [2, 2, 0, 0])
          else ctx.rect(i * (barWidth + gap), canvas.height - barHeight, barWidth, barHeight)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    const restart = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      if (!document.hidden && inViewport && !reducedMotion.matches) {
        lastFrame = 0
        raf = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    const themeChange = () => updateGradient()
    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(entries => {
          inViewport = entries[0]?.isIntersecting ?? false
          restart()
        }, { threshold: 0 })
      : null
    observer?.observe(canvas)
    document.addEventListener('visibilitychange', restart)
    reducedMotion.addEventListener?.('change', restart)
    window.addEventListener('theme-changed', themeChange)
    restart()
    return () => {
      if (raf) cancelAnimationFrame(raf)
      observer?.disconnect()
      document.removeEventListener('visibilitychange', restart)
      reducedMotion.removeEventListener?.('change', restart)
      window.removeEventListener('theme-changed', themeChange)
    }
  }, [isPlaying, variant, barCount])

  const dimensions = variant === 'mini' ? { width: 72, height: 20 }
    : variant === 'card' ? { width: 180, height: 36 }
    : variant === 'studio' ? { width: 440, height: 64 }
    : { width: 280, height: 48 }

  return <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height}
    className={'audio-visualizer-canvas audio-visualizer-' + variant}
    aria-label="Visualizador de espectro acústico" />
}
