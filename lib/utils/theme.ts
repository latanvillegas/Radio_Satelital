const THEME_KEY = 'ultra_theme'
const UI_SCALE_KEY = 'ultra_ui_scale'
const UI_SCALE_MODE_KEY = 'ultra_ui_scale_mode'

export type ThemeName =
  | 'amoled'
  | 'gold'
  | 'purple'
  | 'white'
  | 'wear-ocean'
  | 'wear-sunset'
  | 'wear-galaxy'
  | 'wear-mint'
  | 'wear-cherry'

export type UiScale = 'small' | 'medium' | 'large' | 'xlarge'
export type UiScaleMode = 'auto' | UiScale

export type ThemeTokens = {
  label: string
  themeColor: string
  accent: string
  accentHover: string
  accentGlow: string
  accentSubtle: string
  bgDark: string
  textMain: string
  textMuted: string
  bgGlass: string
  borderGlass: string
}

export const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  amoled: {
    label: 'AMOLED Carmesí Studio',
    themeColor: '#000000',
    accent: '#ef4444',
    accentHover: '#f87171',
    accentGlow: 'rgba(239, 68, 68, 0.28)',
    accentSubtle: 'rgba(239, 68, 68, 0.14)',
    bgDark: '#000000',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    bgGlass: 'rgba(255, 255, 255, 0.03)',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
  },
  gold: {
    label: 'AMOLED Gold Luxury',
    themeColor: '#000000',
    accent: '#d4af37',
    accentHover: '#f5d77f',
    accentGlow: 'rgba(212, 175, 55, 0.28)',
    accentSubtle: 'rgba(212, 175, 55, 0.14)',
    bgDark: '#000000',
    textMain: '#fffdfa',
    textMuted: '#c5b591',
    bgGlass: 'rgba(212, 175, 55, 0.04)',
    borderGlass: 'rgba(212, 175, 55, 0.18)',
  },
  purple: {
    label: 'AMOLED Neon Purple',
    themeColor: '#000000',
    accent: '#a855f7',
    accentHover: '#c084fc',
    accentGlow: 'rgba(168, 85, 247, 0.28)',
    accentSubtle: 'rgba(168, 85, 247, 0.14)',
    bgDark: '#000000',
    textMain: '#faf5ff',
    textMuted: '#baabc9',
    bgGlass: 'rgba(168, 85, 247, 0.04)',
    borderGlass: 'rgba(168, 85, 247, 0.18)',
  },
  white: {
    label: 'AMOLED Platinum Silver',
    themeColor: '#000000',
    accent: '#ffffff',
    accentHover: '#e2e8f0',
    accentGlow: 'rgba(255, 255, 255, 0.25)',
    accentSubtle: 'rgba(255, 255, 255, 0.12)',
    bgDark: '#000000',
    textMain: '#ffffff',
    textMuted: '#a1a1aa',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    borderGlass: 'rgba(255, 255, 255, 0.18)',
  },
  'wear-ocean': {
    label: 'AMOLED Deep Ocean',
    themeColor: '#000000',
    accent: '#06b6d4',
    accentHover: '#22d3ee',
    accentGlow: 'rgba(6, 182, 212, 0.28)',
    accentSubtle: 'rgba(6, 182, 212, 0.14)',
    bgDark: '#000000',
    textMain: '#f0fdfa',
    textMuted: '#87bcc5',
    bgGlass: 'rgba(6, 182, 212, 0.04)',
    borderGlass: 'rgba(6, 182, 212, 0.18)',
  },
  'wear-sunset': {
    label: 'AMOLED Sunset Glow',
    themeColor: '#000000',
    accent: '#f97316',
    accentHover: '#fb923c',
    accentGlow: 'rgba(249, 115, 22, 0.28)',
    accentSubtle: 'rgba(249, 115, 22, 0.14)',
    bgDark: '#000000',
    textMain: '#fff7ed',
    textMuted: '#cf9b8a',
    bgGlass: 'rgba(249, 115, 22, 0.04)',
    borderGlass: 'rgba(249, 115, 22, 0.18)',
  },
  'wear-galaxy': {
    label: 'AMOLED Galaxy Blue',
    themeColor: '#000000',
    accent: '#3b82f6',
    accentHover: '#60a5fa',
    accentGlow: 'rgba(59, 130, 246, 0.28)',
    accentSubtle: 'rgba(59, 130, 246, 0.14)',
    bgDark: '#000000',
    textMain: '#eff6ff',
    textMuted: '#99a7e0',
    bgGlass: 'rgba(59, 130, 246, 0.04)',
    borderGlass: 'rgba(59, 130, 246, 0.18)',
  },
  'wear-mint': {
    label: 'AMOLED Emerald Mint',
    themeColor: '#000000',
    accent: '#10b981',
    accentHover: '#34d399',
    accentGlow: 'rgba(16, 185, 129, 0.28)',
    accentSubtle: 'rgba(16, 185, 129, 0.14)',
    bgDark: '#000000',
    textMain: '#ecfdf5',
    textMuted: '#95bfb8',
    bgGlass: 'rgba(16, 185, 129, 0.04)',
    borderGlass: 'rgba(16, 185, 129, 0.18)',
  },
  'wear-cherry': {
    label: 'AMOLED Ruby Cherry',
    themeColor: '#000000',
    accent: '#f43f5e',
    accentHover: '#fb7185',
    accentGlow: 'rgba(244, 63, 94, 0.28)',
    accentSubtle: 'rgba(244, 63, 94, 0.14)',
    bgDark: '#000000',
    textMain: '#fff1f2',
    textMuted: '#c79097',
    bgGlass: 'rgba(244, 63, 94, 0.04)',
    borderGlass: 'rgba(244, 63, 94, 0.18)',
  },
}

