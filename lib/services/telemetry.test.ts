import { beforeEach, describe, expect, it } from 'vitest'
import {
  getStationHealth,
  getTelemetrySummary,
  recordStreamFailure,
  recordStreamSuccess,
  resetTelemetry,
  subscribeTelemetry,
} from './telemetry'

describe('stream health telemetry & observability', () => {
  beforeEach(() => {
    resetTelemetry()
  })

  it('records successful stream playback and computes EMA TTFA latency', () => {
    const first = recordStreamSuccess('activa-jaen', 'Activa Jaén', 1000)
    expect(first.plays).toBe(1)
    expect(first.avgTtfaMs).toBe(1000)
    expect(first.status).toBe('healthy')

    const second = recordStreamSuccess('activa-jaen', 'Activa Jaén', 2000)
    expect(second.plays).toBe(2)
    // EMA: round(1000 * 0.7 + 2000 * 0.3) = 1300
    expect(second.avgTtfaMs).toBe(1300)
    expect(second.consecutiveFailures).toBe(0)
  })

  it('transitions station health from healthy -> degraded -> unreachable on consecutive failures', () => {
    recordStreamSuccess('onda-azul', 'Radio Onda Azul', 850)
    expect(getStationHealth('onda-azul')?.status).toBe('healthy')

    const degraded = recordStreamFailure('onda-azul', 'Radio Onda Azul', 'network-timeout')
    expect(degraded.status).toBe('degraded')
    expect(degraded.consecutiveFailures).toBe(1)

    const unreachable = recordStreamFailure('onda-azul', 'Radio Onda Azul', 'http-502')
    expect(unreachable.status).toBe('unreachable')
    expect(unreachable.consecutiveFailures).toBe(2)

    // Recovery resets consecutiveFailures back to healthy
    const recovered = recordStreamSuccess('onda-azul', 'Radio Onda Azul', 900)
    expect(recovered.status).toBe('healthy')
    expect(recovered.consecutiveFailures).toBe(0)
  })

  it('aggregates global summary and notifies subscribers', () => {
    const snapshots: number[] = []
    const unsubscribe = subscribeTelemetry((summary) => {
      snapshots.push(summary.totalPlays)
    })

    recordStreamSuccess('st-1', 'Radio 1', 800)
    recordStreamSuccess('st-2', 'Radio 2', 1200)
    recordStreamFailure('st-3', 'Radio 3', 'offline')
    recordStreamFailure('st-3', 'Radio 3', 'offline')

    const summary = getTelemetrySummary()
    expect(summary.totalPlays).toBe(2)
    expect(summary.totalFailures).toBe(2)
    expect(summary.avgGlobalTtfaMs).toBe(1000)
    expect(summary.healthyStationsCount).toBe(2)
    expect(summary.unreachableStationsCount).toBe(1)
    expect(snapshots[snapshots.length - 1]).toBe(2)

    unsubscribe()
  })
})
