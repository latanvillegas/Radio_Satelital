/** Live API/CORS diagnostic; external availability is not a deterministic release gate. */
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'

const origin = 'http://127.0.0.1:4175'
const server = spawn('python3', ['-m', 'http.server', '4175', '--bind', '127.0.0.1', '--directory', 'out'], { stdio: 'ignore' })
let browser
let report = { ok: false, checkedAt: new Date().toISOString() }
try {
  let ready = false
  for (let i = 0; i < 30; i++) {
    try { ready = (await fetch(origin)).ok } catch {}
    if (ready) break
    await delay(250)
  }
  if (!ready) throw new Error('Static export unavailable')
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ serviceWorkers: 'block' })
  const page = await context.newPage()
  const responses = []
  page.on('response', response => {
    if (/^https:\/\/[^/]+\.api\.radio-browser\.info\/json\/stations\/search\?/.test(response.url())) responses.push({ mirror: new URL(response.url()).hostname, status: response.status() })
  })
  await page.route('**/*', route => {
    const request = route.request()
    if (!request.url().startsWith(origin + '/') && ['image','font','stylesheet'].includes(request.resourceType())) return route.abort()
    return route.continue()
  })
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.getByRole('button', { name: 'Radio Browser', exact: true }).click()
  await page.locator('#station-list').waitFor({ state: 'visible', timeout: 20000 })
  const count = await page.locator('#station-list .station-tile').count()
  report = { ...report, ok: count > 0, count, responses }
  await context.close()
} catch (error) {
  report = { ...report, error: error?.name || 'Error' }
} finally {
  await browser?.close()
  server.kill()
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/live-radio-browser.json', JSON.stringify(report, null, 2))
  console.log('LIVE_RADIO_BROWSER ' + JSON.stringify(report))
}
if (!report.ok) process.exitCode = 1
