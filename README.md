# Settle

**An easing workbench for frontend engineers.**

Visualize spring physics and cubic-bezier curves side-by-side, preview them on real UI patterns, and export to CSS, Framer Motion, GSAP, or React Spring — one config, four formats.

**[Live →](https://josegabrielcruz.github.io/settle/)**

---

## The problem this solves

Every easing tool shows you a dot on a track or a theoretical curve on a graph. None of them let you see how your spring configuration *feels* on a modal appearing, a sidebar sliding in, or a toast notification arriving.

Settle puts spring physics and cubic-bezier on the same canvas with a shared time axis, so you can directly compare their timing behavior — and then apply both to realistic UI element previews simultaneously. Hit play, watch the bezier version stop dead while the spring version settles, and immediately understand why physics-based motion feels different from curve-based motion.

---

## Features

- **Spring physics simulation** — home-rolled semi-implicit Euler integration; no library dependency for the math
- **Cubic-bezier evaluation** — Newton-Raphson solver, same algorithm Chrome's easing engine uses
- **Shared canvas** — both curves on one graph with a dynamic Y-axis that scales to show overshoot
- **Contextual element previews** — Abstract (dot tracks), Modal, Drawer, Toast; all four animate from the same playback clock
- **Cross-library export** — CSS `transition`, Framer Motion `transition={{}}`, GSAP `.to()`, React Spring `useSpring` — correct parameter mapping for each
- **Named preset banks** — bezier presets (`ease-out-expo`, `ease-out-back`, `anticipate`, etc.) and spring presets (`default`, `wobbly`, `bouncy`, `stiff`, etc.)
- **Labels sync on preset select** — legend, export tabs, and export code all update to the selected preset name
- **Responsive layout** — stacks to single column below 900px
- **Accessibility** — `prefers-reduced-motion` respected (preview jumps to final state), `aria-live` on spring duration display, dynamic canvas `aria-label`

---

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## How to use

1. **Adjust the bezier curve** — drag the sliders or click a preset in the left panel
2. **Adjust the spring** — use the stiffness, damping, mass, and initial velocity sliders; watch the natural duration update live
3. **Compare on the canvas** — green = bezier (fixed duration), pink = spring (physics-based, variable duration)
4. **Play the preview** — click ▶ play to see both animate simultaneously; switch preview shapes to see how each easing feels on a Modal, Drawer, or Toast
5. **Copy the export** — click a format tab (CSS, Framer Motion, GSAP, React Spring) and copy the generated code

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- Zero runtime animation libraries — spring simulation and bezier evaluation are hand-rolled
- No UI component library — all styles use CSS custom properties from `src/styles/tokens.css`

---

## Project structure

```
src/
├── lib/
│   ├── springPhysics.ts   # Semi-implicit Euler spring simulation
│   ├── bezierMath.ts      # CSS cubic-bezier solver (Newton-Raphson)
│   ├── presets.ts         # Preset banks + default slot configs
│   ├── exporters.ts       # Code generation for 4 libraries
│   └── shapes.ts          # UI element interpolators (modal, drawer, toast)
├── components/
│   ├── EasingCanvas/      # Canvas 2D renderer — curves with dynamic Y-axis
│   ├── BezierEditor/      # c1x/c1y/c2x/c2y sliders + duration + presets
│   ├── SpringEditor/      # stiffness/damping/mass/velocity sliders + presets
│   ├── PreviewPanel/      # Playback engine + shape selector (abstract/element)
│   ├── ElementPreview/    # Renders modal, drawer, toast driven by position value
│   └── ExportPanel/       # 4-format code export with copy buttons
├── styles/
│   └── tokens.css         # Design token system (colors, spacing, typography, motion)
└── types.ts               # EasingConfig, CurveSample, EasingSlot
```

---

## Design decisions

**Why hand-roll the physics?**
Using Framer Motion or React Spring to simulate springs for a tool that teaches spring physics would be circular. The simulation runs in `lib/springPhysics.ts` as pure math — semi-implicit Euler integration at ~120Hz, auto-detecting settle point, normalizing the time axis so springs and beziers share a visual frame of reference.

**Why a dynamic Y-axis on the canvas?**
Cubic-bezier presets like `ease-out-back` and `anticipate` produce values outside [0,1]. Clipping them at the canvas boundary hides the overshoot, which is exactly the information most worth showing. The canvas scans sample data for min/max on every config change and scales accordingly.

**Why `transform` and `opacity` only for element previews?**
Animating `left`, `top`, or `translateX(%)`-based positioning that recalculates layout on every RAF frame is expensive. All element position interpolation uses `transform: translateX/Y` with inline `calc()`, keeping all animation on the compositor thread.

---

## License

MIT — use it, fork it, learn from it.

---

## Tagline

*The easing tool that finally explains springs.*
