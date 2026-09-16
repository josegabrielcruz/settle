import type { BezierConfig } from '../../types'
import { BEZIER_PRESETS } from '../../lib/presets'
import './BezierEditor.css'

interface BezierEditorProps {
  config: BezierConfig
  color: string
  onChange: (config: BezierConfig, label?: string) => void
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
      <span className="slider-value">{value.toFixed(2)}</span>
    </label>
  )
}

export function BezierEditor({ config, color, onChange }: BezierEditorProps) {
  const update = (partial: Partial<BezierConfig>) =>
    onChange({ ...config, ...partial })

  return (
    <div className="bezier-editor">
      <div className="editor-header">
        <span className="editor-dot" style={{ background: color }} />
        <span className="editor-kind">cubic-bezier</span>
      </div>

      <div className="editor-presets">
        {BEZIER_PRESETS.map(p => (
          <button
            key={p.label}
            className="preset-btn"
            onClick={() => onChange({ ...config, c1x: p.c1x, c1y: p.c1y, c2x: p.c2x, c2y: p.c2y }, p.label)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="sliders">
        <Slider label="c1x" value={config.c1x} min={0} max={1}    step={0.01} onChange={v => update({ c1x: v })} />
        <Slider label="c1y" value={config.c1y} min={-2} max={2}   step={0.01} onChange={v => update({ c1y: v })} />
        <Slider label="c2x" value={config.c2x} min={0} max={1}    step={0.01} onChange={v => update({ c2x: v })} />
        <Slider label="c2y" value={config.c2y} min={-2} max={2}   step={0.01} onChange={v => update({ c2y: v })} />
        <Slider label="ms"  value={config.durationMs} min={100} max={2000} step={10} onChange={v => update({ durationMs: v })} />
      </div>
    </div>
  )
}
