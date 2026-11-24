import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { isolateNetwork } from './fixtures.mjs'

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
  await isolateNetwork(page, true)
  await page.goto('/')
  await page.getByRole('button', { name: 'Reproducir: Activa Jaén', exact: true }).click()
  await expect.poll(() => page.locator('#radioPlayer').evaluate(a => !a.paused && a.currentTime > 0.1)).toBe(true)
  await page.getByRole('button', { name: /Abrir reproductor expandido/ }).click()
  await page.getByRole('button', { name: 'Cabina', exact: true }).click()
  await expect(page.getByText('Picos por canal L / R', { exact: true })).toBeVisible()
  const peak = async channel => {
    const text = await page.getByText(channel, { exact: true }).locator('..').innerText()
    const match = /(-?\d+(?:\.\d+)?)\s*dBFS/.exec(text)
    return match ? Number(match[1]) : null
  }
  await expect.poll(async () => {
    const left = await peak('CH-L'), right = await peak('CH-R')
    return left === null || right === null ? 0 : left - right
  }).toBeGreaterThan(8)
  console.log('CROSS_STEREO ' + JSON.stringify({ project: info.project.name, left: await peak('CH-L'), right: await peak('CH-R') }))
  await page.getByRole('button', { name: 'Pausar transmisión' }).click()
  await expect.poll(() => page.locator('#radioPlayer').getAttribute('src')).toBe(null)
})

test('manifest, service worker control and offline shell', async ({ page, context }, info) => {
  await isolateNetwork(page)
  await page.goto('/')
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null && Boolean(navigator.serviceWorker?.controller))
  const manifest = await page.evaluate(async () => (await fetch('/manifest.json')).json())
  expect(manifest.display).toBe('standalone')
  expect(manifest.orientation).toBe('any')
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByText(/Sin conexión a Internet/)).toBeVisible()
  await page.getByRole('button', { name: 'Abrir ajustes de apariencia y audio' }).click()
  await expect(page.getByRole('dialog', { name: /ajustes/i })).toBeVisible()
  await context.setOffline(false)
  console.log('CROSS_PWA ' + JSON.stringify({ project: info.project.name, offlineInteractive: true }))
})
