import { useState, useEffect, useRef } from 'react'
import { EasingCanvas } from './components/EasingCanvas'
import { BezierEditor } from './components/BezierEditor'
import { SpringEditor } from './components/SpringEditor'
import { ExportPanel } from './components/ExportPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { DEFAULT_SLOTS } from './lib/presets'
import { encodeSlots, decodeSlots } from './lib/urlState'
import type { EasingSlot, BezierConfig, SpringConfig } from './types'
import './App.css'

export default function App() {
  // Restore config from URL on first load
  const [slots, setSlots] = useState<EasingSlot[]>(() => decodeSlots() ?? DEFAULT_SLOTS)
  const [activeExport, setActiveExport] = useState<string>(DEFAULT_SLOTS[0].id)
  const urlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced URL sync — doesn't push history entries, just updates the address bar
  useEffect(() => {
    if (urlTimerRef.current) clearTimeout(urlTimerRef.current)
    urlTimerRef.current = setTimeout(() => {
      const qs = encodeSlots(slots)
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 400)
    return () => { if (urlTimerRef.current) clearTimeout(urlTimerRef.current) }
  }, [slots])

  const updateSlot = (id: string, config: BezierConfig | SpringConfig, label?: string) => {
    setSlots(prev => prev.map(s =>
      s.id === id ? { ...s, config, ...(label !== undefined ? { label } : {}) } : s
    ))
  }

  const bezierSlot = slots.find(s => s.config.kind === 'bezier')!
  const springSlot = slots.find(s => s.config.kind === 'spring')!
  const exportSlot = slots.find(s => s.id === activeExport) ?? slots[0]

  return (
    <div className="app">
      <header className="app-header">
        <div className="wordmark">
          <span className="wordmark-name">Settle</span>
          <span className="wordmark-tagline">The easing tool workbench</span>
        </div>
      </header>

      <main className="app-main">
        {/* ── Left: editors ────────────────────────────────── */}
        <aside className="panel panel-left">
          <BezierEditor
            config={bezierSlot.config as BezierConfig}
            color={bezierSlot.color}
            onChange={(cfg, label) => updateSlot(bezierSlot.id, cfg, label)}
          />

          <div className="panel-divider" />

          <SpringEditor
            config={springSlot.config as SpringConfig}
            color={springSlot.color}
            onChange={(cfg, label) => updateSlot(springSlot.id, cfg, label)}
          />
        </aside>

        {/* ── Center: canvas + preview ─────────────────────── */}
        <section className="canvas-section">
          <EasingCanvas slots={slots} width={420} height={360} />

          <div className="legend">
            {slots.map(s => (
              <div key={s.id} className="legend-item">
                <span className="legend-dot" style={{ background: s.color }} />
                <span className="legend-label">{s.label}</span>
                <span className="legend-kind">
                  {s.config.kind === 'spring' ? 'physics' : 'curve'}
                </span>
              </div>
            ))}
          </div>

          <PreviewPanel slots={slots} />
        </section>

        {/* ── Right: export ────────────────────────────────── */}
        <aside className="panel panel-right">
          <div className="export-tabs">
            {slots.map(s => (
              <button
                key={s.id}
                className={`export-tab ${s.id === activeExport ? 'export-tab-active' : ''}`}
                style={s.id === activeExport ? { borderColor: s.color, color: s.color } : {}}
                onClick={() => setActiveExport(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <ExportPanel slot={exportSlot} />
        </aside>
      </main>
    </div>
  )
}
