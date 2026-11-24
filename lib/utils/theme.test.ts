// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { buildThemeInitScript, getAvailableThemes, getTheme, resolveAccentTokens } from './theme'

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string): number {
  const x = luminance(a), y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-appearance')
  document.documentElement.removeAttribute('style')
})
describe('Broadcast theme', () => {
  for (const theme of getAvailableThemes()) {
    for (const light of [false, true]) {
      it(`${theme} ${light ? 'exterior' : 'dark'} maintains text contrast on accent controls and representative surfaces`, () => {
        const [accent, hover, foreground] = resolveAccentTokens(theme, light)
        expect(contrast(foreground, accent)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(foreground, hover)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(accent, light ? '#e9efec' : '#131e29')).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
  it('starts with the same palette as the runtime before hydration', () => {
    localStorage.setItem('ultra_theme', 'amoled')
    localStorage.setItem('ultra_appearance', 'light')
    new Function(buildThemeInitScript())()
    const root = document.documentElement
    expect(root.dataset.theme).toBe('amoled')
    expect(root.dataset.appearance).toBe('light')
    expect(root.style.getPropertyValue('--accent')).toBe(resolveAccentTokens('amoled', true)[0])
  })
  it('falls back on invalid persisted keys instead of inherited object properties', () => {
    localStorage.setItem('ultra_theme', 'constructor')
    expect(getTheme()).toBe('wear-mint')
    new Function(buildThemeInitScript())()
    expect(document.documentElement.dataset.theme).toBe('wear-mint')
  })
})
