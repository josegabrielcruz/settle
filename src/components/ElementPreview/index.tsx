import type { EasingSlot } from '../../types'
import type { ShapeKind } from '../../lib/shapes'
import { getShapeStyle } from '../../lib/shapes'
import './ElementPreview.css'

interface ElementPreviewProps {
  slot: EasingSlot
  position: number
  shape: ShapeKind
}

function ModalElement({ color, style }: { color: string; style: React.CSSProperties }) {
  return (
    <div className="ep-modal-card" style={style}>
      <div className="ep-modal-header">
        <span className="ep-modal-dot" style={{ background: color }} />
        <span className="ep-modal-title">Confirm action</span>
      </div>
      <p className="ep-modal-body">Are you sure you want to proceed with this action?</p>
      <div className="ep-modal-actions">
        <button className="ep-btn ep-btn-ghost">Cancel</button>
        <button className="ep-btn ep-btn-primary" style={{ background: color }}>Confirm</button>
      </div>
    </div>
  )
}

function DrawerElement({ color, style }: { color: string; style: React.CSSProperties }) {
  return (
    <div className="ep-drawer-panel" style={style}>
      <div className="ep-drawer-header">
        <span className="ep-drawer-dot" style={{ background: color }} />
        <span className="ep-drawer-title">Navigation</span>
      </div>
      <div className="ep-drawer-divider" />
      <nav className="ep-drawer-nav" aria-label="Drawer navigation">
        {['Home', 'Projects', 'Settings'].map(item => (
          <div key={item} className="ep-drawer-item">{item}</div>
        ))}
      </nav>
    </div>
  )
}

function ToastElement({ color, style }: { color: string; style: React.CSSProperties }) {
  return (
    <div className="ep-toast" style={style}>
      <span className="ep-toast-icon" style={{ color }}>✓</span>
      <span className="ep-toast-text">Changes saved successfully</span>
    </div>
  )
}

export function ElementPreview({ slot, position, shape }: ElementPreviewProps) {
  const shapeStyle = getShapeStyle(shape, position)

  const elementStyle: React.CSSProperties = {
    transform: shapeStyle.transform,
    opacity: shapeStyle.opacity,
    willChange: 'transform, opacity',
  }

  return (
    <div className={`ep-wrapper ep-wrapper-${shape}`}>
      <div className="ep-label">
        <span className="ep-label-dot" style={{ background: slot.color }} />
        <span className="ep-label-text">{slot.label}</span>
      </div>
      <div className={`ep-stage ep-stage-${shape}`}>
        {shape === 'modal' && (
          <>
            <div className="ep-scrim" style={{ opacity: Math.max(0, Math.min(0.5, position * 0.5)) }} />
            <ModalElement color={slot.color} style={elementStyle} />
          </>
        )}
        {shape === 'drawer' && <DrawerElement color={slot.color} style={elementStyle} />}
        {shape === 'toast' && <ToastElement color={slot.color} style={elementStyle} />}
      </div>
    </div>
  )
}
