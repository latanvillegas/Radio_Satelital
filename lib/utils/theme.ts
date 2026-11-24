const THEME_KEY = 'ultra_theme'
const APPEARANCE_KEY = 'ultra_appearance'
const UI_SCALE_KEY = 'ultra_ui_scale'
const UI_SCALE_MODE_KEY = 'ultra_ui_scale_mode'

export type ThemeName =
  | 'wear-mint'
  | 'amoled'
  | 'gold'
  | 'purple'
  | 'white'
  | 'wear-ocean'
  | 'wear-sunset'
  | 'wear-galaxy'
  | 'wear-cherry'

export type AppearanceMode = 'dark' | 'light' | 'system'
export type UiScale = 'small' | 'medium' | 'large' | 'xlarge'
export type UiScaleMode = 'auto' | UiScale

export interface ThemeTokens {
  label: string
  swatch: string
  accent: string
  accentHover: string
  accentFg: string
  accentGlow: string
  accentSubtle: string
  lightAccent?: string
  lightAccentHover?: string
  lightAccentFg?: string
  lightAccentGlow?: string
  lightAccentSubtle?: string
}

export const DEFAULT_THEME: ThemeName = 'wear-mint'

export const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  'wear-mint': {
    label: 'Esmeralda',
    swatch: '#10b981',
    accent: '#10b981',
    accentHover: '#34d399',
    accentFg: '#041f17',
    accentGlow: 'rgba(16, 185, 129, 0.30)',
    accentSubtle: 'rgba(16, 185, 129, 0.14)',
    lightAccent: '#047857',
    lightAccentHover: '#047857',
    lightAccentFg: '#ffffff',
    lightAccentGlow: 'rgba(5, 150, 105, 0.26)',
    lightAccentSubtle: 'rgba(5, 150, 105, 0.11)',
  },
  amoled: {
    label: 'Rojo Broadcast',
    swatch: '#ef4444',
    accent: '#f05252',
    accentHover: '#f87171',
    accentFg: '#09090b',
    accentGlow: 'rgba(239, 68, 68, 0.30)',
    accentSubtle: 'rgba(239, 68, 68, 0.14)',
    lightAccent: '#b91c1c',
    lightAccentHover: '#b91c1c',
    lightAccentFg: '#ffffff',
  },
  'wear-ocean': {
    label: 'Océano',
    swatch: '#06b6d4',
    accent: '#06b6d4',
    accentHover: '#22d3ee',
    accentFg: '#042026',
    accentGlow: 'rgba(6, 182, 212, 0.30)',
    accentSubtle: 'rgba(6, 182, 212, 0.14)',
    lightAccent: '#0e7490',
    lightAccentHover: '#0e7490',
    lightAccentFg: '#ffffff',
    lightAccentGlow: 'rgba(8, 145, 178, 0.25)',
    lightAccentSubtle: 'rgba(8, 145, 178, 0.11)',
  },
  'wear-galaxy': {
    label: 'Cobalto',
    swatch: '#3b82f6',
    accent: '#3b82f6',
    accentHover: '#60a5fa',
    accentFg: '#09090b',
    accentGlow: 'rgba(59, 130, 246, 0.30)',
    accentSubtle: 'rgba(59, 130, 246, 0.14)',
    lightAccent: '#1d4ed8',
    lightAccentHover: '#1d4ed8',
    lightAccentFg: '#ffffff',
  },
  gold: {
    label: 'Ámbar Dorado',
    swatch: '#d4af37',
    accent: '#d4af37',
    accentHover: '#f5d77f',
    accentFg: '#171203',
    accentGlow: 'rgba(212, 175, 55, 0.30)',
    accentSubtle: 'rgba(212, 175, 55, 0.14)',
    lightAccent: '#92400e',
    lightAccentHover: '#92400e',
    lightAccentFg: '#ffffff',
    lightAccentGlow: 'rgba(180, 83, 9, 0.24)',
    lightAccentSubtle: 'rgba(180, 83, 9, 0.11)',
  },
  'wear-sunset': {
    label: 'Naranja Solar',
    swatch: '#f97316',
    accent: '#f97316',
    accentHover: '#fb923c',
    accentFg: '#1c0a02',
    accentGlow: 'rgba(249, 115, 22, 0.30)',
    accentSubtle: 'rgba(249, 115, 22, 0.14)',
    lightAccent: '#9a3412',
    lightAccentHover: '#9a3412',
    lightAccentFg: '#ffffff',
  },
  purple: {
    label: 'Violeta',
    swatch: '#a855f7',
    accent: '#b56bfa',
    accentHover: '#c084fc',
    accentFg: '#09090b',
    accentGlow: 'rgba(168, 85, 247, 0.30)',
    accentSubtle: 'rgba(168, 85, 247, 0.14)',
    lightAccent: '#9333ea',
    lightAccentHover: '#7e22ce',
    lightAccentFg: '#ffffff',
  },
  'wear-cherry': {
    label: 'Carmesí',
    swatch: '#f43f5e',
    accent: '#f43f5e',
    accentHover: '#fb7185',
    accentFg: '#09090b',
    accentGlow: 'rgba(244, 63, 94, 0.30)',
    accentSubtle: 'rgba(244, 63, 94, 0.14)',
    lightAccent: '#be123c',
    lightAccentHover: '#be123c',
    lightAccentFg: '#ffffff',
  },
  white: {
    label: 'Monocromo',
    swatch: '#f8fafc',
    accent: '#f8fafc',
    accentHover: '#e2e8f0',
    accentFg: '#09090b',
    accentGlow: 'rgba(248, 250, 252, 0.25)',
    accentSubtle: 'rgba(248, 250, 252, 0.12)',
    lightAccent: '#18181b',
    lightAccentHover: '#27272a',
    lightAccentFg: '#ffffff',
    lightAccentGlow: 'rgba(24, 24, 27, 0.20)',
    lightAccentSubtle: 'rgba(24, 24, 27, 0.08)',
  },
}

