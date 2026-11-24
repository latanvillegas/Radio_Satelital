import { describe, expect, it } from 'vitest'
import { samplePeakDbfs } from './audio-dsp'

describe('sample peak meter', () => {
  it('reports digital silence as negative infinity', () => {
    expect(samplePeakDbfs(new Float32Array(2048))).toBe(-Infinity)
  })
  it('reports full scale as 0 dBFS and half scale as -6.02 dBFS', () => {
    expect(samplePeakDbfs(new Float32Array([-1, 0.5]))).toBe(0)
    expect(samplePeakDbfs(new Float32Array([0.1, -0.5]))).toBeCloseTo(-6.0206, 3)
  })
  it('preserves over-full-scale readings and ignores invalid samples', () => {
    expect(samplePeakDbfs(new Float32Array([NaN, Infinity, 2]))).toBeCloseTo(6.0206, 3)
  })
})
