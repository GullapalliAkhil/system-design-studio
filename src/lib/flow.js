import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "./geometry.js";

/** Milliseconds a request spends crossing one connection at 1x. */
export const HOP_MS = 950;

/**
 * Order the connections into the path a request takes through the design.
 *
 * Breadth-first from an entry point, so the walkthrough follows the request
 * outward the way it actually travels: client first, then whatever that reaches,
 * then the tier behind it. Each connection is walked once.
 *
 * Undirected links are traversable both ways; directed ones only forward.
 * Returns [{ edgeId, from, to }] where from/to are the direction of travel,
 * which is not always the direction the edge was drawn.
 */
export function buildFlow(doc) {
  const boxes = [...doc.nodes, ...doc.shapes];
  const byId = new Map(boxes.map((b) => [b.id, b]));
  const edges = doc.edges.filter((e) => byId.has(e.from) && byId.has(e.to));
  if (!edges.length) return [];

  const out = new Map();
  const link = (a, b, edge) => {
    if (!out.has(a)) out.set(a, []);
    out.get(a).push({ to: b, edge });
  };
  for (const e of edges) {
    link(e.from, e.to, e);
    if (e.directed === false) link(e.to, e.from, e);
  }

  // An entry point is something nothing else points at — the client edge of the
  // system. Fall back to the first drawn edge when everything is in a cycle.
  const targeted = new Set(edges.map((e) => e.to));
  const start =
    boxes.find((b) => !targeted.has(b.id) && out.has(b.id))?.id ?? edges[0].from;

  const walked = new Set();
  const hops = [];
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    for (const { to, edge } of out.get(cur) || []) {
      if (walked.has(edge.id)) continue;
      walked.add(edge.id);
      hops.push({ edgeId: edge.id, from: cur, to });
      queue.push(to);
    }
  }

  // Anything in a disconnected cluster still deserves a turn, appended in
  // drawing order so nothing silently disappears from the walkthrough.
  for (const e of edges) {
    if (walked.has(e.id)) continue;
    walked.add(e.id);
    hops.push({ edgeId: e.id, from: e.from, to: e.to });
  }
  return hops;
}

/**
 * Transport for the walkthrough.
 *
 * One float `pos` in [0, hops.length] is the whole clock: its integer part is
 * the current hop, its fraction is how far along that hop the request is. That
 * keeps stepping, scrubbing and playback from needing to agree about two
 * separate pieces of state.
 */
export function useFlow(hops, active) {
  const total = hops.length;
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Mirrors `pos` so the animation frame can advance without reading state.
  const posRef = useRef(0);
  const raf = useRef(0);
  const last = useRef(null);

  const seek = useCallback((v) => {
    posRef.current = v;
    setPos(v);
  }, []);

  // A new diagram (or leaving flow mode) rewinds to the start.
  useEffect(() => {
    seek(0);
    setPlaying(false);
  }, [hops, active, seek]);

  useEffect(() => {
    if (!active || !playing || !total) return;
    // Seeded from the first frame rather than performance.now(): rAF reports the
    // frame's start time, which can sit just behind a clock read taken here, and
    // that negative first delta used to walk `pos` off the front of the run.
    last.current = null;
    const tick = (now) => {
      const dt = last.current === null ? 0 : now - last.current;
      last.current = now;
      const next = clamp(posRef.current + (dt / HOP_MS) * speed, 0, total);
      seek(next);
      if (next >= total) {
        setPlaying(false);
        return; // reached the end; stop scheduling
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, playing, speed, total, seek]);

  const done = total > 0 && pos >= total;
  // Always a real hop while there is anything to walk — every consumer reads
  // hops[index] directly, so this is the invariant that keeps them safe.
  const index = total ? clamp(Math.floor(pos), 0, total - 1) : 0;
  const progress = done ? 1 : pos - Math.floor(pos);

  const play = useCallback(() => {
    if (!total) return;
    // Pressing play at the end replays from the top.
    if (posRef.current >= total) seek(0);
    setPlaying(true);
  }, [total, seek]);

  return {
    hops,
    total,
    index,
    progress,
    playing,
    done,
    speed,
    setSpeed,
    play,
    pause: useCallback(() => setPlaying(false), []),
    toggle: useCallback(() => (playing ? setPlaying(false) : play()), [playing, play]),
    next: useCallback(() => {
      setPlaying(false);
      seek(Math.min(Math.floor(posRef.current) + 1, total));
    }, [total, seek]),
    prev: useCallback(() => {
      setPlaying(false);
      const from = posRef.current >= total ? total : Math.floor(posRef.current);
      seek(Math.max(from - 1, 0));
    }, [total, seek]),
    restart: useCallback(() => {
      setPlaying(false);
      seek(0);
    }, [seek]),
  };
}
