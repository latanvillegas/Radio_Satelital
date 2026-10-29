import type { Station } from '../../types/station'

/**
 * ICY only standardizes StreamTitle/StreamUrl; album, cover and separated artist
 * require vendor fields or an explicit now-playing JSON API.
 * This module NEVER takes ownership of the <audio> playback stream.
 */
export type NowPlaying = {
  title: string
  artist?: string
  album?: string
  artworkUrl?: string
  source: 'icy' | 'icecast' | 'shoutcast' | 'azuracast'
}

export type MetadataMode = 'json' | 'icy'
const MAX_TEXT = 220
const MAX_JSON_BYTES = 96 * 1024
const MAX_ICY_BYTES = 96 * 1024

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null
}
function text(value: unknown): string {
  return typeof value === 'string' ? value.replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, MAX_TEXT) : ''
}
function httpsArtwork(value: unknown): string | undefined {
  const valueText = text(value)
  if (!valueText) return undefined
  try { const uri = new URL(valueText); return uri.protocol === 'https:' ? uri.href : undefined }
  catch { return undefined }
}
function splitArtistTitle(input: string): { title: string; artist?: string } | null {
  const raw = text(input)
  if (!raw) return null
  // Only split on a spaced delimiter; hyphens inside names are preserved.
  const index = raw.indexOf(' - ')
  if (index < 1 || index >= raw.length - 3) return { title: raw }
  return { artist: raw.slice(0, index).trim(), title: raw.slice(index + 3).trim() }
}

