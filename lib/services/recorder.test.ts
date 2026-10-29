import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./audio-dsp', () => ({
  getDspOutputStream: () => ({ getAudioTracks: () => [{}] }),
}))
vi.mock('./player', () => ({ getAudio: () => null }))

import { startRecording, stopRecording, getRecorderState } from './recorder'

class RecorderStub {
  static isTypeSupported() { return true }
  mimeType = 'audio/webm'
  state: 'inactive' | 'recording' = 'inactive'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(_stream: unknown, _options: unknown) {}
  start() { this.state = 'recording' }
  stop() {
    this.state = 'inactive'
    // Browsers dispatch the final dataavailable asynchronously, followed by stop.
    queueMicrotask(() => {
      this.ondataavailable?.({ data: new Blob(['final'], { type: 'audio/webm' }) })
      this.onstop?.()
    })
  }
}

afterEach(() => { vi.unstubAllGlobals() })

describe('grabación y retención de memoria', () => {
  it('espera el último chunk, libera la lista de chunks y no crea object URLs persistentes', async () => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('MediaRecorder', RecorderStub)
    expect(startRecording('Jaén')).toBe(true)
    expect(getRecorderState().isRecording).toBe(true)
    stopRecording()
    expect(getRecorderState().recordedBlob).toBeNull()
    // Do not allow a second recorder before the first onstop completes.
    expect(startRecording('Otro')).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(getRecorderState().recordedBlob?.size).toBe(5)
    expect(getRecorderState().recordedUrl).toBeNull()
    expect(getRecorderState().isRecording).toBe(false)
  })
})
