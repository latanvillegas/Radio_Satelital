#!/usr/bin/env node

/**
 * Auditor concurrente de salud de streams para Radio Satelital.
 * Verifica disponibilidad HTTP/HTTPS, latencia de cabecera, Mixed Content (HTTP) y formato HLS.
 *
 * Uso:
 *   node scripts/check-streams.mjs [--concurrency=12] [--timeout=4500] [--output=report.json] [--strict]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const getArgValue = (prefix, fallback) => {
  const found = args.find((a) => a.startsWith(`${prefix}=`))
  return found ? found.slice(prefix.length + 1) : fallback
}

const CONCURRENCY = Math.max(1, Number(getArgValue('--concurrency', '12')) || 12)
const TIMEOUT_MS = Math.max(1000, Number(getArgValue('--timeout', '4500')) || 4500)
const OUTPUT_FILE = getArgValue('--output', '')
const STRICT_MODE = args.includes('--strict')

function loadCatalogStations() {
  const files = [
    path.join(ROOT_DIR, 'data', 'stations.json'),
    path.join(ROOT_DIR, 'data', 'stations-cajamarca.json'),
  ]

  const seenUrls = new Set()
  const stations = []

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const list = Array.isArray(raw) ? raw : Array.isArray(raw.stations) ? raw.stations : []

    for (const item of list) {
      const streamUrl = String(item.streamUrl || item.url || '').trim()
      if (!streamUrl || seenUrls.has(streamUrl)) continue
      seenUrls.add(streamUrl)
      stations.push({
        name: String(item.name || item.nombre || 'Sin nombre').trim(),
        country: String(item.country || item.pais || '').trim(),
        region: String(item.region || item.ciudad || '').trim(),
        streamUrl,
        isHttpMixedContent: streamUrl.startsWith('http://'),
        isHls: /\.m3u8(\?|$)/i.test(streamUrl),
      })
    }
  }

  return stations
}

async function probeStream(station) {
  const start = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(station.streamUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'RadioSatelitalHealthCheck/1.0',
        Range: 'bytes=0-255',
        'Icy-MetaData': '0',
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    const latencyMs = Date.now() - start
    const contentType = response.headers.get('content-type') || ''
    try {
      await response.body?.cancel()
    } catch {}

    const ok = response.status >= 200 && response.status < 400
    return {
      ...station,
      ok,
      status: response.status,
      contentType,
      latencyMs,
      error: ok ? null : `HTTP ${response.status}`,
    }
  } catch (err) {
    const latencyMs = Date.now() - start
    return {
      ...station,
      ok: false,
      status: 0,
      contentType: '',
      latencyMs,
      error: err instanceof Error ? err.name || err.message : 'NetworkError',
    }
  } finally {
    clearTimeout(timer)
  }
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length)
  let cursor = 0

  async function next() {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx], idx)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => next()))
  return results
}

async function main() {
  const stations = loadCatalogStations()
  console.log(`Auditando ${stations.length} streams unicos (concurrencia=${CONCURRENCY}, timeout=${TIMEOUT_MS}ms)...`)

  const results = await runPool(stations, CONCURRENCY, probeStream)

  const healthy = results.filter((r) => r.ok)
  const failed = results.filter((r) => !r.ok)
  const mixedContent = results.filter((r) => r.isHttpMixedContent)
  const hlsStreams = results.filter((r) => r.isHls)
  const avgLatencyMs =
    healthy.length > 0
      ? Math.round(healthy.reduce((acc, r) => acc + r.latencyMs, 0) / healthy.length)
      : null

  const summary = {
    checkedAt: new Date().toISOString(),
    totalStreams: results.length,
    healthyCount: healthy.length,
    failedCount: failed.length,
    successRatePercent: results.length > 0 ? Math.round((healthy.length / results.length) * 100) : 0,
    httpMixedContentCount: mixedContent.length,
    hlsCount: hlsStreams.length,
    avgHeaderLatencyMs: avgLatencyMs,
    failedStreams: failed.map((f) => ({
      name: f.name,
      country: f.country,
      streamUrl: f.streamUrl,
      error: f.error,
    })),
  }

  console.log('--------------------------------------------------')
  console.log(`Total streams verificados : ${summary.totalStreams}`)
  console.log(`Accesibles (2xx/3xx)      : ${summary.healthyCount} (${summary.successRatePercent}%)`)
  console.log(`Inaccesibles / Timeout    : ${summary.failedCount}`)
  console.log(`Streams HTTP (Proxy req.) : ${summary.httpMixedContentCount}`)
  console.log(`Streams HLS (.m3u8)       : ${summary.hlsCount}`)
  console.log(`Latencia media cabecera   : ${avgLatencyMs !== null ? `${avgLatencyMs} ms` : 'N/A'}`)
  console.log('--------------------------------------------------')

  if (OUTPUT_FILE) {
    const resolvedOut = path.resolve(process.cwd(), OUTPUT_FILE)
    fs.writeFileSync(resolvedOut, JSON.stringify({ summary, results }, null, 2), 'utf8')
    console.log(`Reporte JSON guardado en: ${resolvedOut}`)
  }

  if (STRICT_MODE && summary.successRatePercent < 50) {
    console.error('Error: Menos del 50% del catalogo responde satisfactoriamente.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fallo inesperado en check-streams:', err)
  process.exit(1)
})
