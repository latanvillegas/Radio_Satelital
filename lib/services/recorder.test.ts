// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startRecording, stopRecording, getRecorderState } from './recorder'

const sources = vi.hoisted(() => ({ tracks: [{}] as object[], captureTracks: null as object[] | null }))
vi.mock('./audio-dsp', () => ({
  getDspOutputStream: () => ({ getAudioTracks: () => sources.tracks }),
}))
vi.mock('./player', () => ({
  getAudio: () => sources.captureTracks === null ? null : { captureStream: () => ({ getAudioTracks: () => sources.captureTracks }) },
}))

class FakeRecorder {
  static last: FakeRecorder
  static isTypeSupported(type: string) { return type === 'audio/mp4' }
  state = 'inactive'
  mimeType = 'audio/mp4'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor() { FakeRecorder.last = this }
  start() { this.state = 'recording' }
  stop() { this.state = 'inactive' }
  emitChunk(text: string) { this.ondataavailable?.({ data: new Blob([text], { type: this.mimeType }) }) }
  emitStop() { this.state = 'inactive'; this.onstop?.() }
}

const createUrl = vi.fn(() => 'blob:recording')
const revokeUrl = vi.fn()
const OriginalURL = URL

describe('Recording lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sources.tracks = [{}]
    sources.captureTracks = null
    vi.stubGlobal('MediaRecorder', FakeRecorder)
    vi.stubGlobal('URL', class extends OriginalURL {
      static createObjectURL = createUrl
      static revokeObjectURL = revokeUrl
    })
  })
  afterEach(async () => {
    if (getRecorderState().isRecording || getRecorderState().isFinalizing) {
      const pending = stopRecording()
      FakeRecorder.last.emitStop()
      await pending
    }
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('includes the final data chunk and prevents a new recording while finalizing', async () => {
    expect(startRecording('Radio')).toBe(true)
    const recorder = FakeRecorder.last
    recorder.emitChunk('first')
    const pending = stopRecording()
    expect(getRecorderState().isFinalizing).toBe(true)
    expect(getRecorderState().recordedBlob).toBeNull()
    expect(startRecording('Other')).toBe(false)
    expect(stopRecording()).toBe(pending)
    recorder.emitChunk('last')
    recorder.emitStop()
    const blob = await pending
    expect(blob?.size).toBe(9)
    expect(blob?.type).toBe('audio/mp4')
    expect(getRecorderState().fileName).toMatch(/\.m4a$/)
    expect(getRecorderState().isFinalizing).toBe(false)
  })

  it('finalizes a recorder stopped by its source and revokes the previous object URL', () => {
    expect(startRecording('Previous')).toBe(true)
    FakeRecorder.last.emitChunk('old')
    FakeRecorder.last.emitStop()
    expect(startRecording('Second')).toBe(true)
    expect(revokeUrl).toHaveBeenCalledWith('blob:recording')
    FakeRecorder.last.emitChunk('audio')
    FakeRecorder.last.emitStop()
    expect(getRecorderState().isRecording).toBe(false)
    expect(getRecorderState().recordedBlob?.size).toBe(5)
  })

  it('preserves received data and releases the finalizing lock if stop is never emitted', async () => {
    expect(startRecording('Interrupted')).toBe(true)
    const recorder = FakeRecorder.last
    recorder.emitChunk('partial')
    const pending = stopRecording()
    await vi.advanceTimersByTimeAsync(5000)
    expect((await pending)?.size).toBe(7)
    expect(getRecorderState().isFinalizing).toBe(false)
    expect(getRecorderState().error).toMatch(/incompleta/)
    recorder.emitStop()
    expect(startRecording('Next')).toBe(true)
    FakeRecorder.last.emitChunk('next')
    FakeRecorder.last.emitStop()
    expect(getRecorderState().recordedBlob?.size).toBe(4)
  })

  it('rejects both empty DSP output and empty native capture before creating a recorder', () => {
    sources.tracks = []
    sources.captureTracks = []
    const previous = FakeRecorder.last
    expect(startRecording('No audio tracks')).toBe(false)
    expect(FakeRecorder.last).toBe(previous)
    expect(getRecorderState().isRecording).toBe(false)
    expect(getRecorderState().error).not.toBeNull()
  })
})
