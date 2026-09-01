import { TYPE_INDEX } from "../catalog.js";
import { PALETTE } from "../theme.js";

function Swatches({ value, onPick }) {
  return (
    <div className="swatches">
      {PALETTE.map((c) => (
        <button
          key={c}
          className={`swatch${value === c ? " on" : ""}`}
          style={{ background: c, color: c }}
          title={c}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  );
}

export default function Inspector({ doc, update, sel, onDelete }) {
  /* ── Nothing selected ─────────────────────────────── */
  if (!sel) {
    return (
      <aside className="panel right">
        <div className="section">
          <h3>{doc.title || "Untitled design"}</h3>
          {doc.brief ? <p className="meta">{doc.brief}</p> : null}
          <p className="meta" style={{ marginTop: 10 }}>
            <b>{doc.nodes.length}</b> components · <b>{doc.edges.length}</b> connections ·{" "}
            <b>{doc.texts.length}</b> notes
          </p>
        </div>

        <div className="section">
          <h3>Getting around</h3>
          <ul className="keys">
            <li>
              <kbd>Double-click</kbd> anywhere to write
            </li>
            <li>
              <kbd>E</kbd> then two components to connect
            </li>
            <li>
              <kbd>Scroll</kbd> zoom · <kbd>Drag</kbd> pan
            </li>
            <li>
              <kbd>⌘Z</kbd> undo · <kbd>Del</kbd> remove
            </li>
          </ul>
          <p className="meta" style={{ marginTop: 10 }}>
            Select anything on the canvas to edit it here.
          </p>
        </div>
      </aside>
    );
  }

  /* ── Something selected ───────────────────────────── */
  const { kind, id } = sel;
  const listKey = `${kind}s`;
  const item = (doc[listKey] || []).find((x) => x.id === id);
  if (!item) return <aside className="panel right" />;

  const patch = (fields, commit = true) =>
    update((d) => ({ [listKey]: d[listKey].map((x) => (x.id === id ? { ...x, ...fields } : x)) }), commit);

  const meta = kind === "node" ? TYPE_INDEX[item.type] : null;

  return (
    <aside className="panel right">
      <div className="section">
        <h3>{kind}</h3>

        {kind === "node" ? (
          <div className="field">
            <label>Label</label>
            <input
              type="text"
              value={item.label ?? ""}
              onChange={(e) => patch({ label: e.target.value }, false)}
            />
          </div>
        ) : null}

        {kind === "text" ? (
          <>
            <div className="field">
              <label>Text</label>
              <textarea rows="3" value={item.text} onChange={(e) => patch({ text: e.target.value }, false)} />
            </div>
            <div className="field">
              <label>Size — {item.size}px</label>
              <input
                type="range"
                min="10"
                max="48"
                value={item.size}
                onChange={(e) => patch({ size: Number(e.target.value) }, false)}
              />
            </div>
          </>
        ) : null}

        {kind === "edge" || kind === "shape" ? (
          <div className="field">
            <label>Label</label>
            <input
              type="text"
              placeholder={kind === "edge" ? "e.g. gRPC, async" : "e.g. Region A"}
              value={item.label ?? ""}
              onChange={(e) => patch({ label: e.target.value }, false)}
            />
          </div>
        ) : null}

        {kind === "drawing" ? (
          <div className="field">
            <label>Stroke — {item.width}px</label>
            <input
              type="range"
              min="1"
              max="10"
              value={item.width}
              onChange={(e) => patch({ width: Number(e.target.value) }, false)}
            />
          </div>
        ) : null}

        <div className="field">
          <label>Colour</label>
          <Swatches value={item.color} onPick={(c) => patch({ color: c })} />
        </div>

        {kind === "edge" || kind === "shape" ? (
          <label className="toggle">
            <input type="checkbox" checked={!!item.dashed} onChange={(e) => patch({ dashed: e.target.checked })} />
            Dashed
          </label>
        ) : null}
      </div>

      {meta?.hint ? (
        <div className="section">
          <h3>What to say about it</h3>
          <p className="hint">{meta.hint}</p>
          <p className="meta" style={{ marginTop: 9 }}>
            {meta.category}
            {meta.brand ? " · brand" : " · concept"}
          </p>
        </div>
      ) : null}

      <div className="section">
        <button className="btn danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </aside>
  );
}
