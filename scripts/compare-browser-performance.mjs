/**
 * Paired benchmark of the original and modernized static builds, in the same Linux runner.
 * Synthetic stereo media, fresh Chromium per trial, identical viewport and workload.
 * CPU: cumulative time of matched Chromium processes; PSS: Linux proportional set size.
 * Neither is a physical-device or battery measurement.
 */
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { isolateNetwork } from '../tests/browser/fixtures.mjs'

const builds = {
  baseline: { dir: process.argv[2] || 'baseline/out', url: 'http://127.0.0.1:4180' },
  candidate: { dir: process.argv[3] || 'out', url: 'http://127.0.0.1:4181' },
}
const children = []
const results = []
const duration = 3000

async function startServer(build) {
  const child = spawn('python3', ['-m', 'http.server', new URL(build.url).port, '--bind', '127.0.0.1', '--directory', build.dir], { stdio: 'ignore' })
  children.push(child)
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(build.url)).ok) return } catch {}
    await delay(250)
  }
  throw new Error('Static build not available: ' + build.dir)
}

async function processSnapshot(session) {
  const { processInfo } = await session.send('SystemInfo.getProcessInfo')
  return processInfo
}

async function memoryPss(processes) {
  const measurements = await Promise.all(processes.map(async p => {
    try {
      const text = await readFile('/proc/' + p.id + '/smaps_rollup', 'utf8')
      const match = /^Pss:\s+(\d+)\s+kB$/m.exec(text)
      return match ? Number(match[1]) * 1024 : null
    } catch { return null }
  }))
  return measurements.every(value => value !== null) ? measurements.reduce((a, b) => a + b, 0) : null
}

async function trial(label, run) {
  const build = builds[label]
  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' })
    const page = await context.newPage()
    await isolateNetwork(page, true, build.url)
    await page.goto(build.url, { waitUntil: 'domcontentloaded' })
    await page.locator('#station-list').waitFor()
    await delay(1000)
    const session = await context.newCDPSession(page)
    const system = await browser.newBrowserCDPSession()
    await session.send('Performance.enable')
    const metrics = async () => Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
    const collect = async state => {
      const beforeProcesses = await processSnapshot(system)
      const before = await metrics()
      await delay(duration)
      const after = await metrics()
      const afterProcesses = await processSnapshot(system)
      const prior = new Map(beforeProcesses.map(p => [p.id, p.cpuTime]))
      const stable = afterProcesses.filter(p => prior.has(p.id))
      const elapsed = after.Timestamp - before.Timestamp
      const cpuSeconds = stable.reduce((sum, p) => sum + Math.max(0, p.cpuTime - prior.get(p.id)), 0)
      return {
        state,
        elapsedSeconds: elapsed,
        matchedProcessCpuSeconds: cpuSeconds,
        cpuPercentOneCore: 100 * cpuSeconds / elapsed,
        matchedProcesses: stable.length,
        processCountBefore: beforeProcesses.length,
        processCountAfter: afterProcesses.length,
        pssBytes: await memoryPss(afterProcesses),
        jsHeapBytes: after.JSHeapUsedSize,
        mainThreadTaskSeconds: after.TaskDuration - before.TaskDuration,
      }
    }
    const idle = await collect('idle')
    const start = Date.now()
    await page.getByRole('button', { name: 'Reproducir: Activa Jaén', exact: true }).click()
    await page.waitForFunction(() => {
      const audio = document.getElementById('radioPlayer')
      return audio && !audio.paused && audio.currentTime > 0.1
    }, { timeout: 15000 })
    const clickToPlaybackMs = Date.now() - start
    await delay(500)
    const playback = await collect('playback')
    await page.getByRole('button', { name: /Abrir reproductor expandido/ }).click()
    await page.getByRole('button', { name: 'Cabina', exact: true }).click()
    await page.getByRole('button', { name: 'Cerrar cabina de monitoreo' }).waitFor()
    await delay(500)
    const studio = await collect('studio')
    await session.detach()
    await system.detach()
    return { label, run, clickToPlaybackMs, states: [idle, playback, studio] }
  } finally { await browser.close() }
}

function median(values) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function summarize() {
  const out = {}
  for (const state of ['idle', 'playback', 'studio']) {
    out[state] = {}
    for (const metric of ['cpuPercentOneCore', 'pssBytes', 'jsHeapBytes', 'mainThreadTaskSeconds']) {
      const medians = {}
      for (const label of ['baseline', 'candidate']) {
        const values = results.filter(r => r.label === label).map(r => r.states.find(s => s.state === state)?.[metric]).filter(Number.isFinite)
        medians[label] = values.length === 3 ? median(values) : null
      }
      out[state][metric] = { ...medians, changePercent: medians.baseline && medians.candidate !== null ? 100 * (medians.candidate / medians.baseline - 1) : null }
    }
  }
  return out
}

try {
  await Promise.all(Object.values(builds).map(startServer))
  for (let run = 1; run <= 3; run++) {
    const order = run % 2 ? ['baseline','candidate'] : ['candidate','baseline']
    for (const label of order) {
      const result = await trial(label, run)
      results.push(result)
      console.log('BENCH_TRIAL ' + JSON.stringify(result))
    }
  }
} finally {
  for (const child of children) child.kill()
  const report = {
    environment: 'same hosted Linux runner; Chromium headless; 3 paired trials; 3-second windows; PCM fixture; original baseline lacks committed npm lock; PSS may be unavailable; excludes device battery',
    baselineCommit: '8a58fbc4591827a5f6257e96e6086cfafb251479',
    candidateCommit: process.env.GITHUB_SHA ?? null,
    results,
    summary: summarize(),
  }
  await mkdir('benchmark-results', { recursive: true })
  await writeFile('benchmark-results/performance-comparison.json', JSON.stringify(report, null, 2))
  console.log('BENCH_SUMMARY ' + JSON.stringify(report.summary))
}
