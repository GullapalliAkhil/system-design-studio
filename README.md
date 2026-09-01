# System Design Studio

**A template-first system design canvas. Stop memorizing architectures — start from one.**

**▶ [Try it live](https://gullapalliakhil.github.io/system-design-studio/)**

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

- **38 concept components** across 8 categories — Clients, Edge & Network, Compute,
  Data Stores, Caching, Messaging, Search & Analytics, Platform Services.
- **27 brand logos** (Postgres, Redis, Kafka, S3, Kubernetes, Stripe, …) so you can go
  from "a cache" to "Redis" in one click. 65 entries in all, every one distinct — no
  type or display name appears twice.
- **Requirement checklists** — functional and non-functional, in a drawer on the right.
  Everything in them is yours: type it, press Enter, tick it off, rename it, delete it.
  No seeded placeholder text.
- **Free text anywhere** — double-click bare canvas and type, right where you're
  pointing. No text box to place first.
- **Directed and undirected connections** — one arrowhead for flow, a head at both ends
  for two-way relationships, switchable per edge or as the default for new ones. Any
  boxed thing can be an endpoint: components, group boxes and ellipses alike.
- **A canvas document model** with nodes, edges, free text, shapes and freehand
  drawings — autosaved to `localStorage`, with undo/redo.
- **A pitch-black canvas with a radiant palette** — true `#000` ground, no grid, and
  high-chroma accents that glow against it, all from a single token file shared by the
  SVG canvas and the surrounding chrome. Set in Space Grotesk with JetBrains Mono for
  numerals, both self-hosted so it looks right offline.

## Using it

The left panel is the searchable component palette — click anything to drop it on the
canvas. The right panel is your design brief and, when something is selected, its
properties: label, colour, and the hint for what to say about it.

**Requirements** sits at the bottom of the right panel as a collapsed drawer. Open it
and you get two checklists — functional and non-functional. Type a requirement, press
<kbd>Enter</kbd>, and it's added. Click any task to rename it, tick the box to mark it
done, hit <kbd>×</kbd> to remove it. Nothing is pre-filled.

**To write anywhere, just double-click empty canvas** and start typing. <kbd>Enter</kbd>
commits, <kbd>Shift</kbd>+<kbd>Enter</kbd> adds a line, and double-clicking existing
text reopens it in place. Empty text is discarded rather than left invisible.

**Connections go both ways.** Press <kbd>E</kbd>, click a source then a target.
Directed links carry a single arrowhead; undirected ones carry a head at both ends. The
**Arrow** toggle in the toolbar sets the default for new links, and any edge can be
switched from the inspector. Group boxes and ellipses connect too — click their border,
which is also how you select and drag them, so the interior stays free for whatever you
draw inside.

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
on every change, so it's still there when you come back.

## Getting started

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build to dist/
npm run preview  # serve the build on :4173
```

Requires Node 18+. React 18, Vite 5, and two self-hosted Fontsource families are the
only dependencies — nothing is fetched at runtime.

## Deploying

Pushing to `main` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Nothing to run by hand.

`vite.config.js` sets `base: "./"`, so every asset URL is relative and the same build
works under `/<repo>/` on Pages, on a custom domain, and straight from `file://`.

There is no backend. A design autosaves to `localStorage`, which means it is per-browser
and per-device: your work survives a refresh, but it does not follow you to another
machine and nothing is shared between visitors.

## Layout

```
index.html          # mounts /src/main.jsx
src/
  main.jsx          # React root; mirrors theme tokens onto :root as CSS vars
  App.jsx           # toolbar, keyboard shortcuts, autosave
  styles.css        # shell chrome — the canvas itself is styled inline
  catalog.js        # CATEGORIES, TYPE_INDEX, FR/NFR chips — the component library
  icons.jsx         # generic concept icons (ICON map + <Icon>)
  logos.jsx         # real product logos (LOGOS map)
  theme.js          # design tokens (T) and the edge/shape PALETTE
  ui/
    Palette.jsx     # searchable component picker (left)
    Canvas.jsx      # the SVG canvas: pan, zoom, drag, connect, draw, write
    Inspector.jsx   # right panel: selection properties + the brief
    Requirements.jsx# collapsible FR/NFR checklists, inside the right panel
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
- **Three generic icons are unreachable.** `ICON.redis`, `ICON.kafka` and
  `ICON.zookeeper` are shadowed by the brand logos of the same key, because `<Icon>`
  checks `LOGOS` first. The catalog no longer references them, so they are dead weight
  in `icons.jsx` rather than a visible bug.

## License

Not yet specified.
