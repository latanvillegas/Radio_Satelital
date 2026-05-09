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

type ThemeTokens = {
  themeColor: string
  accent: string
  accentHover: string
  bgDark: string
  textMain: string
  textMuted: string
  bgGlass: string
  borderGlass: string
}

const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  amoled: {
    themeColor: '#05070a',
    accent: '#7d27ff',
    accentHover: '#9f5dff',
    bgDark: '#05070a',
    textMain: '#e6eef6',
    textMuted: '#9aa7b7',
    bgGlass: 'rgba(255,255,255,0.03)',
    borderGlass: 'rgba(255,255,255,0.08)',
  },
  gold: {
    themeColor: '#1a1509',
    accent: '#d4af37',
    accentHover: '#e2c45f',
    bgDark: '#0f0b04',
    textMain: '#f4ead0',
    textMuted: '#c9b88a',
    bgGlass: 'rgba(255,245,214,0.06)',
    borderGlass: 'rgba(230,199,117,0.24)',
  },
  purple: {
    themeColor: '#13061f',
    accent: '#9a4eff',
    accentHover: '#b681ff',
    bgDark: '#13061f',
    textMain: '#efe6ff',
    textMuted: '#b7a7cf',
    bgGlass: 'rgba(182,129,255,0.08)',
    borderGlass: 'rgba(182,129,255,0.25)',
  },
  white: {
    themeColor: '#f5f7fa',
    accent: '#5b46d9',
    accentHover: '#7665e8',
    bgDark: '#f5f7fa',
    textMain: '#162130',
    textMuted: '#5f6f85',
    bgGlass: 'rgba(255,255,255,0.75)',
    borderGlass: 'rgba(95,111,133,0.22)',
  },
  'wear-ocean': {
    themeColor: '#03131a',
    accent: '#00bcd4',
    accentHover: '#3ed7ea',
    bgDark: '#03131a',
    textMain: '#d9f7fc',
    textMuted: '#87bcc5',
    bgGlass: 'rgba(0,188,212,0.09)',
    borderGlass: 'rgba(62,215,234,0.27)',
  },
  'wear-sunset': {
    themeColor: '#1e0d0a',
    accent: '#ff7043',
    accentHover: '#ff906d',
    bgDark: '#1e0d0a',
    textMain: '#ffe7dd',
    textMuted: '#cf9b8a',
    bgGlass: 'rgba(255,112,67,0.1)',
    borderGlass: 'rgba(255,144,109,0.26)',
  },
  'wear-galaxy': {
    themeColor: '#0a1029',
    accent: '#536dfe',
    accentHover: '#7f92ff',
    bgDark: '#0a1029',
    textMain: '#e3e9ff',
    textMuted: '#99a7e0',
    bgGlass: 'rgba(83,109,254,0.09)',
    borderGlass: 'rgba(127,146,255,0.26)',
  },
  'wear-mint': {
    themeColor: '#041917',
    accent: '#4db6ac',
    accentHover: '#76d1c9',
    bgDark: '#041917',
    textMain: '#dff8f4',
    textMuted: '#95bfb8',
    bgGlass: 'rgba(77,182,172,0.1)',
    borderGlass: 'rgba(118,209,201,0.28)',
  },
  'wear-cherry': {
    themeColor: '#1a060b',
    accent: '#d32f2f',
    accentHover: '#e25a5a',
    bgDark: '#1a060b',
    textMain: '#ffe3e7',
    textMuted: '#c79097',
    bgGlass: 'rgba(211,47,47,0.1)',
    borderGlass: 'rgba(226,90,90,0.26)',
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

    document.documentElement.setAttribute('data-theme', selected)
    document.documentElement.style.setProperty('--accent', tokens.accent)
    document.documentElement.style.setProperty('--accent-hover', tokens.accentHover)
    document.documentElement.style.setProperty('--bg-dark', tokens.bgDark)
    document.documentElement.style.setProperty('--text-main', tokens.textMain)
    document.documentElement.style.setProperty('--text-muted', tokens.textMuted)
    document.documentElement.style.setProperty('--bg-glass', tokens.bgGlass)
    document.documentElement.style.setProperty('--border-glass', tokens.borderGlass)

    localStorage.setItem(THEME_KEY, selected)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', tokens.themeColor)
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
