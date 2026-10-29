"use client"
import { useEffect } from 'react'
import { initializeThemeSettings } from '../../lib/utils/theme'

export default function ThemeInitializer() {
  useEffect(() => {
    return initializeThemeSettings()
  }, [])

  return null
}
