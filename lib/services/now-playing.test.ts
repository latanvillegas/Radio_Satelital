import { describe, expect, it } from 'vitest'
import { decodeIcyBlock, parseIcyMetadata, parseNowPlayingJson } from './now-playing'

describe('ICY now-playing and album compatibility', () => {
  it('parses the artist and title without inventing an album', () => {
    expect(parseIcyMetadata("StreamTitle='Café Tacvba - Eres';StreamUrl='';")).toEqual({
      artist: 'Café Tacvba', title: 'Eres', album: undefined, artworkUrl: undefined, source: 'icy',
    })
  })
  it('accepts optional album fields but rejects insecure artwork', () => {
    expect(parseIcyMetadata("StreamTitle='Artista - Tema';StreamAlbum='Disco';StreamArtwork='http://cdn.example/art.png';")).toEqual({
      artist: 'Artista', title: 'Tema', album: 'Disco', artworkUrl: undefined, source: 'icy',
    })
  })
  it('reads a bounded first ICY block at icy-metaint', () => {
    const txt = "StreamTitle='Grupo - Canción';"
    const encoded = new TextEncoder().encode(txt)
    const pad = Math.ceil(encoded.length / 16) * 16
    const data = new Uint8Array(4 + 1 + pad)
    data.set([1, 2, 3, 4], 0)
    data[4] = pad / 16
    data.set(encoded, 5)
    expect(decodeIcyBlock(data, 4)?.title).toBe('Canción')
    expect(decodeIcyBlock(data.subarray(0, 7), 4)).toBeNull()
    expect(decodeIcyBlock(data, 0)).toBeNull()
  })
  it('matches the correct mount when Icecast serves multiple stations', () => {
    const json = { icestats: { source: [
      { listenurl: 'https://radio.example:8443/otra', title: 'Error - Emisora distinta' },
      { listenurl: 'https://radio.example:8443/stream', title: 'Ritmo - Vuela', album: 'En Vivo' },
    ] } }
    expect(parseNowPlayingJson(json, 'https://radio.example:8443/stream')).toMatchObject({
      title: 'Vuela', artist: 'Ritmo', album: 'En Vivo', source: 'icecast',
    })
    expect(parseNowPlayingJson(json, 'https://radio.example:8443/tercera')).toBeNull()
  })
  it('reads AzuraCast albums and album artwork', () => {
    expect(parseNowPlayingJson({ now_playing: { song: {
      title: 'Eres', artist: 'Café Tacvba', album: 'Cuatro Caminos', art: 'https://cdn.example/cover.jpg',
    } } })).toEqual({
      title: 'Eres', artist: 'Café Tacvba', album: 'Cuatro Caminos',
      artworkUrl: 'https://cdn.example/cover.jpg', source: 'azuracast',
    })
  })
  it('returns no song for invalid or unavailable metadata', () => {
    expect(parseIcyMetadata("StreamTitle='';")).toBeNull()
    expect(parseNowPlayingJson({ icestats: { source: { listenurl: 'https://a.example/live' } } }, 'https://a.example/live')).toBeNull()
    expect(parseNowPlayingJson({})).toBeNull()
  })
})
