import { useEffect, useMemo, useRef, useState } from "react";
import Palette from "./ui/Palette.jsx";
import Canvas from "./ui/Canvas.jsx";
import Inspector from "./ui/Inspector.jsx";
import { TYPE_INDEX } from "./catalog.js";
import { T } from "./theme.js";
import { emptyDoc, loadDoc, saveDoc, useDoc } from "./lib/doc.js";
import { NODE_H, NODE_W, clamp, contentBounds, snapTo, uid } from "./lib/geometry.js";

const TOOLS = [
  { id: "select", key: "v", glyph: "↖", title: "Select / move (V)" },
  { id: "pan", key: "h", glyph: "✋", title: "Pan (H) — or hold Alt" },
  { id: "edge", key: "e", glyph: "⟶", title: "Connect two components (E)" },
  { id: "text", key: "t", glyph: "T", title: "Text (T)" },
  { id: "rect", key: "r", glyph: "▭", title: "Group box (R)" },
  { id: "ellipse", key: "o", glyph: "◯", title: "Ellipse (O)" },
  { id: "pen", key: "p", glyph: "✎", title: "Freehand (P)" },
];

const SVG_NS = "http://www.w3.org/2000/svg";

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const initial = useMemo(() => loadDoc(), []);
  const { doc, update, replace, snapshot, undo, redo, canUndo, canRedo } = useDoc(initial);

  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [tool, setTool] = useState("select");
  const [sel, setSel] = useState(null);
  const [snap, setSnap] = useState(true);
  const [curved, setCurved] = useState(true);

  const svgRef = useRef(null);
  const fileRef = useRef(null);

  /* Best-effort autosave; loadDoc() reads it back on next boot. */
  useEffect(() => {
    saveDoc(doc);
  }, [doc]);

  function addNode(type) {
    const meta = TYPE_INDEX[type] || {};
    const r = svgRef.current.getBoundingClientRect();
    // Stagger repeated adds so they don't stack in one spot.
    const off = (doc.nodes.length % 6) * 20;
    const node = {
      id: uid("n"),
      type,
      x: snapTo((r.width / 2 - view.x) / view.k - NODE_W / 2 + off, snap),
      y: snapTo((r.height / 2 - view.y) / view.k - NODE_H / 2 + off, snap),
      w: NODE_W,
      h: NODE_H,
      label: meta.name || type,
      color: meta.color || T.accent,
    };
    update((d) => ({ nodes: [...d.nodes, node] }));
    setSel({ kind: "node", id: node.id });
  }

  function deleteSelection() {
    if (!sel) return;
    const { kind, id } = sel;
    update((d) => {
      const next = { [`${kind}s`]: d[`${kind}s`].filter((x) => x.id !== id) };
      // A node's edges have nowhere to attach once it's gone.
      if (kind === "node") next.edges = d.edges.filter((e) => e.from !== id && e.to !== id);
      return next;
    });
    setSel(null);
  }

  function zoomToFit() {
    const r = svgRef.current.getBoundingClientRect();
    const b = contentBounds(doc);
    const k = clamp(Math.min(r.width / b.w, r.height / b.h), 0.15, 2);
    setView({ k, x: r.width / 2 - (b.x + b.w / 2) * k, y: r.height / 2 - (b.y + b.h / 2) * k });
  }

  function exportJSON() {
    const name = (doc.title || "system-design").replace(/[^\w-]+/g, "-").toLowerCase();
    download(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }), `${name}.json`);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        replace(JSON.parse(String(reader.result))); // normalizeDoc() tolerates older shapes
        setSel(null);
      } catch {
        alert("That file isn't valid Studio JSON.");
      }
    };
    reader.readAsText(file);
  }

  /* Snapshot the live canvas, re-framed to its content instead of the viewport. */
  function exportSVG() {
    const b = contentBounds(doc);
    const clone = svgRef.current.cloneNode(true);
    clone.setAttribute("xmlns", SVG_NS);
    clone.setAttribute("viewBox", `${b.x} ${b.y} ${b.w} ${b.h}`);
    clone.setAttribute("width", Math.round(b.w));
    clone.setAttribute("height", Math.round(b.h));
    clone.removeAttribute("style");
    clone.querySelector('rect[fill="url(#grid)"]')?.remove();
    clone.querySelector("g[transform]")?.setAttribute("transform", "");

    const bg = document.createElementNS(SVG_NS, "rect");
    bg.setAttribute("x", b.x);
    bg.setAttribute("y", b.y);
    bg.setAttribute("width", b.w);
    bg.setAttribute("height", b.h);
    bg.setAttribute("fill", T.canvas);
    clone.insertBefore(bg, clone.querySelector("g[transform]"));

    const src = new XMLSerializer().serializeToString(clone);
    const name = (doc.title || "system-design").replace(/[^\w-]+/g, "-").toLowerCase();
    download(new Blob([src], { type: "image/svg+xml" }), `${name}.svg`);
  }

  function clearAll() {
    if (doc.nodes.length && !confirm("Clear the whole canvas? This can still be undone with ⌘Z.")) return;
    replace({ ...emptyDoc(), title: doc.title, brief: doc.brief, fr: doc.fr, nfr: doc.nfr });
    setSel(null);
  }

  /* ── Keyboard ──────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return;

      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelection();
        return;
      }
      if (e.key === "Escape") {
        setSel(null);
        setTool("select");
        return;
      }
      const t = TOOLS.find((x) => x.key === e.key.toLowerCase());
      if (t && !mod) setTool(t.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, doc, undo, redo]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          System Design Studio <small>· {doc.title || "untitled"}</small>
        </div>

        <div className="divider" />
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`btn icon${tool === t.id ? " active" : ""}`}
            title={t.title}
            onClick={() => setTool(t.id)}
          >
            {t.glyph}
          </button>
        ))}

        <div className="divider" />
        <button className="btn icon" title="Undo (⌘Z)" disabled={!canUndo} onClick={undo}>
          ↶
        </button>
        <button className="btn icon" title="Redo (⇧⌘Z)" disabled={!canRedo} onClick={redo}>
          ↷
        </button>

        <div className="spacer" />

        <label className="toggle" title="Snap positions to the 10px grid">
          <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} />
          Snap
        </label>
        <label className="toggle" title="Draw connections as curves">
          <input type="checkbox" checked={curved} onChange={(e) => setCurved(e.target.checked)} />
          Curved
        </label>

        <div className="divider" />
        <button className="btn" onClick={exportJSON}>
          Export JSON
        </button>
        <button className="btn" onClick={() => fileRef.current.click()}>
          Import
        </button>
        <button className="btn" onClick={exportSVG}>
          SVG
        </button>
        <button className="btn danger" onClick={clearAll}>
          Clear
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            if (e.target.files[0]) importJSON(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </header>

      <Palette onAdd={addNode} />

      <div className={`stage tool-${tool}`}>
        <Canvas
          svgRef={svgRef}
          doc={doc}
          update={update}
          snapshot={snapshot}
          view={view}
          setView={setView}
          tool={tool}
          setTool={setTool}
          sel={sel}
          setSel={setSel}
          snap={snap}
          curved={curved}
        />

        <div className="hud">
          <button className="btn icon" title="Zoom out" onClick={() => setView((v) => ({ ...v, k: clamp(v.k / 1.2, 0.15, 4) }))}>
            −
          </button>
          <span className="zoom-label">{Math.round(view.k * 100)}%</span>
          <button className="btn icon" title="Zoom in" onClick={() => setView((v) => ({ ...v, k: clamp(v.k * 1.2, 0.15, 4) }))}>
            +
          </button>
          <div className="divider" />
          <button className="btn" onClick={zoomToFit}>
            Fit
          </button>
          <button className="btn" onClick={() => setView({ x: 0, y: 0, k: 1 })}>
            100%
          </button>
        </div>

        {tool === "edge" ? (
          <div className="hint-bar">Click the source component, then the target. Esc to cancel.</div>
        ) : null}
        {tool === "select" && !doc.nodes.length ? (
          <div className="hint-bar">Pick a component from the left to start your design.</div>
        ) : null}
      </div>

      <Inspector doc={doc} update={update} sel={sel} onDelete={deleteSelection} />
    </div>
  );
}
