import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { isolateNetwork, origin } from './fixtures.mjs'
import { startPcmServer } from './pcm-server.mjs'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'

test('catalog, favorites, theme persistence and keyboard navigation', async ({ page }, info) => {
  await isolateNetwork(page)
  await page.goto('/')
  const search = page.getByRole('searchbox', { name: /Buscar emisoras/ })
  await search.fill('Activa Jaén')
  const card = page.locator('#station-list article').filter({ hasText: 'Activa Jaén' })
  await expect(card).toHaveCount(1)
  await card.getByRole('button', { name: 'Guardar en favoritas: Activa Jaén' }).click()
  await expect(card.getByRole('button', { name: 'Quitar de favoritas: Activa Jaén' })).toHaveAttribute('aria-pressed', 'true')
  const opener = page.getByRole('button', { name: 'Abrir ajustes de apariencia y audio' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: /ajustes/i })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /Claro Exterior/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light')
  await dialog.getByRole('button', { name: /Cerrar ajustes/ }).click()
  await expect(dialog).toBeHidden()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light')
  await search.fill('Activa Jaén')
  await expect(card.getByRole('button', { name: 'Quitar de favoritas: Activa Jaén' })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  await info.attach('exterior.png', { body: await page.screenshot(), contentType: 'image/png' })
  const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()
  const findings = results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))
  console.log('CROSS_AXE ' + JSON.stringify({ project: info.project.name, findings }))
  expect(findings).toEqual([])
})

test('PCM playback, stereo DSP and pause in actual browser engine', async ({ page }, info) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext || window.webkitAudioContext
    if (!Original) return
    const events = []
    window.__mediaEvents = events
    for (const type of ['loadstart','loadedmetadata','loadeddata','canplay','playing','waiting','stalled','pause','abort','emptied','error','ended','timeupdate']) {
      document.addEventListener(type, event => {
        const a = event.target
        if (!(a instanceof HTMLMediaElement) || a.id !== 'radioPlayer' || events.length >= 120) return
        events.push({ type, t: Math.round(performance.now()), clock: a.currentTime, paused: a.paused, readyState: a.readyState, error: a.error?.code ?? null, message: a.error?.message ?? null })
      }, true)
    }
    const contexts = []
    window.__audioProbe = contexts
    const playAttempts = []
    window.__playAttempts = playAttempts
    const originalPlay = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (...args) {
      const attempt = { userActivation: navigator.userActivation?.isActive ?? null, src: this.src, result: 'pending' }
      playAttempts.push(attempt)
      const pending = originalPlay.apply(this, args)
      pending?.then(() => { attempt.result = 'resolved' }, error => { attempt.result = error?.name ?? 'Error' })
      return pending
    }
    const Instrumented = class extends Original {
      constructor(...args) {
        super(...args)
        contexts.push(this)
      }
    }
    if (window.AudioContext) window.AudioContext = Instrumented
    else window.webkitAudioContext = Instrumented
  })
  const fixture = await startPcmServer(page)
  try {
  await isolateNetwork(page, false, origin, fixture.url)
  await page.goto('/')
  await page.getByRole('button', { name: 'Reproducir: Activa Jaén', exact: true }).click()
  try {
    await expect.poll(() => page.locator('#radioPlayer').evaluate(a => !a.paused && a.currentTime > 0.1)).toBe(true)
    await expect.poll(() => page.locator('#radioPlayer').evaluate(a => a.currentSrc)).toBe(fixture.url)
    expect(fixture.requests()).toBeGreaterThan(0)
  } finally {
    console.log('CROSS_STARTUP ' + JSON.stringify({ project: info.project.name, fixtureRequests: fixture.requests(), responses: fixture.responses(),
      ...(await page.evaluate(() => {
        const a = document.getElementById('radioPlayer')
        return { events: window.__mediaEvents ?? [], attempts: window.__playAttempts ?? [], media: a ? { src: a.src, currentSrc: a.currentSrc,
          paused: a.paused, currentTime: a.currentTime, readyState: a.readyState, networkState: a.networkState,
          errorCode: a.error?.code ?? null, errorMessage: a.error?.message ?? null } : null }
      })),
    }))
  }
  await page.getByRole('button', { name: /Abrir reproductor expandido/ }).click()
  await page.getByRole('button', { name: 'Cabina', exact: true }).click()
  await expect(page.getByText('Picos por canal L / R', { exact: true })).toBeVisible()
  const activate = page.getByRole('button', { name: 'Activar análisis DSP', exact: true })
  if (await activate.isVisible()) await activate.click()
  const peak = async channel => {
    const text = await page.getByText(channel, { exact: true }).locator('..').innerText()
    const match = /(-?\d+(?:\.\d+)?)\s*dBFS/.exec(text)
    return match ? Number(match[1]) : null
  }
  try {
    await expect.poll(async () => {
      const left = await peak('CH-L'), right = await peak('CH-R')
      return left === null || right === null ? 0 : left - right
    }).toBeGreaterThan(8)
    expect(Math.abs((await peak('CH-L')) + 10.1)).toBeLessThan(2)
    expect(Math.abs((await peak('CH-R')) + 22.2)).toBeLessThan(2)
  } finally {
    const probe = await page.evaluate(() => ({
      contexts: (window.__audioProbe ?? []).map(ctx => ({ state: ctx.state, sampleRate: ctx.sampleRate, currentTime: ctx.currentTime })),
      media: (() => {
        const a = document.getElementById('radioPlayer')
        return a ? { crossOrigin: a.crossOrigin, paused: a.paused, currentTime: a.currentTime, errorCode: a.error?.code ?? null } : null
      })(),
    }))
    console.log('CROSS_AUDIO_PROBE ' + JSON.stringify({ project: info.project.name, ...probe,
      fixtureRequests: fixture.requests(),
      left: await page.getByText('CH-L', { exact: true }).locator('..').innerText(),
      right: await page.getByText('CH-R', { exact: true }).locator('..').innerText(),
    }))
  }
  console.log('CROSS_STEREO ' + JSON.stringify({ project: info.project.name, left: await peak('CH-L'), right: await peak('CH-R') }))
  await page.getByRole('button', { name: 'Pausar transmisión' }).click()
  await expect.poll(() => page.locator('#radioPlayer').getAttribute('src')).toBe(null)
  } finally { await fixture.close() }
})

