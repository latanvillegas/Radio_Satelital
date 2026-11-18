import { describe, expect, it } from 'vitest'
import {
  applyPreset,
  getDspState,
  setBandGain,
  setCompressorEnabled,
  setDspEnabled,
  setPreAmpGain,
} from './audio-dsp'
import { isHlsStreamUrl } from './player'

describe('audio engine & DSP state management', () => {
  it('detects HLS (.m3u8) streams accurately', () => {
    expect(isHlsStreamUrl('https://cdn.example.com/live/playlist.m3u8?token=123')).toBe(true)
    expect(isHlsStreamUrl('https://sp.onliveperu.com/8108/stream')).toBe(false)
  })

  it('clamps band gains, preAmp, and toggles compressor/presets cleanly', () => {
    applyPreset('flat')
    expect(getDspState().bands).toEqual([0, 0, 0, 0, 0])
    expect(getDspState().compressor).toBe(false)

    setBandGain(0, 18) // Clamps to +12 dB
    setBandGain(4, -20) // Clamps to -12 dB
    expect(getDspState().bands[0]).toBe(12)
    expect(getDspState().bands[4]).toBe(-12)
    expect(getDspState().activePresetId).toBe('custom')

    setPreAmpGain(25) // Clamps to +12 dB
    expect(getDspState().preAmp).toBe(12)

    setCompressorEnabled(true)
    expect(getDspState().compressor).toBe(true)

    setDspEnabled(false)
    expect(getDspState().enabled).toBe(false)
    setDspEnabled(true)
  })
})
