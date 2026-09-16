import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { simulateSpring, getSpringDuration, interpolateSamples } from '../../lib/springPhysics'
import { evaluateBezier } from '../../lib/bezierMath'
import { ElementPreview } from '../ElementPreview'
import { SHAPE_OPTIONS } from '../../lib/shapes'
import type { ShapeKind } from '../../lib/shapes'
import type { EasingSlot } from '../../types'
import './PreviewPanel.css'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface PreviewPanelProps {
  slots: EasingSlot[]
}

export function PreviewPanel({ slots }: PreviewPanelProps) {
  const visible = slots.filter(s => s.visible)
  const [shape, setShape] = useState<ShapeKind>('abstract')
  const [loop, setLoop] = useState(false)

  // Pre-compute spring samples and natural durations once per config change
  const slotData = useMemo(() => visible.map(slot => {
    if (slot.config.kind === 'spring') {
      const samples = simulateSpring(slot.config)
      const durationMs = getSpringDuration(slot.config)
      return { slot, samples, durationMs }
    }
    // Bezier: use evaluateBezier directly, treat durationMs as the playback window
    return { slot, samples: null, durationMs: slot.config.durationMs }
  }), [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  const [positions, setPositions] = useState<Record<string, number>>(
    () => Object.fromEntries(visible.map(s => [s.id, 0])),
  )
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    // also cancel any pending loop timeout
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current)
    loopTimerRef.current = null
    setPlaying(false)
    startTimeRef.current = null
  }, [])

  const replay = useCallback(() => {
    stop()
    setDone(false)
    setPositions(Object.fromEntries(slotData.map(d => [d.slot.id, 0])))
    // Small delay so the elements visibly reset before animating
    setTimeout(() => setPlaying(true), 60)
  }, [stop, slotData])

  // Batch all resets in the click handler so they render in one pass — no flash
  const changeShape = useCallback((next: ShapeKind) => {    cancelAnimationFrame(rafRef.current)
    startTimeRef.current = null
    setPlaying(false)
    setDone(false)
    setPositions(Object.fromEntries(slotData.map(d => [d.slot.id, 0])))
    setShape(next)
  }, [slotData])

  // Auto-replay when loop is on; store timer in ref so stop() can cancel it
  useEffect(() => {
    if (!done || !loop) return
    loopTimerRef.current = setTimeout(replay, 600)
    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current)
    }
  }, [done, loop, replay])

  useEffect(() => {
    if (!playing) return

    // Respect prefers-reduced-motion: jump directly to final state
    if (prefersReducedMotion()) {
      setPositions(Object.fromEntries(slotData.map(d => [d.slot.id, 1])))
      setDone(true)
      return
    }

    const tick = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current

      const next: Record<string, number> = {}
      let allDone = true

      for (const { slot, samples, durationMs } of slotData) {
        const t = elapsed / durationMs // normalised time (0→1+)

        let value: number
        if (slot.config.kind === 'spring' && samples) {
          value = interpolateSamples(samples, t)
          if (t < samples[samples.length - 1].time) allDone = false
        } else if (slot.config.kind === 'bezier') {
          value = evaluateBezier(Math.min(t, 1), slot.config)
          if (t < 1) allDone = false
        } else {
          value = 0
        }

        next[slot.id] = value
      }

      setPositions(next)

      if (allDone) {
        setDone(true)
        stop()
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, slotData, stop])

  // Reset positions when slots change
  useEffect(() => {
    setPositions(Object.fromEntries(visible.map(s => [s.id, 0])))
    setDone(false)
    setPlaying(false)
  }, [slots]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span className="preview-label">Live Preview</span>
        <span className="preview-sub-label">Choose element type to animate:</span>
        <div className="shape-selector" role="group" aria-label="Preview shape">
          {SHAPE_OPTIONS.map(opt => (
            <button
              key={opt.kind}
              className={`shape-btn ${shape === opt.kind ? 'shape-btn-active' : ''}`}
              onClick={() => changeShape(opt.kind)}
              aria-pressed={shape === opt.kind}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          className={`loop-btn ${loop ? 'loop-btn-active' : ''}`}
          onClick={() => setLoop(l => !l)}
          aria-pressed={loop}
          aria-label={loop ? 'Disable loop' : 'Enable loop'}
          title="Loop"
        >
          ⟳ loop
        </button>
        <button
          className={`play-btn ${(playing || (loop && done)) ? 'play-btn-stop' : ''}`}
          onClick={() => {
            if (playing || (loop && done)) {
              // cancel any pending loop timer and show ready state
              stop()
              setDone(false)
            } else {
              replay()
            }
          }}
          aria-label={(playing || (loop && done)) ? 'Stop preview' : 'Play preview'}
        >
          {(playing || (loop && done)) ? '■ stop' : done ? '↺ replay' : '▶ play'}
        </button>
      </div>

      {shape === 'abstract' ? (
        <div className="preview-tracks">
          {slotData.map(({ slot, durationMs }) => {
            const pos = positions[slot.id] ?? 0
            const visual = Math.max(-0.15, Math.min(1.15, pos))
            return (
              <div key={slot.id} className="preview-track">
                <div className="track-meta">
                  <span className="track-dot" style={{ background: slot.color }} />
                  <span className="track-label">{slot.label}</span>
                  <span className="track-duration">
                    {slot.config.kind === 'spring' ? `~${Math.round(durationMs)}ms` : `${durationMs}ms`}
                  </span>
                </div>
                {/* --p drives the thumb position in CSS via calc against rail width */}
                <div className="track-rail" style={{ '--p': visual } as React.CSSProperties}>
                  <div
                    className="track-thumb"
                    style={{ background: slot.color, boxShadow: `0 0 12px ${slot.color}` }}
                  />
                  {slot.config.kind === 'spring' && <div className="track-target" />}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={`element-preview-grid element-preview-grid-${shape}`}>
          {slotData.map(({ slot }) => (
            <ElementPreview
              key={slot.id}
              slot={slot}
              position={positions[slot.id] ?? 0}
              shape={shape}
            />
          ))}
        </div>
      )}

      <p className="preview-note">
        Springs run until physics settles — their duration is emergent, not declared.
      </p>
    </div>
  )
}
