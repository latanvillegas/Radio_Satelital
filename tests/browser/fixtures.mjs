export const origin = 'http://127.0.0.1:4173'
const stationUrl = 'https://sp.onliveperu.com/8108/stream'

// Deterministic 30-second stereo PCM fixture, different amplitudes per channel.
export function makeWav() {
  const rate = 16000, frames = rate * 30, dataBytes = frames * 4
  const bytes = Buffer.alloc(44 + dataBytes)
  bytes.write('RIFF', 0); bytes.writeUInt32LE(36 + dataBytes, 4)
  bytes.write('WAVEfmt ', 8); bytes.writeUInt32LE(16, 16)
  bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(2, 22)
  bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 4, 28)
  bytes.writeUInt16LE(4, 32); bytes.writeUInt16LE(16, 34)
  bytes.write('data', 36); bytes.writeUInt32LE(dataBytes, 40)
  for (let i = 0; i < frames; i++) {
    const wave = Math.sin(2 * Math.PI * 440 * i / rate)
    bytes.writeInt16LE(Math.round(wave * 12000), 44 + i * 4)
    bytes.writeInt16LE(Math.round(wave * 3000), 46 + i * 4)
  }
  return bytes
}

export async function isolateNetwork(page, audio = false, baseUrl = origin) {
  const wav = audio ? makeWav() : null
  await page.route('**/*', async route => {
    const request = route.request()
    if (request.url().startsWith(baseUrl + '/')) return route.continue()
    if (wav && request.url() === stationUrl) {
      const headers = { 'access-control-allow-origin': '*', 'accept-ranges': 'bytes', 'content-type': 'audio/wav' }
      const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers().range ?? '')
      if (match) {
        const start = Number(match[1]), end = Math.min(wav.length - 1, match[2] ? Number(match[2]) : wav.length - 1)
        if (start >= wav.length || end < start) return route.fulfill({ status: 416, headers: { ...headers, 'content-range': 'bytes */' + wav.length } })
        return route.fulfill({ status: 206, headers: { ...headers, 'content-range': `bytes ${start}-${end}/${wav.length}` }, body: wav.subarray(start, end + 1) })
      }
      return route.fulfill({ status: 200, headers, body: wav })
    }
    return route.abort()
  })
}