const SCALE_VALUE: Record<UiScale, string> = {
  small: '0.92',
  medium: '1',
  large: '1.08',
  xlarge: '1.16',
}

export function getAvailableThemes(): ThemeName[] {
  return Object.keys(THEME_TOKENS) as ThemeName[]
}

export function isLightResolved(mode: AppearanceMode): boolean {
  if (typeof window === 'undefined') return false
  return (
    mode === 'light' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)
  )
}

function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(THEME_TOKENS, value)
}

export function resolveAccentTokens(theme: ThemeName, isLight: boolean) {
  const t = THEME_TOKENS[isThemeName(theme) ? theme : DEFAULT_THEME]
  return [
    isLight ? t.lightAccent ?? t.accent : t.accent,
    isLight ? t.lightAccentHover ?? t.accentHover : t.accentHover,
    isLight ? t.lightAccentFg ?? t.accentFg : t.accentFg,
    isLight ? t.lightAccentGlow ?? t.accentGlow : t.accentGlow,
    isLight ? t.lightAccentSubtle ?? t.accentSubtle : t.accentSubtle,
  ] as const
}

const ACCENT_PROPERTIES = ['--accent', '--accent-hover', '--accent-fg', '--accent-glow', '--accent-subtle'] as const

/** Generates a pre-hydration script exclusively from trusted, static palette data. */
export function buildThemeInitScript(): string {
  const palettes = Object.fromEntries(getAvailableThemes().map(theme => [
    theme, { dark: resolveAccentTokens(theme, false), light: resolveAccentTokens(theme, true) },
  ]))
  const payload = JSON.stringify(palettes)
  return `(function(){try{var map=${payload};var theme=localStorage.getItem('ultra_theme');if(!Object.prototype.hasOwnProperty.call(map,theme))theme='wear-mint';var app=localStorage.getItem('ultra_appearance');var light=app==='light'||(app==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches);var root=document.documentElement;root.setAttribute('data-theme',theme);root.setAttribute('data-appearance',light?'light':'dark');var colors=map[theme][light?'light':'dark'];${JSON.stringify(ACCENT_PROPERTIES)}.forEach(function(key,i){root.style.setProperty(key,colors[i])});var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',light?'#ffffff':theme==='amoled'?'#000000':'#060a0e')}catch(e){}})();`
}

