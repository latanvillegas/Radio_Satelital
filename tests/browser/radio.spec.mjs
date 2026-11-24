import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const origin = 'http://127.0.0.1:4173'
const stationUrl = 'https://sp.onliveperu.com/8108/stream'
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Deterministic 30-second stereo PCM fixture, different amplitudes per channel.
function makeWav() {
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

async function isolateNetwork(page, audio = false) {
  const wav = audio ? makeWav() : null
  await page.route('**/*', async route => {
    const request = route.request()
    if (request.url().startsWith(origin + '/')) return route.continue()
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

async function audit(page, info, label) {
  const result = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  const findings = result.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))
  console.log('AXE ' + label + ' ' + JSON.stringify(findings))
  await info.attach('axe-' + label + '.json', { body: JSON.stringify(result, null, 2), contentType: 'application/json' })
  expect(findings, label).toEqual([])
}

test('PWA installs the static shell and remains interactive after offline reload', async ({ page, context }) => {
  await isolateNetwork(page)
  await page.goto('/')
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  const manifest = await page.evaluate(async () => (await fetch('/manifest.json')).json())
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.map(x => x.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
  const cached = await page.evaluate(async () => {
    const names = await caches.keys()
    const entries = await Promise.all(names.map(async name => (await (await caches.open(name)).keys()).map(x => new URL(x.url).pathname)))
    return entries.flat()
  })
  expect(cached).toContain('/')
  expect(cached.some(x => x.startsWith('/_next/static/') && x.endsWith('.js'))).toBe(true)
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByText(/Sin conexión a Internet/)).toBeVisible()
  const button = page.getByRole('button', { name: 'Abrir ajustes de apariencia y audio' })
  await button.click()
  await expect(page.getByRole('dialog', { name: /ajustes/i })).toBeVisible()
  await context.setOffline(false)
})

test('real Chromium audio playback, offline recovery and manual cancellation with PCM fixture', async ({ page, context }) => {
  await isolateNetwork(page, true)
  await page.goto('/')
  await page.getByRole('button', { name: 'Reproducir: Activa Jaén', exact: true }).click()
  await expect.poll(() => page.locator('#radioPlayer').evaluate(a => !a.paused && a.currentTime > 0.1)).toBe(true)
  await context.setOffline(true)
  await expect(page.getByText('Sin red', { exact: true }).first()).toBeVisible()
  await expect.poll(() => page.locator('#radioPlayer').getAttribute('src')).toBe(null)
  await context.setOffline(false)
  await expect.poll(() => page.locator('#radioPlayer').evaluate(a => !a.paused && a.currentTime > 0.1)).toBe(true)
  await page.getByRole('button', { name: 'Pausar radio', exact: true }).click()
  await expect.poll(() => page.locator('#radioPlayer').getAttribute('src')).toBe(null)
})

test('responsive layout and keyboard modal at 320px, AMOLED and exterior', async ({ page }, info) => {
  await isolateNetwork(page)
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  await expect(page.locator('#station-list')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321)
  const opener = page.getByRole('button', { name: 'Abrir ajustes de apariencia y audio' })
  await opener.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: /ajustes/i })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Acento Rojo Broadcast' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'amoled')
  await expect.poll(() => page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--bg-canvas').trim())).toBe('#000')
  await dialog.getByRole('button', { name: /Claro Exterior/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  await info.attach('mobile-exterior.png', { body: await page.screenshot(), contentType: 'image/png' })
  await audit(page, info, 'exterior-mobile')
})

test('automated WCAG checks on desktop and settings', async ({ page }, info) => {
  await isolateNetwork(page)
  await page.goto('/')
  await audit(page, info, 'dark-desktop')
  await page.getByRole('button', { name: 'Abrir ajustes de apariencia y audio' }).click()
  await expect(page.getByRole('dialog', { name: /ajustes/i })).toBeVisible()
  await audit(page, info, 'settings-desktop')
})

test('capture Chromium task duration and JS heap in idle and playback', async ({ page, context }, info) => {
  await isolateNetwork(page, true)
  await page.goto('/')
  const cdp = await context.newCDPSession(page)
  await cdp.send('Performance.enable')
  const snapshot = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]))
  const collect = async (label) => {
    const before = await snapshot()
    await page.waitForTimeout(3000)
    const after = await snapshot()
    const value = { label, durationSeconds: after.Timestamp - before.Timestamp, taskSeconds: after.TaskDuration - before.TaskDuration, jsHeapBytes: after.JSHeapUsedSize, nodes: after.Nodes }
    expect(Number.isFinite(value.taskSeconds)).toBe(true)
    expect(value.jsHeapBytes).toBeGreaterThan(0)
    return value
  }
  const idle = await collect('idle')
  await page.getByRole('button', { name: 'Reproducir: Activa Jaén', exact: true }).click()
  await expect.poll(() => page.locator('#radioPlayer').evaluate(a => !a.paused && a.currentTime > 0.1)).toBe(true)
  const playback = await collect('playback')
  const report = { environment: 'Headless Chromium CI; synthetic PCM; CPU task time proxy; not battery, device RAM or baseline comparison', idle, playback }
  console.log('PERFORMANCE ' + JSON.stringify(report))
  await info.attach('performance.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' })
  await cdp.detach()
})

