/**
 * Diagnostic of selected real catalog stations using Chromium.
 * External availability is deliberately separated from deterministic regression tests.
 */
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'

const origin = 'http://127.0.0.1:4174'
const stations = [
  { name: 'Activa Jaén', slug: 'activa-jaen', transport: 'HTTP audio' },
  { name: 'RNE Radio Clásica', slug: 'rne-radio-clasica', transport: 'HLS' },
]
const server = spawn('python3', ['-m', 'http.server', '4174', '--bind', '127.0.0.1', '--directory', 'out'], { stdio: ['ignore', 'ignore', 'ignore'] })
let browser
const results = []
try {
  let ready = false
  for (let i = 0; i < 30; i++) {
    try { ready = (await fetch(origin)).ok } catch {}
    if (ready) break
    await delay(250)
  }
  if (!ready) throw new Error('Static export server is not ready')
  browser = await chromium.launch({ headless: true })
  for (const station of stations) {
    const context = await browser.newContext({ serviceWorkers: 'block' })
    const page = await context.newPage()
    let ttfaMs = null
    let result
    try {
      // Avoid unrelated third-party images/fonts. Do not mock or replace station media.
      await page.route('**/*', route => {
        const request = route.request()
        if (!request.url().startsWith(origin + '/') && ['image','font','stylesheet'].includes(request.resourceType())) return route.abort()
        return route.continue()
      })
      await page.goto(origin + '/emisora/' + station.slug + '/', { waitUntil: 'domcontentloaded', timeout: 15000 })
      const button = page.getByRole('button', { name: 'Escuchar en directo', exact: true })
      await button.waitFor({ timeout: 10000 })
      await page.locator('#radioPlayer').waitFor({ state: 'attached', timeout: 10000 })
      await button.evaluate(el => {
        el.addEventListener('click', () => {
          window.__probeStarted = performance.now()
          document.getElementById('radioPlayer')?.addEventListener('playing', () => {
            window.__probeTTFA = Math.round(performance.now() - window.__probeStarted)
          }, { once: true })
        }, { capture: true, once: true })
      })
      await button.click()
      await page.waitForFunction(() => {
        const audio = document.getElementById('radioPlayer')
        return audio && !audio.paused && audio.readyState >= 2 && audio.currentTime > 0.1
      }, { timeout: 25000 })
      const before = await page.locator('#radioPlayer').evaluate(audio => audio.currentTime)
      await delay(1200)
      const after = await page.locator('#radioPlayer').evaluate(audio => audio.currentTime)
      if (after <= before + 0.1) throw new Error('Playback clock did not advance')
      ttfaMs = await page.evaluate(() => typeof window.__probeTTFA === 'number' ? window.__probeTTFA : null)
      result = { ...station, ok: true, ttfaMs, playbackAdvancedSeconds: Number((after - before).toFixed(3)) }
    } catch (error) {
      const state = await page.locator('#radioPlayer').evaluate(audio => ({ errorCode: audio.error?.code ?? null, readyState: audio.readyState, paused: audio.paused }), { timeout: 1000 }).catch(() => null)
      result = { ...station, ok: false, ttfaMs, error: error?.name || 'Error', mediaState: state }
    } finally {
      await context.close()
    }
    results.push(result)
    console.log('LIVE_STREAM ' + JSON.stringify(result))
  }
} finally {
  await browser?.close()
  server.kill()
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/live-streams.json', JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2))
}
if (results.length !== stations.length || results.some(result => !result.ok)) {
  console.error('At least one external station did not play; investigate network, CORS, station availability or playback.')
  process.exitCode = 1
}