test('manifest, service worker control and shell with the origin unavailable', async ({ page }, info) => {
  const url = 'http://127.0.0.1:4175'
  const server = spawn('python3', ['-m','http.server','4175','--bind','127.0.0.1','--directory','out'], { stdio: 'ignore' })
  const exited = once(server, 'exit')
  try {
    let ready = false
    for (let i = 0; i < 40; i++) {
      try { ready = (await fetch(url)).ok } catch {}
      if (ready) break
      await delay(250)
    }
    expect(ready).toBe(true)
    await isolateNetwork(page, false, url)
    await page.goto(url)
    await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
    const manifest = await page.evaluate(async () => (await fetch('/manifest.json')).json())
    expect(manifest.display).toBe('standalone')
    expect(manifest.orientation).toBe('any')
    const cached = await page.evaluate(async () => {
      const cache = await caches.open((await caches.keys()).find(name => name.startsWith('radio-satelital-shell-')))
      return Boolean(await cache.match('/'))
    })
    expect(cached).toBe(true)
    // Disconnect the actual origin instead of browser protocol offline emulation,
    // which produced NS_ERROR_OFFLINE before Firefox dispatched navigation to the SW.
    server.kill()
    await exited
    await expect(fetch(url)).rejects.toThrow()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Abrir ajustes de apariencia y audio' }).click()
    await expect(page.getByRole('dialog', { name: /ajustes/i })).toBeVisible()
    console.log('CROSS_PWA ' + JSON.stringify({ project: info.project.name, originUnavailableInteractive: true }))
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill()
      await exited
    }
  }
})

test('control: native HTML audio plays the exact local cross-origin PCM resource', async ({ page }, info) => {
  const fixture = await startPcmServer(page)
  const probeUrl = origin + '/__pcm-control'
  try {
    await page.route(probeUrl, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="es"><title>Control PCM</title><button id="play">Reproducir control</button><audio id="control" crossorigin="anonymous"></audio></html>' }))
    await page.goto(probeUrl)
    await page.evaluate(url => {
      const audio = document.getElementById('control')
      window.__controlEvents = []
      for (const type of ['loadstart','loadedmetadata','canplay','playing','waiting','stalled','error','ended','pause','timeupdate']) {
        audio.addEventListener(type, () => {
          if (window.__controlEvents.length < 80) window.__controlEvents.push({ type, time: audio.currentTime, ready: audio.readyState, error: audio.error?.code ?? null, message: audio.error?.message ?? null })
        })
      }
      document.getElementById('play').addEventListener('click', () => {
        audio.src = url
        audio.play().then(() => { window.__controlPlay = 'resolved' }, e => { window.__controlPlay = e.name })
      })
    }, fixture.url)
    await page.getByRole('button', { name: 'Reproducir control' }).click()
    try {
      await expect.poll(() => page.locator('#control').evaluate(a => !a.paused && a.currentTime > 0.5)).toBe(true)
      expect(fixture.requests()).toBeGreaterThan(0)
    } finally {
      console.log('NATIVE_CONTROL ' + JSON.stringify({ project: info.project.name, responses: fixture.responses(), ...(await page.evaluate(() => ({
        play: window.__controlPlay ?? null, events: window.__controlEvents ?? [],
        clock: document.getElementById('control').currentTime
      }))) }))
    }
  } finally { await fixture.close() }
})
