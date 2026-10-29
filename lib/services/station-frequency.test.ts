import { describe, expect, it } from 'vitest'
import { getStationDial } from './station-frequency'

describe('dial de emisoras', () => {
  it('reconoce frecuencias FM y AM válidas', () => {
    expect(getStationDial('Radio Activa 95.1 FM')).toEqual({ number: '95.1', band: 'FM' })
    expect(getStationDial('Radio 95,5 FM')).toEqual({ number: '95.5', band: 'FM' })
    expect(getStationDial('Radio 1280 AM')).toEqual({ number: '1280', band: 'AM' })
  })
  it('no inventa números ni muestra frecuencias imposibles', () => {
    expect(getStationDial('Activa Jaén')).toBeNull()
    expect(getStationDial('Activa 12340 AM')).toBeNull()
    expect(getStationDial('Radio 6000 FM')).toBeNull()
    expect(getStationDial('Radio Satelital 2026')).toBeNull()
  })
})
