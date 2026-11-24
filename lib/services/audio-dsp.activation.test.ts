// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDspOutputStream, getDspState, initAudioDsp, prepareAudioDsp, releaseAudioDsp, suspendAudioDsp } from './audio-dsp'

const param = () => ({ value: 0, setTargetAtTime: vi.fn() })
const node = () => ({
  connect: vi.fn(), disconnect: vi.fn(),
  gain: param(), frequency: param(), Q: param(), threshold: param(), knee: param(),
  ratio: param(), attack: param(), release: param(), fftSize: 128,
  smoothingTimeConstant: 0, type: 'peaking',
})
class FakeContext extends EventTarget {
  static latest: FakeContext
  state = 'suspended'
  currentTime = 0
  destination = node()
  createMediaElementSource = vi.fn(node)
  createBiquadFilter = vi.fn(node)
  createGain = vi.fn(node)
  createDynamicsCompressor = vi.fn(node)
  createAnalyser = vi.fn(node)
  createMediaStreamDestination = vi.fn(() => ({ ...node(), stream: { getAudioTracks: () => [{}] } }))
  resume = vi.fn(async () => {})
  suspend = vi.fn(async () => { this.state = 'suspended' })
  close = vi.fn(async () => { this.state = 'closed' })
  constructor() { super(); FakeContext.latest = this }
  unlock() {
    this.state = 'running'
    this.dispatchEvent(new Event('statechange'))
  }
}

function activeAudio(): HTMLAudioElement {
  const audio = document.createElement('audio')
  audio.crossOrigin = 'anonymous'
  Object.defineProperty(audio, 'paused', { configurable: true, value: false })
  return audio
}

describe('DSP activation and native playback fallback', () => {
  beforeEach(() => {
    releaseAudioDsp()
    vi.stubGlobal('AudioContext', FakeContext)
  })
  afterEach(() => {
    releaseAudioDsp()
    vi.unstubAllGlobals()
  })
  it('does not capture a playing media element until the context is running', () => {
    const audio = activeAudio()
    expect(prepareAudioDsp()).toBe(true)
    const ctx = FakeContext.latest
    expect(initAudioDsp(audio)).toBe(false)
    expect(ctx.createMediaElementSource).not.toHaveBeenCalled()
    expect(getDspState().isWebAudioActive).toBe(false)
    expect(getDspOutputStream()).toBeNull()
    ctx.unlock()
    expect(ctx.createMediaElementSource).toHaveBeenCalledExactlyOnceWith(audio)
    expect(getDspState().isWebAudioActive).toBe(true)
    expect(getDspOutputStream()).not.toBeNull()
    expect(initAudioDsp(audio)).toBe(true)
    expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1)
  })
  it('cancels deferred attachment on pause', () => {
    const audio = activeAudio()
    expect(initAudioDsp(audio)).toBe(false)
    const ctx = FakeContext.latest
    suspendAudioDsp()
    ctx.unlock()
    expect(ctx.createMediaElementSource).not.toHaveBeenCalled()
    expect(getDspState().isWebAudioActive).toBe(false)
  })
  it('ignores state changes of a released context', () => {
    expect(initAudioDsp(activeAudio())).toBe(false)
    const old = FakeContext.latest
    releaseAudioDsp()
    old.unlock()
    expect(old.createMediaElementSource).not.toHaveBeenCalled()
    expect(getDspOutputStream()).toBeNull()
  })
  it('does not attach a non-CORS element', () => {
    const audio = activeAudio()
    audio.removeAttribute('crossorigin')
    expect(initAudioDsp(audio)).toBe(false)
    expect(getDspState().isWebAudioActive).toBe(false)
  })
})
