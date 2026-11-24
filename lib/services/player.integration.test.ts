// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAudio, playStation, setPlayingState, subscribePlaybackStatus, togglePlay, setSleepTimer, type PlaybackStatus } from './player'
import type { Station } from '../../types/station'

const station: Station = { id: 'test-live', name: 'Test Live', streamUrl: 'https://example.test/live.mp3' }
const nextStation: Station = { id: 'test-next', name: 'Next', streamUrl: 'https://example.test/next.mp3' }

describe('Live radio transport lifecycle', () => {
  let statuses: PlaybackStatus[]
  let unsubscribe: () => void
  let online = true
  const flush = async () => { await Promise.resolve(); await Promise.resolve() }

  beforeEach(() => {
    vi.useFakeTimers()
    online = true
    vi.spyOn(navigator, 'onLine', 'get').mockImplementation(() => online)
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
    statuses = []
    unsubscribe = subscribePlaybackStatus(status => statuses.push(status))
  })
  afterEach(() => {
    setPlayingState(false)
    setSleepTimer(null)
    unsubscribe()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts native media synchronously and cancels pending startup without restarting', async () => {
    playStation(station)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
    expect(statuses.at(-1)).toBe('loading')
    togglePlay()
    await flush()
    vi.advanceTimersByTime(60000)
    expect(statuses.at(-1)).toBe('paused')
    expect(getAudio()?.getAttribute('src')).toBeNull()
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
  })

  it('ignores an old rejected play promise after switching direct stations', async () => {
    let rejectFirst!: (reason: unknown) => void
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(() => new Promise<void>((_, reject) => { rejectFirst = reject }))
    playStation(station)
    playStation(nextStation)
    rejectFirst(new DOMException('old stream', 'NotAllowedError'))
    await flush()
    expect(statuses.at(-1)).toBe('loading')
    expect(getAudio()?.getAttribute('src')).toBe(nextStation.streamUrl)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
  })

  it('reconnects after network recovery only while playback remains requested', async () => {
    playStation(station)
    await flush()
    online = false
    window.dispatchEvent(new Event('offline'))
    expect(statuses.at(-1)).toBe('offline')
    expect(getAudio()?.getAttribute('src')).toBeNull()
    online = true
    window.dispatchEvent(new Event('online'))
    await flush()
    expect(statuses.at(-1)).toBe('reconnecting')
    expect(getAudio()?.getAttribute('src')).toBe(station.streamUrl)
    online = false
    window.dispatchEvent(new Event('offline'))
    togglePlay()
    online = true
    window.dispatchEvent(new Event('online'))
    await flush()
    expect(statuses.at(-1)).toBe('paused')
    expect(getAudio()?.getAttribute('src')).toBeNull()
  })

  it('stops the transport when the sleep timer expires', async () => {
    playStation(station)
    await flush()
    setSleepTimer(1 / 60)
    vi.advanceTimersByTime(1000)
    expect(statuses.at(-1)).toBe('paused')
    expect(getAudio()?.getAttribute('src')).toBeNull()
  })
})
