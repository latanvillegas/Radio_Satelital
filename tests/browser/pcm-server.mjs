import { createServer } from 'node:http'
import { makeWav, stationUrl } from './fixtures.mjs'

/** Real HTTP endpoint with range support; no dependency on browser media interception. */
export async function startPcmServer(page) {
  const wav = makeWav()
  let requests = 0
  const responses = []
  const server = createServer((req, res) => {
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, HEAD, OPTIONS',
      'access-control-allow-headers': 'Range',
      'access-control-expose-headers': 'Content-Range, Accept-Ranges, Content-Length',
      'accept-ranges': 'bytes',
      'content-type': 'audio/wav',
      'cache-control': 'no-store',
    }
    if (req.url !== '/fixture.wav') { res.writeHead(404).end(); return }
    if (req.method === 'OPTIONS') { res.writeHead(204, headers).end(); return }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, headers).end(); return }
    requests++
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '')
    let start = 0, end = wav.length - 1
    if (range) {
      start = Number(range[1])
      end = Math.min(end, range[2] ? Number(range[2]) : end)
      if (start > end || start >= wav.length) {
        res.writeHead(416, { ...headers, 'content-range': 'bytes */' + wav.length }).end()
        return
      }
      headers['content-range'] = `bytes ${start}-${end}/${wav.length}`
    }
    headers['content-length'] = end - start + 1
    responses.push({ method: req.method, range: req.headers.range ?? null, status: range ? 206 : 200, bytes: end - start + 1 })
    res.writeHead(range ? 206 : 200, headers)
    res.end(req.method === 'HEAD' ? undefined : wav.subarray(start, end + 1))
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const url = 'http://127.0.0.1:' + server.address().port + '/fixture.wav'
  // Test-only substitution of the transport destination, not the app's DSP or audio engine.
  await page.addInitScript(({ source, target }) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src')
    Object.defineProperty(HTMLMediaElement.prototype, 'src', {
      ...descriptor,
      set(value) { descriptor.set.call(this, value === source ? target : value) },
    })
  }, { source: stationUrl, target: url })
  return {
    url,
    requests: () => requests,
    responses: () => [...responses],
    close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections() }),
  }
}
