import { describe, expect, it } from 'vitest'
import { visualizerFrameInterval } from './render-budget'

describe('batería: presupuesto de animación', () => {
  it('limita la frecuencia de repintado en móvil y ahorro de datos', () => {
    expect(visualizerFrameInterval({ mobile: false, saveData: false })).toBe(34)
    expect(visualizerFrameInterval({ mobile: true, saveData: false })).toBe(50)
    expect(visualizerFrameInterval({ mobile: true, saveData: true })).toBe(100)
  })
})
