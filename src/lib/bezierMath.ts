import type { BezierConfig, CurveSample } from '../types'

const SAMPLE_COUNT = 200
const NEWTON_ITERATIONS = 8
const NEWTON_MIN_SLOPE = 0.001
const SUBDIVISION_PRECISION = 0.0000001
const SUBDIVISION_MAX_ITERATIONS = 10

function cubicBezierComponent(t: number, p1: number, p2: number): number {
  return (((1 - 3 * p2 + 3 * p1) * t + (3 * p2 - 6 * p1)) * t + 3 * p1) * t
}

function cubicBezierDerivative(t: number, p1: number, p2: number): number {
  return 3 * (1 - 3 * p2 + 3 * p1) * t * t + 2 * (3 * p2 - 6 * p1) * t + 3 * p1
}

/**
 * Given a CSS cubic-bezier (c1x, c1y, c2x, c2y), returns a lookup table
 * mapping normalized x (time) values to t parameters for efficient inversion.
 */
function buildSampleTable(c1x: number, c2x: number): Float32Array {
  const table = new Float32Array(SAMPLE_COUNT)
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    table[i] = cubicBezierComponent(i / (SAMPLE_COUNT - 1), c1x, c2x)
  }
  return table
}

function getTForX(x: number, c1x: number, c2x: number, table: Float32Array): number {
  let intervalStart = 0
  let currentSample = 1
  const lastSample = SAMPLE_COUNT - 1

  // Find the interval in the sample table
  while (currentSample !== lastSample && table[currentSample] <= x) {
    intervalStart += 1 / (SAMPLE_COUNT - 1)
    currentSample++
  }
  currentSample--

  const dist = (x - table[currentSample]) / (table[currentSample + 1] - table[currentSample])
  let guessT = intervalStart + dist / (SAMPLE_COUNT - 1)

  // Newton-Raphson refinement
  const initialSlope = cubicBezierDerivative(guessT, c1x, c2x)
  if (initialSlope >= NEWTON_MIN_SLOPE) {
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const slope = cubicBezierDerivative(guessT, c1x, c2x)
      if (slope === 0) break
      guessT -= (cubicBezierComponent(guessT, c1x, c2x) - x) / slope
    }
    return guessT
  }

  if (initialSlope === 0) return guessT

  // Binary subdivision fallback
  let aT = intervalStart
  let bT = intervalStart + 1 / (SAMPLE_COUNT - 1)
  let i = 0
  do {
    const currentX = cubicBezierComponent(guessT, c1x, c2x) - x
    if (currentX > 0) bT = guessT
    else aT = guessT
    guessT = (bT + aT) / 2
  } while (Math.abs(cubicBezierComponent(guessT, c1x, c2x) - x) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS)

  return guessT
}

/**
 * Sample a CSS cubic-bezier curve at SAMPLE_COUNT points.
 * Returns normalized (time, value) pairs where time ∈ [0,1].
 */
export function sampleBezier(config: BezierConfig): CurveSample[] {
  const { c1x, c1y, c2x, c2y } = config

  // Straight line — no need for sample table
  if (c1x === c1y && c2x === c2y) {
    return [{ time: 0, value: 0 }, { time: 1, value: 1 }]
  }

  const table = buildSampleTable(c1x, c2x)
  const samples: CurveSample[] = []

  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const x = i / SAMPLE_COUNT
    const t = getTForX(x, c1x, c2x, table)
    const y = cubicBezierComponent(t, c1y, c2y)
    samples.push({ time: x, value: y })
  }

  return samples
}

/**
 * Evaluate a cubic-bezier at a single x (time) value.
 * Returns the y (progress) value.
 */
export function evaluateBezier(x: number, config: BezierConfig): number {
  const { c1x, c1y, c2x, c2y } = config
  if (c1x === c1y && c2x === c2y) return x
  if (x <= 0) return 0
  if (x >= 1) return 1
  const table = buildSampleTable(c1x, c2x)
  const t = getTForX(x, c1x, c2x, table)
  return cubicBezierComponent(t, c1y, c2y)
}
