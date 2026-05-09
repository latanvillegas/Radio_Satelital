import { beforeEach, describe, expect, it } from 'vitest'
import { getFavorites, saveFavorites, toggleFavorite } from './favorites'

function createLocalStorageMock() {
  let store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    clear: () => {
      store = new Map<string, string>()
    },
  }
}

describe('favorites', () => {
  const storage = createLocalStorageMock()

  beforeEach(() => {
    storage.clear()
    // @ts-expect-error mock de localStorage para tests de nodo
    globalThis.localStorage = storage
  })

  it('guarda y lee favoritos', () => {
    saveFavorites(new Set(['a', 'b']))
    expect(getFavorites()).toEqual(new Set(['a', 'b']))
  })

  it('alternar un favorito lo agrega y luego lo quita', () => {
    expect(toggleFavorite('station-1')).toEqual(new Set(['station-1']))
    expect(toggleFavorite('station-1')).toEqual(new Set())
  })
})