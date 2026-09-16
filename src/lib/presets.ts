import type { EasingSlot } from '../types'

export const CURVE_COLOR = '#4ade80'   // green — deterministic, fixed duration
export const SPRING_COLOR = '#f472b6'  // pink — organic, physics-based

export const DEFAULT_SLOTS: EasingSlot[] = [
  {
    id: 'ease-out-expo',
    label: 'ease-out-expo',
    color: CURVE_COLOR,
    visible: true,
    config: {
      kind: 'bezier',
      c1x: 0.16,
      c1y: 1,
      c2x: 0.3,
      c2y: 1,
      durationMs: 500,
    },
  },
  {
    id: 'spring-default',
    label: 'spring (default)',
    color: SPRING_COLOR,
    visible: true,
    config: {
      kind: 'spring',
      stiffness: 170,
      damping: 26,
      mass: 1,
      initialVelocity: 0,
    },
  },
]

export const BEZIER_PRESETS = [
  { label: 'ease',            c1x: 0.25, c1y: 0.1,  c2x: 0.25, c2y: 1    },
  { label: 'ease-in',         c1x: 0.42, c1y: 0,    c2x: 1,    c2y: 1    },
  { label: 'ease-out',        c1x: 0,    c1y: 0,    c2x: 0.58, c2y: 1    },
  { label: 'ease-in-out',     c1x: 0.42, c1y: 0,    c2x: 0.58, c2y: 1    },
  { label: 'ease-out-expo',   c1x: 0.16, c1y: 1,    c2x: 0.3,  c2y: 1    },
  { label: 'ease-out-quart',  c1x: 0.25, c1y: 1,    c2x: 0.5,  c2y: 1    },
  { label: 'ease-in-back',    c1x: 0.6,  c1y: -0.28, c2x: 0.735, c2y: 0.045 },
  { label: 'ease-out-back',   c1x: 0.175, c1y: 0.885, c2x: 0.32, c2y: 1.275 },
  { label: 'anticipate',      c1x: 0.38, c1y: -0.4, c2x: 0.54, c2y: 1.25 },
] as const

export const SPRING_PRESETS = [
  { label: 'default',  stiffness: 170, damping: 26,  mass: 1 },
  { label: 'gentle',   stiffness: 100, damping: 26,  mass: 1 },
  { label: 'wobbly',   stiffness: 180, damping: 12,  mass: 1 },
  { label: 'stiff',    stiffness: 210, damping: 20,  mass: 1 },
  { label: 'slow',     stiffness: 280, damping: 60,  mass: 1 },
  { label: 'bouncy',   stiffness: 400, damping: 10,  mass: 1 },
] as const
