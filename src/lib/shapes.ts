export type ShapeKind = 'abstract' | 'modal' | 'drawer' | 'toast'

export interface ShapeStyle {
  transform: string
  opacity: number
}

/**
 * Maps a 0→1+ progress value to CSS transform + opacity for each shape.
 * Values > 1 are valid — springs overshoot their rest position naturally.
 */
export function getShapeStyle(kind: ShapeKind, position: number): ShapeStyle {
  switch (kind) {
    case 'modal':
      return {
        // modal rises from below; overshoot carries it briefly past center
        transform: `translateX(-50%) translateY(calc(-50% + ${(1 - position) * 60}px)) scale(${0.94 + position * 0.06})`,
        opacity: Math.max(0, Math.min(1, position * 1.8)),
      }
    case 'drawer':
      return {
        // drawer slides in from the left; overshoot pushes it past its rest edge
        transform: `translateX(${(1 - position) * -100}%)`,
        opacity: 1,
      }
    case 'toast':
      return {
        // toast slides down from above; overshoot drops it briefly below rest
        transform: `translateX(-50%) translateY(calc(${(1 - position) * -100}%))`,
        opacity: Math.max(0, Math.min(1, position * 3)),
      }
    default:
      return { transform: 'none', opacity: 1 }
  }
}

export const SHAPE_OPTIONS: { kind: ShapeKind; label: string }[] = [
  { kind: 'abstract', label: 'Abstract' },
  { kind: 'modal',    label: 'Modal' },
  { kind: 'drawer',   label: 'Drawer' },
  { kind: 'toast',    label: 'Toast' },
]
