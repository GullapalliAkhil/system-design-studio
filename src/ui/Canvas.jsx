import { useEffect, useRef, useState } from "react";
import { Icon } from "../icons.jsx";
import { TYPE_INDEX } from "../catalog.js";
import { T, PALETTE } from "../theme.js";
import {
  GRID,
  clamp,
  edgeGeometry,
  simplify,
  snapTo,
  strokePath,
  uid,
  wrapText,
} from "../lib/geometry.js";

const MIN_K = 0.15;
const MAX_K = 4;

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
}) {
  const drag = useRef(null);
  const [draft, setDraft] = useState(null);
  const [pending, setPending] = useState(null); // node id awaiting an edge target

  useEffect(() => {
    if (tool !== "edge") setPending(null);
  }, [tool]);

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

  /* ── Background gestures ─────────────────────────── */
  function onBackgroundDown(e) {
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
      const p = toWorld(e);
      const item = {
        id: uid("t"),
        x: snapTo(p.x, snap),
        y: snapTo(p.y, snap),
        text: "Double-click to edit",
        size: 16,
        color: T.text,
      };
      update((d) => ({ texts: [...d.texts, item] }));
      setSel({ kind: "text", id: item.id });
      setTool("select");
      return;
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onNodeDown(e, node) {
    e.stopPropagation();
    if (tool === "edge") {
      if (!pending) {
        setPending(node.id);
      } else if (pending !== node.id) {
        const edge = {
          id: uid("e"),
          from: pending,
          to: node.id,
          label: "",
          color: T.textMuted,
          dashed: false,
        };
        update((d) => ({ edges: [...d.edges, edge] }));
        setPending(null);
        setSel({ kind: "edge", id: edge.id });
      }
      return;
    }
    if (tool !== "select") return;
    setSel({ kind: "node", id: node.id });
    const p = toWorld(e);
    snapshot();
    drag.current = { kind: "node", id: node.id, dx: p.x - node.x, dy: p.y - node.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onItemDown(e, kind, item) {
    e.stopPropagation();
    if (tool !== "select") return;
    setSel({ kind, id: item.id });
    const p = toWorld(e);
    snapshot();
    drag.current = { kind: "item", listKey: `${kind}s`, id: item.id, dx: p.x - item.x, dy: p.y - item.y };
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
      update(
        (doc) => ({ [d.listKey]: doc[d.listKey].map((it) => (it.id === d.id ? { ...it, x, y } : it)) }),
        false
      );
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

  const nodeById = Object.fromEntries(doc.nodes.map((n) => [n.id, n]));
  const isSel = (kind, id) => sel && sel.kind === kind && sel.id === id;

  return (
    <svg
      ref={svgRef}
      onPointerDown={onBackgroundDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <defs>
        <pattern id="grid" width={GRID * 4} height={GRID * 4} patternUnits="userSpaceOnUse">
          <path d={`M${GRID * 4} 0 L0 0 0 ${GRID * 4}`} fill="none" stroke={T.grid} strokeWidth="1" />
        </pattern>
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

      {/* Grid is drawn in screen space, offset to follow the pan. */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#grid)"
        style={{ transform: `translate(${view.x % (GRID * 4 * view.k)}px, ${view.y % (GRID * 4 * view.k)}px)` }}
      />

      <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
        {/* Shapes sit behind everything — they're grouping boxes. */}
        {doc.shapes.map((s) => (
          <g key={s.id} onPointerDown={(e) => onItemDown(e, "shape", s)} style={{ cursor: "move" }}>
            {s.kind === "ellipse" ? (
              <ellipse
                cx={s.x + s.w / 2}
                cy={s.y + s.h / 2}
                rx={s.w / 2}
                ry={s.h / 2}
                fill="none"
                stroke={isSel("shape", s.id) ? T.accent : s.color}
                strokeWidth="2"
                strokeDasharray={s.dashed ? "6 4" : undefined}
              />
            ) : (
              <rect
                x={s.x}
                y={s.y}
                width={s.w}
                height={s.h}
                rx="8"
                fill="none"
                stroke={isSel("shape", s.id) ? T.accent : s.color}
                strokeWidth="2"
                strokeDasharray={s.dashed ? "6 4" : undefined}
              />
            )}
            {s.label ? (
              <text x={s.x + 10} y={s.y - 6} fontSize="12" fill={s.color}>
                {s.label}
              </text>
            ) : null}
          </g>
        ))}

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
          const a = nodeById[e.from];
          const b = nodeById[e.to];
          if (!a || !b) return null; // endpoint deleted
          const g = edgeGeometry(a, b, curved);
          const on = isSel("edge", e.id);
          const color = on ? T.accent : e.color;
          return (
            <g
              key={e.id}
              onPointerDown={(ev) => {
                ev.stopPropagation();
                if (tool === "select") setSel({ kind: "edge", id: e.id });
              }}
              style={{ cursor: "pointer" }}
            >
              {/* Fat transparent hit area — a 2px line is hard to click. */}
              <path d={g.d} fill="none" stroke="transparent" strokeWidth="14" />
              <path
                d={g.d}
                fill="none"
                stroke={color}
                strokeWidth={on ? 2.5 : 1.8}
                strokeDasharray={e.dashed ? "6 4" : undefined}
                markerEnd={`url(#${markerFor(e.color)})`}
              />
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
          return (
            <g
              key={n.id}
              onPointerDown={(e) => onNodeDown(e, n)}
              style={{ cursor: tool === "edge" ? "crosshair" : "move" }}
            >
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx="10"
                fill={T.surface}
                stroke={on || armed ? T.accent : color}
                strokeWidth={on || armed ? 2 : 1.4}
                strokeDasharray={armed ? "5 3" : undefined}
              />
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
            style={{ cursor: "move" }}
            onPointerDown={(e) => onItemDown(e, "text", t)}
          >
            {t.text}
          </text>
        ))}

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
  );
}
