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
- **Requirement chips** — a starter set of functional (`FR_CHIPS`) and non-functional
  (`NFR_CHIPS`) requirements: *p99 latency < 200ms*, *CAP → AP*, *Read-heavy (100:1)*.
- **A canvas document model** with nodes, edges, free text, shapes, freehand drawings
  and sticky notes — autosaved to `localStorage`, with undo/redo.
- **GitHub-dark theming** from a single token file, shared by the SVG canvas and the
  surrounding chrome.

## Status

⚠️ **Work in progress.** The catalog, icon/logo sets, theme and canvas primitives are in
place; the React entry point (`src/main.jsx`) and the canvas UI that composes them are
not in this repo yet, so `npm run dev` will not render an app as it currently stands.

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
  catalog.js        # CATEGORIES, TYPE_INDEX, FR/NFR chips — the component library
  icons.jsx         # generic concept icons (ICON map + <Icon>)
  logos.jsx         # real product logos (LOGOS map)
  theme.js          # design tokens (T) and the edge/shape PALETTE
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

## License

Not yet specified.
