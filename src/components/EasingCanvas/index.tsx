import { useEffect, useRef, useMemo } from 'react'
import { simulateSpring } from '../../lib/springPhysics'
import { sampleBezier } from '../../lib/bezierMath'
import type { EasingSlot, CurveSample } from '../../types'
import './EasingCanvas.css'

const PAD = 44           // canvas padding in logical pixels
const OVERSHOOT_BUFFER = 0.12  // extra y-range added around min/max

interface EasingCanvasProps {
  slots: EasingSlot[]
  width?: number
  height?: number
}

/** Convert a value in data-space to a canvas y-coordinate. */
function valueToY(value: number, yMin: number, yMax: number, pad: number, plotH: number): number {
  const norm = (value - yMin) / (yMax - yMin)
  // norm=0 → bottom of plot, norm=1 → top of plot
  return pad + plotH - norm * plotH
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pad: number,
  yMin: number,
  yMax: number,
) {
  const plotW = w - pad * 2
  const plotH = h - pad * 2

  // Faint background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  ctx.setLineDash([])
  for (let i = 0; i <= 4; i++) {
    const x = pad + (plotW * i) / 4
    ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + plotH); ctx.stroke()
    const y = pad + (plotH * i) / 4
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + plotW, y); ctx.stroke()
  }

  // Prominent reference lines at value=0 and value=1
  const y0 = valueToY(0, yMin, yMax, pad, plotH)
  const y1 = valueToY(1, yMin, yMax, pad, plotH)

  ctx.setLineDash([4, 4])
  ctx.lineWidth = 1

  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.beginPath(); ctx.moveTo(pad, y0); ctx.lineTo(pad + plotW, y0); ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.beginPath(); ctx.moveTo(pad, y1); ctx.lineTo(pad + plotW, y1); ctx.stroke()
  ctx.setLineDash([])

  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '10px IBM Plex Mono, monospace'
  ctx.textAlign = 'right'
  ctx.fillText('0', pad - 6, y0 + 4)
  ctx.fillText('1', pad - 6, y1 + 4)
  ctx.textAlign = 'center'
  ctx.fillText('0', pad, pad + plotH + 16)
  ctx.fillText('1', pad + plotW, pad + plotH + 16)

  // Show overshoot labels when the range extends beyond [0,1]
  if (yMax > 1 + 0.02) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.textAlign = 'right'
    ctx.fillText(yMax.toFixed(2), pad - 6, pad + 6)
  }
  if (yMin < -0.02) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.textAlign = 'right'
    ctx.fillText(yMin.toFixed(2), pad - 6, pad + plotH - 2)
  }
}

function drawCurve(
  ctx: CanvasRenderingContext2D,
  samples: CurveSample[],
  color: string,
  w: number,
  h: number,
  pad: number,
  maxTime: number,
  yMin: number,
  yMax: number,
) {
  const plotW = w - pad * 2
  const plotH = h - pad * 2

  if (samples.length === 0) return

  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.setLineDash([])

  ctx.beginPath()
  samples.forEach((s, i) => {
    const x = pad + (s.time / maxTime) * plotW
    const y = valueToY(s.value, yMin, yMax, pad, plotH)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.shadowBlur = 0
}

function getSamples(slot: EasingSlot): CurveSample[] {
  return slot.config.kind === 'spring' ? simulateSpring(slot.config) : sampleBezier(slot.config)
}

export function EasingCanvas({ slots, width = 420, height = 340 }: EasingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visible = slots.filter(s => s.visible)

  const allSamples = useMemo(
    () => visible.map(s => ({ slot: s, samples: getSamples(s) })),
    [visible],
  )

  const ariaLabel = visible.length
    ? `Easing curves: ${visible.map(s => s.label).join(' vs ')}`
    : 'Easing curve visualization'

  const maxTime = useMemo(() => {
    let max = 1
    for (const { samples } of allSamples) {
      const last = samples[samples.length - 1]
      if (last && last.time > max) max = last.time
    }
    return max
  }, [allSamples])

  // Compute y-axis range from actual data so overshooting curves stay visible
  const { yMin, yMax } = useMemo(() => {
    let lo = 0
    let hi = 1
    for (const { samples } of allSamples) {
      for (const s of samples) {
        if (s.value < lo) lo = s.value
        if (s.value > hi) hi = s.value
      }
    }
    const buf = (hi - lo) * OVERSHOOT_BUFFER
    return { yMin: lo - buf, yMax: hi + buf }
  }, [allSamples])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio ?? 1
    canvas.width = width * dpr
    canvas.height = height * dpr

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, width, height, PAD, yMin, yMax)

    for (const { slot, samples } of allSamples) {
      drawCurve(ctx, samples, slot.color, width, height, PAD, maxTime, yMin, yMax)
    }
  }, [allSamples, maxTime, yMin, yMax, width, height])

  return (
    <div className="easing-canvas-wrap">
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        aria-label={ariaLabel}
        role="img"
      />
    </div>
  )
}
