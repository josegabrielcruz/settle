// ─── Easing types ─────────────────────────────────────────────────────────────

export type EasingKind = 'bezier' | 'spring'

export interface BezierConfig {
  kind: 'bezier'
  /** Control point 1 x (0–1) */
  c1x: number
  /** Control point 1 y (unclamped, can overshoot) */
  c1y: number
  /** Control point 2 x (0–1) */
  c2x: number
  /** Control point 2 y (unclamped) */
  c2y: number
  /** Duration in milliseconds */
  durationMs: number
}

export interface SpringConfig {
  kind: 'spring'
  /** Stiffness — resistance to displacement (higher = snappier) */
  stiffness: number
  /** Damping — resistance to velocity (higher = less oscillation) */
  damping: number
  /** Mass — inertia (higher = slower, heavier feel) */
  mass: number
  /** Initial velocity */
  initialVelocity: number
}

export type EasingConfig = BezierConfig | SpringConfig

// ─── Curve sample ─────────────────────────────────────────────────────────────

/** A normalized time→value sample point. time is 0–1+, value is 0–1 (can overshoot). */
export interface CurveSample {
  /** Normalized time: 0 = start, 1 = where bezier ends or spring target reached */
  time: number
  /** Progress value: 0 = start position, 1 = end position (can exceed for springs) */
  value: number
}

// ─── Preview element ─────────────────────────────────────────────────────────

export type PreviewShape = 'card' | 'dot' | 'bar'

export interface EasingSlot {
  id: string
  label: string
  config: EasingConfig
  color: string
  visible: boolean
}
