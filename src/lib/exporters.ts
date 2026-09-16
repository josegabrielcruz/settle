import type { EasingConfig, BezierConfig, SpringConfig } from '../types'
import { simulateSpring, getSpringDuration, interpolateSamples } from './springPhysics'

function fmt(n: number): string {
  return parseFloat(n.toFixed(3)).toString()
}

export function toCss(config: EasingConfig): string {
  if (config.kind === 'spring') {
    return '/* CSS has no spring easing — use linear() approximation or Web Animations API */'
  }
  const { c1x, c1y, c2x, c2y, durationMs } = config as BezierConfig
  return `transition: transform ${durationMs}ms cubic-bezier(${fmt(c1x)}, ${fmt(c1y)}, ${fmt(c2x)}, ${fmt(c2y)});`
}

/** Generates a CSS linear() approximation of a spring by sampling at 30 evenly-spaced points. */
export function toSpringLinearCss(config: SpringConfig): string {
  const samples = simulateSpring(config)
  const durationMs = Math.round(getSpringDuration(config))
  const N = 30
  const points = Array.from({ length: N + 1 }, (_, i) => {
    const v = interpolateSamples(samples, i / N)
    return parseFloat(v.toFixed(4))
  })
  return `/* CSS linear() spring approximation (${durationMs}ms) */\ntransition: transform ${durationMs}ms linear(${points.join(', ')});`
}

export function toFramerMotion(config: EasingConfig): string {
  if (config.kind === 'bezier') {
    const { c1x, c1y, c2x, c2y, durationMs } = config as BezierConfig
    return `transition={{ duration: ${fmt(durationMs / 1000)}, ease: [${fmt(c1x)}, ${fmt(c1y)}, ${fmt(c2x)}, ${fmt(c2y)}] }}`
  }
  const { stiffness, damping, mass, initialVelocity } = config as SpringConfig
  const lines = [`transition={{`]
  lines.push(`  type: "spring",`)
  lines.push(`  stiffness: ${stiffness},`)
  lines.push(`  damping: ${damping},`)
  lines.push(`  mass: ${mass},`)
  if (initialVelocity !== 0) lines.push(`  velocity: ${initialVelocity},`)
  lines.push(`}}`)
  return lines.join('\n')
}

export function toGsap(config: EasingConfig): string {
  if (config.kind === 'spring') {
    const { stiffness, damping, mass } = config as SpringConfig
    return `// GSAP Physics2D or use CustomEase with simulated spring\n// stiffness: ${stiffness}, damping: ${damping}, mass: ${mass}`
  }
  const { c1x, c1y, c2x, c2y, durationMs } = config as BezierConfig
  return `gsap.to(el, { duration: ${fmt(durationMs / 1000)}, ease: "cubic-bezier(${fmt(c1x)},${fmt(c1y)},${fmt(c2x)},${fmt(c2y)})" })`
}

export function toReactSpring(config: EasingConfig, label?: string): string {
  if (config.kind === 'bezier') {
    const { c1x, c1y, c2x, c2y, durationMs } = config as BezierConfig

    const EASING_MAP: Record<string, string> = {
      'ease':           'easings.easeInOut',
      'ease-in':        'easings.easeInCubic',
      'ease-out':       'easings.easeOutCubic',
      'ease-in-out':    'easings.easeInOutCubic',
      'ease-out-expo':  'easings.easeOutExpo',
      'ease-out-quart': 'easings.easeOutQuart',
      'ease-in-back':   'easings.easeInBack',
      'ease-out-back':  'easings.easeOutBack',
    }

    const namedEasing = label ? EASING_MAP[label] : undefined
    const easingLine = namedEasing
      ? `    easing: ${namedEasing},`
      : `    // No named match for cubic-bezier(${fmt(c1x)}, ${fmt(c1y)}, ${fmt(c2x)}, ${fmt(c2y)})\n    easing: (t) => t, // replace with your implementation`

    const lines = [
      `import { easings } from '@react-spring/web'`,
      ``,
      `useSpring({`,
      `  config: {`,
      `    duration: ${durationMs},`,
      easingLine,
      `  },`,
      `})`,
    ]
    return lines.join('\n')
  }
  const { stiffness, damping, mass, initialVelocity } = config as SpringConfig
  const lines = [
    `useSpring({`,
    `  config: {`,
    `    tension: ${stiffness},   // stiffness`,
    `    friction: ${damping},  // damping`,
    `    mass: ${mass},`,
  ]
  if (initialVelocity !== 0) lines.push(`    velocity: ${initialVelocity},`)
  lines.push(`    // clamp: false,  // set true to stop at target without oscillating`)
  lines.push(`  },`)
  lines.push(`})`)
  return lines.join('\n')
}