const SCALE_VALUE: Record<UiScale, string> = {
  small: '0.9',
  medium: '1',
  large: '1.12',
  xlarge: '1.24',
}

export function getAvailableThemes() {
  return Object.keys(THEME_TOKENS) as ThemeName[]
}

export function setTheme(name: ThemeName) {
  try {
    const selected = THEME_TOKENS[name] ? name : 'amoled'
    const tokens = THEME_TOKENS[selected]

    const root = document.documentElement
    root.setAttribute('data-theme', selected)
    root.style.setProperty('--accent', tokens.accent)
    root.style.setProperty('--accent-hover', tokens.accentHover)
    root.style.setProperty('--accent-glow', tokens.accentGlow)
    root.style.setProperty('--accent-subtle', tokens.accentSubtle)
    root.style.setProperty('--bg-dark', tokens.bgDark)
    root.style.setProperty('--text-main', tokens.textMain)
    root.style.setProperty('--text-muted', tokens.textMuted)
    root.style.setProperty('--bg-glass', tokens.bgGlass)
    root.style.setProperty('--border-glass', tokens.borderGlass)

    if (typeof document !== 'undefined' && document.body) {
      document.body.style.backgroundColor = tokens.bgDark
    }

    localStorage.setItem(THEME_KEY, selected)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', tokens.themeColor)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('theme-changed', { detail: { theme: selected, tokens } })
      )
    }
  } catch (e) {}
}

export function getTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(THEME_KEY) as ThemeName | null
    return stored && THEME_TOKENS[stored] ? stored : 'amoled'
  } catch (e) {
    return 'amoled'
  }
}

export function detectScreenSize(): UiScale {
  if (typeof window === 'undefined') return 'medium'
  const width = window.innerWidth
  
  if (width < 600) return 'small'
  if (width < 1024) return 'medium'
  if (width < 1440) return 'large'
  return 'xlarge'
}

export function setUiScaleMode(mode: UiScaleMode) {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(UI_SCALE_MODE_KEY, mode)
    
    if (mode === 'auto') {
      const detected = detectScreenSize()
      setActualUiScale(detected)
    } else {
      setActualUiScale(mode)
    }
  } catch (e) {}
}

export function getUiScaleMode(): UiScaleMode {
  try {
    if (typeof window === 'undefined') return 'auto'
    
    const stored = localStorage.getItem(UI_SCALE_MODE_KEY) as UiScaleMode | null
    if (stored === 'auto' || (stored && SCALE_VALUE[stored as UiScale])) {
      return stored
    }
    return 'auto'
  } catch (e) {
    return 'auto'
  }
}

export function setActualUiScale(size: UiScale) {
  try {
    const selected = SCALE_VALUE[size] ? size : 'medium'
    document.documentElement.setAttribute('data-ui-scale', selected)
    document.documentElement.style.setProperty('--ui-scale', SCALE_VALUE[selected])
    localStorage.setItem(UI_SCALE_KEY, selected)
  } catch (e) {}
}

export function getUiScale(): UiScale {
  try {
    const stored = localStorage.getItem(UI_SCALE_KEY) as UiScale | null
    return stored && SCALE_VALUE[stored] ? stored : 'medium'
  } catch (e) {
    return 'medium'
  }
}

export function initializeThemeSettings() {
  setTheme(getTheme())
  const scaleMode = getUiScaleMode()
  if (scaleMode === 'auto') {
    setUiScaleMode('auto')
  } else {
    setActualUiScale(scaleMode as UiScale)
  }
}
