import { DEFAULT_SLOTS } from './presets'
import type { EasingSlot } from '../types'

export function encodeSlots(slots: EasingSlot[]): string {
  const params = new URLSearchParams()
  const bezierSlot = slots.find(s => s.config.kind === 'bezier')
  const springSlot = slots.find(s => s.config.kind === 'spring')

  if (bezierSlot?.config.kind === 'bezier') {
    const c = bezierSlot.config
    params.set('b', [c.c1x, c.c1y, c.c2x, c.c2y, c.durationMs].join(','))
  }
  if (springSlot?.config.kind === 'spring') {
    const c = springSlot.config
    params.set('s', [c.stiffness, c.damping, c.mass, c.initialVelocity].join(','))
  }

  return params.toString()
}

export function decodeSlots(): EasingSlot[] | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const bParam = params.get('b')
    const sParam = params.get('s')

    if (!bParam && !sParam) return null

    const slots = DEFAULT_SLOTS.map(s => ({ ...s }))

    if (bParam) {
      const parts = bParam.split(',').map(Number)
      const [c1x, c1y, c2x, c2y, durationMs] = parts
      if (parts.length === 5 && parts.every(n => !isNaN(n))) {
        const idx = slots.findIndex(s => s.config.kind === 'bezier')
        if (idx >= 0) {
          slots[idx] = { ...slots[idx], config: { kind: 'bezier', c1x, c1y, c2x, c2y, durationMs } }
        }
      }
    }

    if (sParam) {
      const parts = sParam.split(',').map(Number)
      const [stiffness, damping, mass, initialVelocity] = parts
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        const idx = slots.findIndex(s => s.config.kind === 'spring')
        if (idx >= 0) {
          slots[idx] = { ...slots[idx], config: { kind: 'spring', stiffness, damping, mass, initialVelocity } }
        }
      }
    }

    return slots
  } catch {
    return null
  }
}
