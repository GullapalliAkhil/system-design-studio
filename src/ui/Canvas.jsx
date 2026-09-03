import { useEffect, useRef, useState } from "react";
import { Icon } from "../icons.jsx";
import { TYPE_INDEX } from "../catalog.js";
import { T, PALETTE } from "../theme.js";
import {
  clamp,
  containsBox,
  edgeGeometry,
  pointOnEdge,
  pointsBounds,
  simplify,
  snapTo,
  strokePath,
  uid,
  wrapText,
} from "../lib/geometry.js";

const MIN_K = 0.15;
const MAX_K = 4;

/* How far the parts of the diagram the request has not reached fall back
   during a run. Low enough to read as background, high enough to still see
   the shape of what is coming. */
const DIM = 0.2;

/* One marker per palette colour — SVG markers can't inherit `stroke`. */
const MARKERS = PALETTE.map((c, i) => ({ id: `arw${i}`, color: c }));
const markerFor = (color) => (MARKERS.find((m) => m.color === color) || MARKERS[0]).id;

export default function Canvas({
  svgRef,
  doc,
  update,
  snapshot,
  view,
  setView,
  tool,
  setTool,
  sel,
  setSel,
  snap,
  curved,
  directed,
  flow,
}) {
  const drag = useRef(null);
  const inputRef = useRef(null);
  const hasFocus = useRef(false);
  const [draft, setDraft] = useState(null);
  const [pending, setPending] = useState(null); // node id awaiting an edge target
  const [editing, setEditing] = useState(null); // text id currently being typed into

  useEffect(() => {
    if (tool !== "edge") setPending(null);
  }, [tool]);

  /* Focus on the next frame, not synchronously. The editor is created on the
     second pointerdown, and the mouseup/click still to come in that same
     gesture would otherwise move focus straight back off it. */
  useEffect(() => {
    hasFocus.current = false;
    if (!editing) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [editing]);

  /* Native listener so preventDefault() is honoured (React's onWheel is passive). */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      setView((v) => {
        const k = clamp(v.k * Math.exp(-e.deltaY * 0.0015), MIN_K, MAX_K);
        const s = k / v.k;
        return { k, x: mx - (mx - v.x) * s, y: my - (my - v.y) * s };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [svgRef, setView]);

  const toWorld = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left - view.x) / view.k,
      y: (e.clientY - r.top - view.y) / view.k,
    };
  };

  /* ── Free text ───────────────────────────────────── */
  /* Text goes wherever you want it: the text tool, or a double-click on bare
     canvas. Either way it lands empty and immediately in edit mode. */
  function createTextAt(p) {
    const item = {
      id: uid("t"),
      x: snapTo(p.x, snap),
      y: snapTo(p.y, snap),
      text: "",
      size: 16,
      color: T.text,
    };
    update((d) => ({ texts: [...d.texts, item] }));
    setSel({ kind: "text", id: item.id });
    setEditing(item.id);
    setTool("select");
  }

  /* Recognise the double-click from consecutive pointerdowns instead of using
     the browser's dblclick. setPointerCapture() retargets the compatibility
     mouse events, so which element receives dblclick varies by engine — and on
     the capture path it never reaches the canvas at all. Two pointerdowns close
     in time and space is the same gesture, measured somewhere reliable. */
  const lastDown = useRef({ t: 0, x: 0, y: 0 });

  function isDoubleClick(e) {
    const prev = lastDown.current;
    const quick = e.timeStamp - prev.t < 400 && Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 6;
    // Zero the clock on a hit so a third click doesn't read as another pair.
    lastDown.current = { t: quick ? 0 : e.timeStamp, x: e.clientX, y: e.clientY };
    return quick;
  }

  function stopEditing() {
    // A blur before the editor ever held focus is the tail of the gesture that
    // opened it, not the user leaving. Don't let that close and discard it.
    if (!hasFocus.current) return;
    const t = doc.texts.find((x) => x.id === editing);
    // An empty label renders as nothing and could never be clicked again.
    if (t && !t.text.trim()) {
      update((d) => ({ texts: d.texts.filter((x) => x.id !== t.id) }), false);
      setSel(null);
    }
    setEditing(null);
  }

  /* ── Background gestures ─────────────────────────── */
  function onBackgroundDown(e) {
    if (editing) return; // let the open editor commit via its own blur

    if (tool === "select" && e.button === 0 && !e.altKey && isDoubleClick(e)) {
      createTextAt(toWorld(e));
      return;
    }

    if (e.button === 1 || tool === "pan" || e.altKey) {
      drag.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    } else if (tool === "select") {
      setSel(null);
      setPending(null);
      drag.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    } else if (tool === "rect" || tool === "ellipse") {
      const p = toWorld(e);
      drag.current = { kind: "shape", ox: p.x, oy: p.y };
      setDraft({ kind: tool, x: p.x, y: p.y, w: 0, h: 0, color: T.textMuted });
    } else if (tool === "pen") {
      const p = toWorld(e);
      drag.current = { kind: "pen" };
      setDraft({ kind: "pen", points: [[p.x, p.y]], color: T.accent, width: 2 });
    } else if (tool === "text") {
      createTextAt(toWorld(e));
      return;
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  /* Anything with a box can be an endpoint, so group boxes and ellipses
     connect exactly like components do. */
  function tryConnect(id) {
    if (!pending) {
      setPending(id);
      return;
    }
    if (pending === id) return;
    const edge = {
      id: uid("e"),
      from: pending,
      to: id,
      label: "",
      color: T.textMuted,
      dashed: false,
      directed,
    };
    update((d) => ({ edges: [...d.edges, edge] }));
    setPending(null);
    setSel({ kind: "edge", id: edge.id });
  }

  function onNodeDown(e, node) {
    e.stopPropagation();
    if (tool === "edge") {
      tryConnect(node.id);
      return;
    }
    if (tool !== "select") return;
    setSel({ kind: "node", id: node.id });
    const p = toWorld(e);
    snapshot();
    drag.current = { kind: "node", id: node.id, dx: p.x - node.x, dy: p.y - node.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  /* Everything a group box carries, keyed by id for cheap lookup during the
     drag. Captured once on pointer-down so the set cannot change mid-gesture —
     items are never picked up or dropped as the box sweeps across them. */
  function contentsOf(box) {
    const holds = containsBox(box);
    const at = (list) => Object.fromEntries(list.map((it) => [it.id, { x: it.x, y: it.y }]));
    return {
      nodes: at(doc.nodes.filter((n) => holds(n.x, n.y, n.w, n.h))),
      // A box never carries itself, and nested boxes come along whole.
      shapes: at(doc.shapes.filter((s) => s.id !== box.id && holds(s.x, s.y, s.w, s.h))),
      // Text hangs off its baseline anchor, so that point is the honest test.
      texts: at(doc.texts.filter((t) => holds(t.x, t.y))),
      drawings: Object.fromEntries(
        doc.drawings
          .filter((d) => {
            const b = pointsBounds(d.points);
            return b && holds(b.x, b.y, b.w, b.h);
          })
          .map((d) => [d.id, d.points])
      ),
    };
  }

  function onItemDown(e, kind, item) {
    e.stopPropagation();
    if (tool === "edge") {
      if (kind === "shape") tryConnect(item.id);
      return;
    }
    if (tool !== "select") return;
    if (kind === "text" && isDoubleClick(e)) {
      setSel({ kind, id: item.id });
      setEditing(item.id);
      return;
    }
    setSel({ kind, id: item.id });
    const p = toWorld(e);
    snapshot();
    drag.current = {
      kind: "item",
      listKey: `${kind}s`,
      id: item.id,
      dx: p.x - item.x,
      dy: p.y - item.y,
      // Where the box started, so contents can be offset from their own
      // originals rather than accumulating rounding each pointer event.
      ox: item.x,
      oy: item.y,
      held: kind === "shape" ? contentsOf(item) : null,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onMove(e) {
    const d = drag.current;
    if (!d) return;

    if (d.kind === "pan") {
      setView((v) => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
      return;
    }
    const p = toWorld(e);

    if (d.kind === "node") {
      const x = snapTo(p.x - d.dx, snap);
      const y = snapTo(p.y - d.dy, snap);
      // commit=false: the undo point was taken once on pointer-down.
      update((doc) => ({ nodes: doc.nodes.map((n) => (n.id === d.id ? { ...n, x, y } : n)) }), false);
    } else if (d.kind === "item") {
      const x = snapTo(p.x - d.dx, snap);
      const y = snapTo(p.y - d.dy, snap);
      if (!d.held) {
        update(
          (doc) => ({ [d.listKey]: doc[d.listKey].map((it) => (it.id === d.id ? { ...it, x, y } : it)) }),
          false
        );
      } else {
        /* A group box drags its contents with it. They follow the distance the
           box actually travelled — measured after snapping — so nothing inside
           drifts out of place relative to the box. */
        const mx = x - d.ox;
        const my = y - d.oy;
        const move = (list, held) =>
          list.map((it) => {
            if (it.id === d.id) return { ...it, x, y };
            const o = held[it.id];
            return o ? { ...it, x: o.x + mx, y: o.y + my } : it;
          });
        update(
          (doc) => ({
            shapes: move(doc.shapes, d.held.shapes),
            nodes: move(doc.nodes, d.held.nodes),
            texts: move(doc.texts, d.held.texts),
            drawings: doc.drawings.map((dr) => {
              const pts = d.held.drawings[dr.id];
              return pts ? { ...dr, points: pts.map(([px, py]) => [px + mx, py + my]) } : dr;
            }),
          }),
          false
        );
      }
    } else if (d.kind === "shape") {
      setDraft((s) => ({
        ...s,
        x: Math.min(d.ox, p.x),
        y: Math.min(d.oy, p.y),
        w: Math.abs(p.x - d.ox),
        h: Math.abs(p.y - d.oy),
      }));
    } else if (d.kind === "pen") {
      setDraft((s) => ({ ...s, points: [...s.points, [p.x, p.y]] }));
    }
  }

  function onUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;

    if (d.kind === "shape" && draft && draft.w > 4 && draft.h > 4) {
      const shape = {
        id: uid("s"),
        kind: draft.kind,
        x: snapTo(draft.x, snap),
        y: snapTo(draft.y, snap),
        w: snapTo(draft.w, snap),
        h: snapTo(draft.h, snap),
        color: draft.color,
        dashed: true,
        label: "",
      };
      update((doc) => ({ shapes: [...doc.shapes, shape] }));
      setSel({ kind: "shape", id: shape.id });
      setTool("select");
    } else if (d.kind === "pen" && draft && draft.points.length > 1) {
      const stroke = {
        id: uid("d"),
        points: simplify(draft.points),
        color: draft.color,
        width: draft.width,
      };
      update((doc) => ({ drawings: [...doc.drawings, stroke] }));
    }
    setDraft(null);
  }

  // Edge endpoints may be either a component or a shape.
  const boxById = Object.fromEntries([...doc.nodes, ...doc.shapes].map((o) => [o.id, o]));
  const isSel = (kind, id) => sel && sel.kind === kind && sel.id === id;
  const editingText = doc.texts.find((t) => t.id === editing) || null;

  /* ── Request walkthrough ─────────────────────────── */
  const live = flow && flow.total ? flow : null;
  const hop = live ? live.hops[live.index] : null;

  /* How full a component is: it charges as the request lands on it and stays
     full, so a database visibly holds what was written to it. */
  function fillOf(id) {
    if (!live) return 0;
    if (live.hops[0].from === id) return 1; // the request starts here
    const settled = live.done ? live.total : live.index;
    for (let i = 0; i < settled; i++) if (live.hops[i].to === id) return 1;
    if (!live.done && hop.to === id) return live.progress;
    return 0;
  }

  /* During a run the diagram recedes to just the request: the route it has
     travelled stays lit, the rest dims back. This is opacity only — faded
     parts still take clicks, so the diagram stays editable while a run plays,
     and anything selected stays legible. */
  const dimOf = (lit, held) => (!live || lit || held ? 1 : DIM);

  /* Connections the request has finished crossing. They stay at full strength
     for the rest of the run, so the path builds up behind the request instead
     of vanishing once it has moved on. */
  const crossed = new Set();
  if (live) {
    const settled = live.done ? live.total : live.index;
    for (let i = 0; i < settled; i++) crossed.add(live.hops[i].edgeId);
  }

  /* A box is on the request's path once it has been reached, or while the
     current hop is crossing to or from it. */
  const onPath = (id) => live && (hop.from === id || hop.to === id || fillOf(id) > 0);

  // Stores and caches hold content, so they fill like a vessel.
  const holdsContent = (type) => {
    const cat = TYPE_INDEX[type]?.category;
    return cat === "Data Stores" || cat === "Caching";
  };

  const token = hop
    ? (() => {
        const a = boxById[hop.from];
        const b = boxById[hop.to];
        if (!a || !b) return null;
        return pointOnEdge(edgeGeometry(a, b, curved), live.done ? 1 : live.progress);
      })()
    : null;

  return (
    <>
      <svg
        ref={svgRef}
        onPointerDown={onBackgroundDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <defs>
          {MARKERS.map((m) => (
            <marker
              key={m.id}
              id={m.id}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,1 L9,5 L0,9 z" fill={m.color} />
            </marker>
          ))}
        </defs>

        {/* Plain black ground. Also the hit target: double-clicking bare canvas
            is the fastest way to start writing. */}
        <rect x="0" y="0" width="100%" height="100%" fill={T.canvas} />

        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {/* Shapes sit behind everything — they're grouping boxes. */}
          {doc.shapes.map((s) => {
            const on = isSel("shape", s.id);
            const armed = pending === s.id;
            const stroke = on || armed ? T.accent : s.color;
            const dash = armed ? "5 3" : s.dashed ? "6 4" : undefined;
            const cx = s.x + s.w / 2;
            const cy = s.y + s.h / 2;
            return (
            <g
              key={s.id}
              className="flow-fade"
              opacity={dimOf(onPath(s.id), on || armed)}
              onPointerDown={(e) => onItemDown(e, "shape", s)}
              style={{ cursor: tool === "edge" ? "crosshair" : "move" }}
            >
              {/* Fat transparent outline: the border is the handle, so the
                  interior stays free for the canvas underneath. */}
              {s.kind === "ellipse" ? (
                <>
                  <ellipse cx={cx} cy={cy} rx={s.w / 2} ry={s.h / 2} fill="none" stroke="transparent" strokeWidth="16" />
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={s.w / 2}
                    ry={s.h / 2}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="2"
                    strokeDasharray={dash}
                    style={{ filter: on || armed ? `drop-shadow(0 0 10px ${T.accent}aa)` : undefined }}
                  />
                </>
              ) : (
                <>
                  <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="8" fill="none" stroke="transparent" strokeWidth="16" />
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    rx="8"
                    fill="none"
                    stroke={stroke}
                    strokeWidth="2"
                    strokeDasharray={dash}
                    style={{ filter: on || armed ? `drop-shadow(0 0 10px ${T.accent}aa)` : undefined }}
                  />
                </>
              )}
              {s.label ? (
                <text x={s.x + 10} y={s.y - 6} fontSize="12" fill={s.color}>
                  {s.label}
                </text>
              ) : null}
            </g>
            );
          })}

          {doc.drawings.map((d) => (
            <path
              key={d.id}
              d={strokePath(d.points)}
              fill="none"
              stroke={d.color}
              strokeWidth={d.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              onPointerDown={(e) => {
                e.stopPropagation();
                if (tool === "select") setSel({ kind: "drawing", id: d.id });
              }}
            />
          ))}

          {doc.edges.map((e) => {
            const a = boxById[e.from];
            const b = boxById[e.to];
            if (!a || !b) return null; // endpoint deleted
            const g = edgeGeometry(a, b, curved);
            const on = isSel("edge", e.id);
            const isHop = live && e.id === hop.edgeId;
            const behind = live && crossed.has(e.id);
            /* Three states, brightest last: not yet reached, already crossed,
               being crossed right now. The route the request has taken keeps
               the accent so it reads as a trail rather than fading away. */
            const color = on || isHop || behind ? T.accent : e.color;
            const weight = isHop ? 3 : on ? 2.5 : behind ? 2.2 : 1.8;
            const blur = isHop ? 10 : behind || on ? 7 : 4;
            const halo = isHop ? "dd" : on ? "aa" : behind ? "99" : "66";
            return (
              <g
                key={e.id}
                className="flow-fade"
                opacity={dimOf(isHop || behind, on)}
                onPointerDown={(ev) => {
                  ev.stopPropagation();
                  if (tool === "select") setSel({ kind: "edge", id: e.id });
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Fat transparent hit area — a 2px line is hard to click. */}
                <path d={g.d} fill="none" stroke="transparent" strokeWidth="14" />
                {/* Undirected links get a head at both ends. The marker is
                    declared orient="auto-start-reverse", so markerStart turns
                    itself around without needing a second definition. */}
                <path
                  d={g.d}
                  fill="none"
                  stroke={color}
                  strokeWidth={weight}
                  strokeDasharray={e.dashed ? "6 4" : undefined}
                  markerStart={e.directed === false ? `url(#${markerFor(color)})` : undefined}
                  markerEnd={`url(#${markerFor(color)})`}
                  style={{ filter: `drop-shadow(0 0 ${blur}px ${color}${halo})` }}
                />
                {/* Pulses of light run along the hop being crossed, in the
                    direction of travel — which is not always the direction the
                    edge was drawn, so undirected links run the animation
                    backwards. Near-white, since accent over accent vanishes. */}
                {isHop ? (
                  <path
                    className={`flow-march${hop.from === e.from ? "" : " rev"}`}
                    d={g.d}
                    fill="none"
                    stroke={T.text}
                    strokeOpacity="0.85"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeDasharray="7 17"
                    pointerEvents="none"
                  />
                ) : null}
                {e.label ? (
                  <>
                    <rect
                      x={g.mid.x - e.label.length * 3.2 - 5}
                      y={g.mid.y - 9}
                      width={e.label.length * 6.4 + 10}
                      height="18"
                      rx="4"
                      fill={T.canvas}
                      stroke={T.border}
                    />
                    <text x={g.mid.x} y={g.mid.y + 4} fontSize="11" fill={T.textMuted} textAnchor="middle">
                      {e.label}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}

          {doc.nodes.map((n) => {
            const meta = TYPE_INDEX[n.type] || {};
            const color = n.color || meta.color || T.accent;
            const label = n.label ?? meta.name ?? n.type;
            const lines = wrapText(label, n.w - 14, 11, 2);
            const on = isSel("node", n.id);
            const armed = pending === n.id;
            const fill = fillOf(n.id);
            // The request's current destination gets a ring; everything the
            // request has not reached dims back behind it.
            const arriving = live && hop.to === n.id;
            return (
              <g
                key={n.id}
                className="flow-fade"
                opacity={dimOf(onPath(n.id), on || armed)}
                onPointerDown={(e) => onNodeDown(e, n)}
                style={{ cursor: tool === "edge" ? "crosshair" : "move" }}
              >
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx="12"
                  fill={T.surface2}
                  stroke={on || armed || arriving ? T.accent : color}
                  strokeWidth={on || armed || arriving ? 2 : 1.4}
                  strokeDasharray={armed ? "5 3" : undefined}
                  style={{
                    filter: `drop-shadow(0 0 ${on || armed || arriving ? 14 : 7}px ${
                      on || armed || arriving ? T.accent : color
                    }${on || armed || arriving ? "cc" : "55"})`,
                  }}
                />
                {/* A ring pings outward off whatever the request is landing on,
                    so the destination announces itself before the token gets
                    there. Purely decorative, hence no pointer events. */}
                {arriving ? (
                  <rect
                    className="flow-ping"
                    x={n.x}
                    y={n.y}
                    width={n.w}
                    height={n.h}
                    rx="12"
                    fill="none"
                    stroke={T.accent}
                    strokeWidth="1.5"
                    pointerEvents="none"
                  />
                ) : null}

                {/* Faint wash of the component's own colour so it reads as lit;
                    it deepens as the request charges this component. */}
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx="12"
                  fill={color}
                  opacity={0.07 + fill * 0.24}
                  pointerEvents="none"
                />

                {/* Stores fill from the bottom, like content landing in them. */}
                {fill > 0 && holdsContent(n.type) ? (
                  <>
                    <clipPath id={`hold-${n.id}`}>
                      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="12" />
                    </clipPath>
                    <g clipPath={`url(#hold-${n.id})`} pointerEvents="none">
                      <rect
                        x={n.x}
                        y={n.y + n.h - n.h * fill}
                        width={n.w}
                        height={n.h * fill}
                        fill={color}
                        opacity="0.3"
                      />
                      <rect
                        x={n.x}
                        y={n.y + n.h - n.h * fill}
                        width={n.w}
                        height="2"
                        fill={color}
                        opacity="0.9"
                      />
                    </g>
                  </>
                ) : null}
                <Icon type={n.type} color={color} x={n.x + (n.w - 36) / 2} y={n.y + 11} size={36} />
                {lines.map((ln, i) => (
                  <text
                    key={i}
                    x={n.x + n.w / 2}
                    y={n.y + 62 + i * 13}
                    fontSize="11"
                    fill={T.text}
                    textAnchor="middle"
                  >
                    {ln}
                  </text>
                ))}
              </g>
            );
          })}

          {doc.texts.map((t) => (
            <text
              key={t.id}
              x={t.x}
              y={t.y}
              fontSize={t.size}
              fill={isSel("text", t.id) ? T.accent : t.color}
              style={{
                cursor: "move",
                // Hidden while its editor is open so the two don't overlap.
                visibility: editing === t.id ? "hidden" : "visible",
                filter: `drop-shadow(0 0 6px ${t.color}55)`,
              }}
              onPointerDown={(e) => onItemDown(e, "text", t)}
            >
              {/* <text> has no line breaks of its own. */}
              {String(t.text)
                .split("\n")
                .map((line, i) => (
                  <tspan key={i} x={t.x} dy={i ? t.size * 1.25 : 0}>
                    {line}
                  </tspan>
                ))}
            </text>
          ))}

          {/* The request in transit. Drawn after the diagram so it reads as
              travelling over it rather than being part of it. */}
          {token ? (
            <g pointerEvents="none">
              <circle cx={token.x} cy={token.y} r="11" fill={T.accent} opacity="0.18" />
              <circle
                cx={token.x}
                cy={token.y}
                r="5"
                fill={T.accent}
                style={{ filter: `drop-shadow(0 0 9px ${T.accent})` }}
              />
            </g>
          ) : null}

          {/* In-flight draft */}
          {draft && draft.kind === "rect" ? (
            <rect
              x={draft.x}
              y={draft.y}
              width={draft.w}
              height={draft.h}
              rx="8"
              fill="none"
              stroke={T.accent}
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
          ) : null}
          {draft && draft.kind === "ellipse" ? (
            <ellipse
              cx={draft.x + draft.w / 2}
              cy={draft.y + draft.h / 2}
              rx={draft.w / 2}
              ry={draft.h / 2}
              fill="none"
              stroke={T.accent}
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
          ) : null}
          {draft && draft.kind === "pen" ? (
            <path
              d={strokePath(draft.points)}
              fill="none"
              stroke={draft.color}
              strokeWidth={draft.width}
              strokeLinecap="round"
            />
          ) : null}
        </g>
      </svg>

      {/* A real HTML textarea layered over the canvas, not a <foreignObject>:
          focus and IME behave properly, and it can't be clipped by the SVG. */}
      {editingText ? (
        <textarea
          ref={inputRef}
          className="canvas-input"
          style={{
            left: editingText.x * view.k + view.x,
            top: (editingText.y - editingText.size) * view.k + view.y,
            fontSize: editingText.size * view.k,
            color: editingText.color,
          }}
          onFocus={() => {
            hasFocus.current = true;
          }}
          value={editingText.text}
          onChange={(ev) =>
            update(
              (d) => ({
                texts: d.texts.map((x) => (x.id === editingText.id ? { ...x, text: ev.target.value } : x)),
              }),
              false
            )
          }
          onBlur={stopEditing}
          onKeyDown={(ev) => {
            // Enter commits, Shift+Enter adds a line.
            if (ev.key === "Escape" || (ev.key === "Enter" && !ev.shiftKey)) {
              ev.preventDefault();
              ev.currentTarget.blur();
            }
            ev.stopPropagation();
          }}
        />
      ) : null}
    </>
  );
}