test('stereo peak meter separates PCM channels and recorder produces a downloadable file', async ({ page }, info) => {
  await isolateNetwork(page, true)
  await page.goto('/')
  await page.getByRole('button', { name: 'Reproducir: Activa Jaén', exact: true }).click()
  await expect.poll(() => page.locator('#radioPlayer').evaluate(a => !a.paused && a.currentTime > 0.1)).toBe(true)
  await page.getByRole('button', { name: /Abrir reproductor expandido/ }).click()
  await page.getByRole('button', { name: 'Cabina', exact: true }).click()
  await expect(page.getByText('Picos por canal L / R', { exact: true })).toBeVisible()
  const readPeak = async channel => {
    const text = await page.getByText(channel, { exact: true }).locator('..').innerText()
    const match = /(-?\d+(?:\.\d+)?)\s*dBFS/.exec(text)
    return match ? Number(match[1]) : null
  }
  await expect.poll(async () => {
    const left = await readPeak('CH-L'), right = await readPeak('CH-R')
    return left !== null && right !== null ? left - right : 0
  }).toBeGreaterThan(8)
  const peaks = { leftDbfs: await readPeak('CH-L'), rightDbfs: await readPeak('CH-R') }
  console.log('STEREO ' + JSON.stringify(peaks))
  await info.attach('stereo-peaks.json', { body: JSON.stringify(peaks), contentType: 'application/json' })
  await page.getByRole('button', { name: 'Grabar emisión' }).click()
  await expect(page.getByRole('button', { name: /Detener \(/ })).toBeVisible()
  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: /Detener \(/ }).click()
  const downloadButton = page.getByRole('button', { name: 'Descargar grabación' })
  await expect(downloadButton).toBeEnabled()
  const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()])
  expect(download.suggestedFilename()).toMatch(/\.(webm|ogg|m4a)$/)
  const file = await download.path()
  expect((await fs.stat(file)).size).toBeGreaterThan(0)
})

test('HLS.js plays a local AAC transport stream in the real browser', async ({ page }) => {
  const hlsBase = 'https://rnelivestream.rtve.es/rnerc/main/'
  const fixture = path.resolve('out/hls-fixture')
  let segmentRequests = 0
  await page.route('**/*', async route => {
    const url = route.request().url()
    if (url.startsWith(origin + '/')) return route.continue()
    if (url.startsWith(hlsBase)) {
      const name = url.slice(hlsBase.length).split('?')[0]
      if (!/^(master\.m3u8|segment-\d+\.ts)$/.test(name)) return route.abort()
      if (name.endsWith('.ts')) segmentRequests++
      return route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*', 'content-type': name.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t' },
        body: await fs.readFile(path.join(fixture, name)),
      })
    }
    return route.abort()
  })
  await page.goto('/')
  await page.getByRole('searchbox', { name: /Buscar emisoras/ }).fill('RNE Radio Clásica')
  await page.getByRole('button', { name: 'Reproducir: RNE Radio Clásica', exact: true }).click()
  await expect.poll(() => page.locator('#radioPlayer').evaluate(a => !a.paused && a.currentTime > 0.1), { timeout: 25000 }).toBe(true)
  expect(segmentRequests).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Pausar radio', exact: true }).click()
  await expect.poll(() => page.locator('#radioPlayer').getAttribute('src')).toBe(null)
})
