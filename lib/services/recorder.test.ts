// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startRecording, stopRecording, getRecorderState } from './recorder'

vi.mock('./audio-dsp', () => ({
  getDspOutputStream: () => ({ getAudioTracks: () => [{}] }),
}))
vi.mock('./player', () => ({ getAudio: () => null }))

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
    expect(startRecording('Second')).toBe(true)
    expect(revokeUrl).toHaveBeenCalledWith('blob:recording')
    FakeRecorder.last.emitChunk('audio')
    FakeRecorder.last.emitStop()
    expect(getRecorderState().isRecording).toBe(false)
    expect(getRecorderState().recordedBlob?.size).toBe(5)
  })
})