function syncAccentTokens(theme: ThemeName, isLight: boolean) {
  if (typeof document === 'undefined') return
  const selected = isThemeName(theme) ? theme : DEFAULT_THEME
  const root = document.documentElement
  const colors = resolveAccentTokens(selected, isLight)
  root.setAttribute('data-theme', selected)
  ACCENT_PROPERTIES.forEach((key, i) => root.style.setProperty(key, colors[i]))
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', isLight ? '#ffffff' : selected === 'amoled' ? '#000000' : '#060a0e')
}

export function getTheme(): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const stored = localStorage.getItem(THEME_KEY) as ThemeName | null
    return isThemeName(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function getAppearance(): AppearanceMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem(APPEARANCE_KEY) as AppearanceMode | null
    return stored === 'light' || stored === 'system' || stored === 'dark' ? stored : 'dark'
  } catch {
    return 'dark'
  }
}

export function setTheme(name: ThemeName) {
  if (typeof window === 'undefined') return
  try {
    const selected = isThemeName(name) ? name : DEFAULT_THEME
    localStorage.setItem(THEME_KEY, selected)
    const light = isLightResolved(getAppearance())
    syncAccentTokens(selected, light)
    window.dispatchEvent(
      new CustomEvent('theme-changed', {
        detail: { theme: selected, tokens: THEME_TOKENS[selected] },
      })
    )
  } catch {}
}

export function applyAppearance(mode: AppearanceMode) {
  if (typeof window === 'undefined') return
  const light = isLightResolved(mode)
  const root = document.documentElement
  root.setAttribute('data-appearance', light ? 'light' : 'dark')
  syncAccentTokens(getTheme(), light)

}

export function setAppearance(mode: AppearanceMode) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(APPEARANCE_KEY, mode)
    applyAppearance(mode)
  } catch {}
}

export function detectScreenSize(): UiScale {
  if (typeof window === 'undefined') return 'medium'
  const w = window.innerWidth
  if (w < 400) return 'small'
  if (w < 1680) return 'medium'
  return 'large'
}

export function getUiScaleMode(): UiScaleMode {
  if (typeof window === 'undefined') return 'auto'
  try {
    const stored = localStorage.getItem(UI_SCALE_MODE_KEY) as UiScaleMode | null
    return stored === 'auto' || (stored && SCALE_VALUE[stored as UiScale]) ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

export function setActualUiScale(size: UiScale) {
  if (typeof window === 'undefined') return
  try {
    const valid = SCALE_VALUE[size] ? size : 'medium'
    document.documentElement.setAttribute('data-ui-scale', valid)
    document.documentElement.style.setProperty('--ui-scale', SCALE_VALUE[valid])
    localStorage.setItem(UI_SCALE_KEY, valid)
  } catch {}
}

export function setUiScaleMode(mode: UiScaleMode) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(UI_SCALE_MODE_KEY, mode)
    setActualUiScale(mode === 'auto' ? detectScreenSize() : mode)
  } catch {}
}

let mediaListenerRegistered = false

export function initializeThemeSettings() {
  if (typeof window === 'undefined') return
  applyAppearance(getAppearance())
  setUiScaleMode(getUiScaleMode())

  if (!mediaListenerRegistered) {
    mediaListenerRegistered = true
    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener?.('change', () => {
        if (getAppearance() === 'system') applyAppearance('system')
      })
  }
}
