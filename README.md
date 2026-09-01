# System Design Studio

**A template-first system design canvas. Stop memorizing architectures — start from one.**

Most system design practice starts with a blank page and a list of components you're
supposed to have memorized. This flips that around: you drop in real components that
already carry the two or three things you'd actually be expected to *say* about them in
a design discussion, then draw, connect, scale and annotate from there.

## Why

Every component in the catalog ships with a `hint` — the talking points, not the trivia:

| Component | Hint |
| --- | --- |
| Load Balancer | L4 (fast, TCP) vs L7 (routing, TLS). Round-robin / least-conn / consistent hash + health checks. |
| Message Queue | Decouples producer/consumer, absorbs spikes. At-least-once → consumers must be idempotent. |
| Payment Service | Never retry blindly — idempotency keys. Ledger + reconciliation, webhooks from the PSP. |
| Sharded Cluster | Partition by key (hash / range / geo). Beware hot keys and resharding pain. |

You read them off the canvas instead of memorizing them.

## What's in the box

- **42 concept components** across 8 categories — Clients, Edge & Network, Compute,
  Data Stores, Caching, Messaging, Search & Analytics, Platform Services.
- **28 brand logos** (Postgres, Redis, Kafka, S3, Kubernetes, Stripe, …) so you can go
  from "a cache" to "Redis" in one click.
- **Requirement checklists** — functional and non-functional, as working to-do lists:
  add your own, tick them off, rename, delete, clear completed. Seeded from a starter
  set of chips (*p99 latency < 200ms*, *CAP → AP*, *Read-heavy (100:1)*) so you're never
  staring at an empty list.
- **Free text anywhere** — double-click bare canvas and type, right where you're
  pointing. No text box to place first.
- **A canvas document model** with nodes, edges, free text, shapes and freehand
  drawings — autosaved to `localStorage`, with undo/redo.
- **A pitch-black canvas with a radiant palette** — true `#000` ground, high-chroma
  accents that glow against it, all from a single token file shared by the SVG canvas
  and the surrounding chrome.

## Using it

The left panel has two tabs. **Components** is the searchable palette — click anything
to drop it on the canvas. **Requirements** is your design brief plus two checklists you
actually work: type a requirement and hit <kbd>+</kbd>, click any task to rename it,
tick it off, or delete it. A progress bar and a `done/total` badge track where you are.

Select anything on the canvas and the right panel shows its hint — plus an editable
label, colour, and the category it came from.

**To write anywhere, just double-click empty canvas** and start typing. <kbd>Enter</kbd>
commits, <kbd>Shift</kbd>+<kbd>Enter</kbd> adds a line, and double-clicking existing
text reopens it in place. Empty text is discarded rather than left invisible.

| Key | Tool |
| --- | --- |
| `V` | Select / move |
| `H` | Pan (or hold <kbd>Alt</kbd>, or drag empty canvas) |
| `E` | Connect — click the source component, then the target |
| `T` | Text |
| `R` / `O` | Group box / ellipse |
| `P` | Freehand pen |
| `⌘Z` / `⇧⌘Z` | Undo / redo |
| `Delete` | Delete selection |
| `Esc` | Deselect, back to the select tool |

Scroll to zoom, **Fit** to frame everything. The document autosaves to `localStorage`
on every change, and **Export JSON** / **Import** move it between machines. **SVG**
exports the canvas re-framed to its content, not to your current viewport.

## Getting started

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build to dist/
npm run preview  # serve the build on :4173
```

Requires Node 18+. React 18 and Vite 5 are the only dependencies.

## Layout

```
index.html          # mounts /src/main.jsx
src/
  main.jsx          # React root; mirrors theme tokens onto :root as CSS vars
  App.jsx           # toolbar, keyboard shortcuts, import/export, autosave
  styles.css        # shell chrome — the canvas itself is styled inline
  catalog.js        # CATEGORIES, TYPE_INDEX, FR/NFR chips — the component library
  icons.jsx         # generic concept icons (ICON map + <Icon>)
  logos.jsx         # real product logos (LOGOS map)
  theme.js          # design tokens (T) and the edge/shape PALETTE
  ui/
    LeftPanel.jsx   # tab shell: Components | Requirements
    Palette.jsx     # searchable component picker
    Requirements.jsx# design brief + the two requirement checklists
    Canvas.jsx      # the SVG canvas: pan, zoom, drag, connect, draw, write
    Inspector.jsx   # properties for the current selection
  lib/
    doc.js          # document model, localStorage persistence, useDoc() undo/redo
    geometry.js     # node/edge geometry, text wrapping, bounds, freehand smoothing
```

### A couple of the load-bearing bits

`lib/geometry.js` handles the drawing math: `edgeGeometry()` computes where a connector
meets each node's border (straight or Bézier) plus the midpoint for its label, and
`simplify()` / `strokePath()` turn raw pointer samples into a smooth freehand stroke.

`lib/doc.js` exposes `useDoc()`, which wraps the document in an undo stack. Call
`snapshot()` **once at the start of a gesture** rather than per frame, so an entire drag
collapses into a single undo step. `normalizeDoc()` tolerates older or hand-edited JSON,
which is what makes saved documents safe to load across versions.

## Known rough edges

- **No `<StrictMode>`.** `useDoc()` mutates its history refs from inside a `setState`
  updater. StrictMode double-invokes updaters in development, which would push each
  action onto the undo stack twice. Moving those ref writes out of the updater would let
  StrictMode go back on.
- **Three types are both a concept and a brand** — `redis`, `kafka` and `zookeeper`.
  `<Icon>` checks `LOGOS` before `ICON`, so the generic `G.redis` / `G.kafka` /
  `G.zookeeper` marks are unreachable and the "Cache (generic)", "Event Log" and
  "Service Discovery" items draw as brand logos. The palette collapses each pair into a
  single cell. A clean fix is to rename either side of the collision.

## License

Not yet specified.
