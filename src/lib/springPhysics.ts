import type { SpringConfig, CurveSample } from '../types'

const SETTLE_THRESHOLD = 0.001
const MAX_DURATION_MS = 5000
const STEP_MS = 8 // ~120hz simulation, downsampled for rendering

/**
 * Simulate spring physics using semi-implicit Euler integration.
 * Returns normalized samples where time=1 corresponds to when the spring
 * has settled within SETTLE_THRESHOLD of the target.
 */
export function simulateSpring(config: SpringConfig): CurveSample[] {
  const { stiffness, damping, mass, initialVelocity } = config

  const samples: CurveSample[] = []
  let position = 0   // displacement from start (target = 1)
  let velocity = initialVelocity
  let timeMs = 0
  let settledAt: number | null = null

  // Run until settled or max duration
  while (timeMs <= MAX_DURATION_MS) {
    const force = -stiffness * (position - 1) - damping * velocity
    const acceleration = force / mass

    velocity += acceleration * (STEP_MS / 1000)
    position += velocity * (STEP_MS / 1000)

    samples.push({ time: timeMs, value: position })

    const distFromTarget = Math.abs(position - 1)
    const isStill = Math.abs(velocity) < SETTLE_THRESHOLD

    if (distFromTarget < SETTLE_THRESHOLD && isStill && settledAt === null) {
      settledAt = timeMs
    }

    // Stop recording 200ms after settling to capture the flat end
    if (settledAt !== null && timeMs > settledAt + 200) break

    timeMs += STEP_MS
  }

  const totalMs = settledAt ?? timeMs

  // Normalize time axis so 1.0 = settle point
  return samples.map(s => ({
    time: s.time / totalMs,
    value: s.value,
  }))
}

/** Interpolate a pre-computed sample array at a given normalised time (0–1+). */
export function interpolateSamples(samples: CurveSample[], t: number): number {
  if (t <= 0) return 0
  const last = samples[samples.length - 1]
  if (!last || t >= last.time) return last?.value ?? 1

  let lo = 0
  let hi = samples.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (samples[mid].time <= t) lo = mid
    else hi = mid
  }

  const span = samples[hi].time - samples[lo].time
  if (span === 0) return samples[lo].value
  const frac = (t - samples[lo].time) / span
  return samples[lo].value + frac * (samples[hi].value - samples[lo].value)
}

/** Returns the natural settle duration in milliseconds. */
export function getSpringDuration(config: SpringConfig): number {
  const { stiffness, damping, mass, initialVelocity } = config
  let position = 0
  let velocity = initialVelocity
  let timeMs = 0

  while (timeMs <= MAX_DURATION_MS) {
    const force = -stiffness * (position - 1) - damping * velocity
    velocity += (force / mass) * (STEP_MS / 1000)
    position += velocity * (STEP_MS / 1000)

    if (Math.abs(position - 1) < SETTLE_THRESHOLD && Math.abs(velocity) < SETTLE_THRESHOLD) {
      return timeMs
    }
    timeMs += STEP_MS
  }

  return MAX_DURATION_MS
}