/** Parse one ICY metadata block. Album and artwork are optional vendor extensions. */
export function parseIcyMetadata(raw: string): NowPlaying | null {
  const fields: Record<string, string> = {}
  const pattern = /(?:^|;)\s*(StreamTitle|StreamArtist|StreamAlbum|StreamUrl|StreamArtwork)\s*=\s*'((?:\\.|[^'])*)'\s*(?=;|$)/gi
  for (const match of raw.matchAll(pattern)) {
    fields[match[1].toLowerCase()] = match[2].replace(/\\(['\\])/g, '$1')
  }
  const combined = splitArtistTitle(fields.streamtitle || '')
  if (!combined) return null
  return {
    title: combined.title,
    artist: text(fields.streamartist) || combined.artist,
    album: text(fields.streamalbum) || undefined,
    artworkUrl: httpsArtwork(fields.streamartwork),
    source: 'icy',
  }
}

function matchesMount(source: Record<string, unknown>, streamUrl: string): boolean {
  const listenUrl = text(source.listenurl)
  if (!listenUrl) return false
  try {
    const stream = new URL(streamUrl), candidate = new URL(listenUrl)
    const normalized = (path: string) => path.replace(/\/+$/, '') || '/'
    return normalized(stream.pathname) === normalized(candidate.pathname)
      && stream.hostname.toLowerCase() === candidate.hostname.toLowerCase()
  } catch { return false }
}

function parseIcecast(data: Record<string, unknown>, streamUrl: string, explicit: boolean): NowPlaying | null {
  const stats = object(data.icestats)
  if (!stats || !stats.source) return null
  const sources = (Array.isArray(stats.source) ? stats.source : [stats.source])
    .map(object).filter((source): source is Record<string, unknown> => source !== null)
  const source = sources.find(s => matchesMount(s, streamUrl))
    || (explicit && sources.length === 1 ? sources[0] : null)
  if (!source) return null // Never display another mount's track.
  const titleText = text(source.title) || text(source.yp_currently_playing)
  const separatedArtist = text(source.artist)
  const combined = splitArtistTitle(titleText)
  if (!combined) return null
  return {
    title: combined.title, artist: separatedArtist || combined.artist,
    album: text(source.album) || undefined,
    artworkUrl: httpsArtwork(source.artwork || source.cover),
    source: 'icecast',
  }
}

/** AzuraCast / Icecast / Shoutcast now-playing response adapters. */
export function parseNowPlayingJson(data: unknown, streamUrl = '', explicit = false): NowPlaying | null {
  const body = object(data)
  if (!body) return null
  const now = object(body.now_playing)
  const song = now && object(now.song)
  if (song) {
    const title = text(song.title)
    const parsed = title ? { title } : splitArtistTitle(text(song.text) || text(now?.text))
    if (!parsed) return null
    return {
      title: parsed.title,
      artist: text(song.artist) || parsed.artist,
      album: text(song.album) || undefined,
      artworkUrl: httpsArtwork(song.art || song.artwork),
      source: 'azuracast',
    }
  }
  const icecast = parseIcecast(body, streamUrl, explicit)
  if (icecast) return icecast
  const current = text(body.songtitle) || text(body.currentsong) || text(body.song)
  const track = splitArtistTitle(current)
  if (!track) return null
  return {
    ...track,
    artist: text(body.artist) || track.artist,
    album: text(body.album) || undefined,
    artworkUrl: httpsArtwork(body.artwork || body.art),
    source: 'shoutcast',
  }
}

function stationUrl(station: Station): URL | null {
  try {
    const url = new URL(station.streamUrl || station.url || '')
    return url.protocol === 'https:' ? url : null
  } catch { return null }
}
function metadataEndpoint(station: Station): URL | null {
  const stream = stationUrl(station)
  if (!stream) return null
  try {
    const custom = station.metadataUrl ? new URL(station.metadataUrl) : new URL('/status-json.xsl', stream.origin)
    return custom.protocol === 'https:' ? custom : null
  } catch { return null }
}

async function boundedJson(response: Response, signal: AbortSignal): Promise<unknown> {
  if (!response.ok) return null
  const length = Number(response.headers.get('content-length') || '0')
  if (length > MAX_JSON_BYTES || !response.body) return null
  const reader = response.body.getReader()
  let count = 0
  const chunks: Uint8Array[] = []
  try {
    while (count <= MAX_JSON_BYTES) {
      if (signal.aborted) return null
      const { done, value } = await reader.read()
      if (done) break
      count += value.byteLength
      if (count > MAX_JSON_BYTES) return null
      chunks.push(value)
    }
    const all = new Uint8Array(count)
    let offset = 0
    for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.length }
    return JSON.parse(new TextDecoder().decode(all))
  } catch { return null }
  finally { try { await reader.cancel() } catch {} }
}
async function readJson(station: Station, signal: AbortSignal): Promise<NowPlaying | null> {
  const endpoint = metadataEndpoint(station)
  if (!endpoint) return null
  try {
    const response = await fetch(endpoint.href, { signal, cache: 'no-store', headers: { Accept: 'application/json' } })
    const data = await boundedJson(response, signal)
    return parseNowPlayingJson(data, station.streamUrl || station.url || '', Boolean(station.metadataUrl))
  } catch { return null }
}

/** Reads at most the FIRST ICY block; never downloads an unbounded second audio stream. */
export function decodeIcyBlock(bytes: Uint8Array, metaInt: number): NowPlaying | null {
  if (!Number.isInteger(metaInt) || metaInt < 1 || metaInt >= MAX_ICY_BYTES || bytes.length <= metaInt) return null
  const metadataBytes = bytes[metaInt] * 16
  if (!metadataBytes || bytes.length < metaInt + 1 + metadataBytes) return null
  const block = bytes.subarray(metaInt + 1, metaInt + 1 + metadataBytes)
  let decoded = ''
  try { decoded = new TextDecoder('utf-8', { fatal: true }).decode(block) }
  catch { decoded = new TextDecoder('windows-1252').decode(block) }
  return parseIcyMetadata(decoded.replace(/\0/g, '').trim())
}

async function readIcy(station: Station, signal: AbortSignal): Promise<NowPlaying | null> {
  const stream = stationUrl(station)
  if (!stream) return null
  try {
    // Cross-origin servers must allow Icy-MetaData and expose Icy-MetaInt.
    const response = await fetch(stream.href, {
      signal, cache: 'no-store', headers: { 'Icy-MetaData': '1' },
    })
    const interval = Number(response.headers.get('icy-metaint'))
    if (!response.ok || !response.body || !Number.isInteger(interval) || interval < 1 || interval >= MAX_ICY_BYTES - 4081) {
      await response.body?.cancel().catch(() => {})
      return null
    }
    const reader = response.body.getReader()
    let bytes = new Uint8Array(0)
    try {
      while (bytes.length <= MAX_ICY_BYTES && !signal.aborted) {
        const { done, value } = await reader.read()
        if (done) return null
        const next = new Uint8Array(bytes.length + value.length)
        next.set(bytes); next.set(value, bytes.length); bytes = next
        if (bytes.length > interval) {
          const size = bytes[interval] * 16
          if (!size || interval + 1 + size > MAX_ICY_BYTES) return null
          if (bytes.length >= interval + 1 + size) return decodeIcyBlock(bytes, interval)
        }
      }
      return null
    } finally { try { await reader.cancel() } catch {} }
  } catch { return null }
}

export async function lookupNowPlaying(station: Station, signal: AbortSignal, preferred?: MetadataMode):
  Promise<{ track: NowPlaying; mode: MetadataMode } | null> {
  // Do not guess a proxy URL or attempt HTTP mixed-content requests.
  if (!stationUrl(station) || signal.aborted) return null
  const modes: MetadataMode[] = preferred ? [preferred] : station.metadataUrl ? ['json'] : ['json', 'icy']
  for (const mode of modes) {
    if (signal.aborted) return null
    const track = mode === 'json' ? await readJson(station, signal) : await readIcy(station, signal)
    if (track && !signal.aborted) return { track, mode }
  }
  return null
}
