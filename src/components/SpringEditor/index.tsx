import type { SpringConfig } from '../../types'
import { SPRING_PRESETS } from '../../lib/presets'
import { getSpringDuration } from '../../lib/springPhysics'
import { getSpringCharacter } from '../../lib/springCharacter'
import './SpringEditor.css'

interface SpringEditorProps {
  config: SpringConfig
  color: string
  onChange: (config: SpringConfig, label?: string) => void
}

function Slider({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="slider-row">
      <span className="slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
      <span className="slider-value">{value}</span>
    </label>
  )
}

export function SpringEditor({ config, color, onChange }: SpringEditorProps) {
  const update = (partial: Partial<SpringConfig>) =>
    onChange({ ...config, ...partial })

  const durationMs = Math.round(getSpringDuration(config))
  const character = getSpringCharacter(config)

  return (
    <div className="spring-editor">
      <div className="editor-header">
        <span className="editor-dot" style={{ background: color }} />
        <span className="editor-kind">spring physics</span>
        <span className="spring-duration" aria-live="polite" aria-atomic="true">~{durationMs}ms natural</span>
      </div>

      <div className="editor-presets">
        {SPRING_PRESETS.map(p => (
          <button
            key={p.label}
            className="preset-btn"
            onClick={() => onChange({ ...config, stiffness: p.stiffness, damping: p.damping, mass: p.mass }, `spring: ${p.label}`)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="sliders">
        <Slider label="stiffness"        value={config.stiffness}       min={10}  max={500} step={5}   onChange={v => update({ stiffness: v })} />
        <Slider label="damping"          value={config.damping}         min={1}   max={100} step={1}   onChange={v => update({ damping: v })} />
        <Slider label="mass"             value={config.mass}            min={0.1} max={10}  step={0.1} onChange={v => update({ mass: v })} />
        <Slider label="initial velocity" value={config.initialVelocity} min={-20} max={20}  step={1}   onChange={v => update({ initialVelocity: v })} />
      </div>

      <div className={`spring-character ${character.isWarning ? 'spring-character-warn' : ''}`} aria-live="polite">
        <span className="spring-character-label">{character.label}</span>
        <span className="spring-character-note">{character.note}</span>
      </div>

      <p className="spring-explainer">
        Springs don't have a fixed duration — they run until the physics settles.
        Higher damping = less oscillation. Lower mass = more responsive.
      </p>
    </div>
  )
}
