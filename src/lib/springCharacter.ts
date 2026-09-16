import type { SpringConfig } from '../types'

export interface SpringCharacter {
  label: string
  note: string
  isWarning: boolean
}

/**
 * Classifies a spring config by its damping ratio ζ = d / (2√(k·m)).
 * ζ < 1 = underdamped (oscillates), ζ = 1 = critically damped, ζ > 1 = overdamped.
 */
export function getSpringCharacter(config: SpringConfig): SpringCharacter {
  const { stiffness, damping, mass } = config
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))

  if (zeta < 0.25) {
    return {
      label: 'Floaty, oscillating',
      note: 'too underdamped for most UI — increase damping',
      isWarning: true,
    }
  }
  if (zeta < 0.6 && stiffness > 150) {
    return {
      label: 'Energetic, bouncy',
      note: 'reactions, badge pops, playful microinteractions',
      isWarning: false,
    }
  }
  if (zeta < 0.6) {
    return {
      label: 'Lively, springy',
      note: 'tooltips, popovers, chip animations',
      isWarning: false,
    }
  }
  if (zeta < 1.1 && stiffness > 200) {
    return {
      label: 'Crisp, snappy',
      note: 'buttons, toggles, quick selections',
      isWarning: false,
    }
  }
  if (zeta < 1.1) {
    return {
      label: 'Responsive, natural',
      note: 'modals, drawers, standard reveals',
      isWarning: false,
    }
  }
  if (stiffness < 80) {
    return {
      label: 'Heavy, deliberate',
      note: 'large panels, full-page transitions',
      isWarning: false,
    }
  }
  return {
    label: 'Smooth, gentle',
    note: 'content reveals, non-urgent transitions',
    isWarning: false,
  }
}
