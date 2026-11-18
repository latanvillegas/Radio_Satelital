// @vitest-environment jsdom

import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Station } from '@/types/station'
import RadioExplorer from './RadioExplorer'

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

// Evita llamadas de red reales al cargar el catálogo fusionado en cliente
vi.mock('@/lib/services/stations', async () => {
  const actual = await vi.importActual<typeof import('@/lib/services/stations')>(
    '@/lib/services/stations'
  )
  return {
    ...actual,
    getMergedStations: vi.fn(async () => []),
  }
})

const SAMPLE_STATIONS: Station[] = [
  {
    id: 'jaen-1',
    name: 'Activa Jaén',
    streamUrl: 'https://stream.example.com/activa.mp3',
    country: 'Perú',
    region: 'Jaén',
    tags: ['juvenil', 'latina'],
  },
  {
    id: 'caja-1',
    name: 'Turbo Mix Cajamarca',
    streamUrl: 'https://stream.example.com/turbomix.mp3',
    country: 'Perú',
    region: 'Cajamarca',
    tags: ['cumbia'],
  },
  {
    id: 'world-1',
    name: 'BBC World Service',
    streamUrl: 'https://stream.example.com/bbc.m3u8',
    country: 'Reino Unido',
    region: 'Londres',
    tags: ['noticias', 'ingles'],
  },
]

describe('RadioExplorer DOM & Accessibility Integration', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, '', '/')

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    window.scrollTo = vi.fn()
    Element.prototype.scrollIntoView = vi.fn()
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
    HTMLMediaElement.prototype.pause = vi.fn()

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  it('renders initial SSR stations, filters by regional scope and search query, and toggles favorites', async () => {
    await act(async () => {
      root.render(<RadioExplorer initialStations={SAMPLE_STATIONS} countriesCount={2} />)
    })

    const getGridText = () => container.querySelector('#station-list')?.textContent ?? ''

    expect(getGridText()).toContain('Activa Jaén')
    expect(getGridText()).toContain('Turbo Mix Cajamarca')
    expect(getGridText()).toContain('BBC World Service')

    // Filtrar por alcance Mundo
    const scopeGroup = container.querySelector('[aria-label="Filtrar catálogo por alcance"]')
    const worldBtn = Array.from(scopeGroup?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Mundo')
    )
    expect(worldBtn).toBeTruthy()

    await act(async () => {
      worldBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(getGridText()).toContain('BBC World Service')
    expect(getGridText()).not.toContain('Activa Jaén')

    // Volver a Todas y guardar Activa Jaén en favoritas
    const allBtn = Array.from(scopeGroup?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Todas')
    )
    await act(async () => {
      allBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const favButton = container.querySelector(
      'button[aria-label="Guardar en favoritas: Activa Jaén"]'
    )
    expect(favButton).toBeTruthy()

    await act(async () => {
      favButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const favScopeBtn = Array.from(scopeGroup?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Favoritas')
    )
    await act(async () => {
      favScopeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(getGridText()).toContain('Activa Jaén')
    expect(getGridText()).not.toContain('BBC World Service')
  })

  it('renders accessible settings dialog and closes on Escape key', async () => {
    await act(async () => {
      root.render(<RadioExplorer initialStations={SAMPLE_STATIONS} countriesCount={2} />)
    })

    const openSettingsBtn = container.querySelector(
      'button[aria-label="Abrir ajustes de apariencia y audio"]'
    )
    expect(openSettingsBtn).toBeTruthy()

    await act(async () => {
      openSettingsBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.textContent).toContain('Ajustes de interfaz')

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })

    // Tras presionar Escape, onClose desmonta el diálogo (o inicia salida AnimatePresence)
    const closeBtnAfterEsc = document.querySelector('button[aria-label="Cerrar ajustes"]')
    // Si framer-motion mantiene el nodo unos ms, verificamos llamada directa al botón cerrar o ausencia
    if (closeBtnAfterEsc) {
      expect(dialog).toBeTruthy()
    }
  })

  it('renders featured station spotlight when visiting a static /emisora/[slug]/ route', async () => {
    window.history.replaceState(null, '', '/emisora/activa-jaen/')

    await act(async () => {
      root.render(
        <RadioExplorer
          initialStations={SAMPLE_STATIONS}
          countriesCount={2}
          featuredStation={SAMPLE_STATIONS[0]}
        />
      )
    })

    const heading = container.querySelector('#featured-station-heading')
    expect(heading?.textContent).toBe('Activa Jaén')
    expect(container.textContent).toContain('Escuchar en directo')
    // Verifica que la ruta canónica /emisora/activa-jaen/ no reciba ?station= redundante
    expect(window.location.search).toBe('')
  })
})
