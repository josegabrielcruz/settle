import type { EasingSlot } from '../../types'
import { toCss, toSpringLinearCss, toFramerMotion, toGsap, toReactSpring } from '../../lib/exporters'
import './ExportPanel.css'

interface ExportPanelProps {
  slot: EasingSlot
}

function CopyBlock({ label, code }: { label: string; code: string }) {
  const copy = () => navigator.clipboard?.writeText(code)
  return (
    <div className="copy-block">
      <div className="copy-header">
        <span className="copy-label">{label}</span>
        <button className="copy-btn" onClick={copy} aria-label={`Copy ${label} code`}>
          copy
        </button>
      </div>
      <pre className="copy-code"><code>{code}</code></pre>
    </div>
  )
}

export function ExportPanel({ slot }: ExportPanelProps) {
  const isSpring = slot.config.kind === 'spring'
  return (
    <div className="export-panel">
      <h3 className="export-title">Export — {slot.label}</h3>
      <CopyBlock label="CSS"           code={toCss(slot.config)} />
      {isSpring && (
        <CopyBlock label="CSS linear()" code={toSpringLinearCss(slot.config as import('../../types').SpringConfig)} />
      )}
      <CopyBlock label="Framer Motion" code={toFramerMotion(slot.config)} />
      <CopyBlock label="GSAP"          code={toGsap(slot.config)} />
      <CopyBlock label="React Spring"  code={toReactSpring(slot.config, slot.label)} />
    </div>
  )
}
