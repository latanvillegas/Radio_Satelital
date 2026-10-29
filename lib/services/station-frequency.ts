/**
 * Extrae solo frecuencias de radiodifusión plausibles a partir del nombre.
 * Nunca convierte un número cualquiera en una frecuencia o inventa un dial.
 */
export function getStationDial(name: string): { number: string; band: 'FM' | 'AM' } | null {
  const match = name.match(/(?:^|[^\d])(\d{2,4}(?:[.,]\d+)?)\s*(FM|AM)\b/i)
  if (!match) return null
  const value = Number(match[1].replace(',', '.'))
  const band = match[2].toUpperCase() as 'FM' | 'AM'
  if (band === 'FM' && value >= 87.5 && value <= 108) {
    return { number: match[1].replace(',', '.'), band }
  }
  if (band === 'AM' && Number.isInteger(value) && value >= 520 && value <= 1710) {
    return { number: match[1], band }
  }
  return null
}
