import { FR_CHIPS, NFR_CHIPS, TYPE_INDEX } from "../catalog.js";
import { PALETTE } from "../theme.js";
import { task } from "../lib/doc.js";

function Swatches({ value, onPick }) {
  return (
    <div className="swatches">
      {PALETTE.map((c) => (
        <button
          key={c}
          className={`swatch${value === c ? " on" : ""}`}
          style={{ background: c }}
          title={c}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  );
}

/* One editable requirement list (functional or non-functional). */
function Requirements({ label, listKey, list, chips, update }) {
  const toggle = (id) =>
    update((d) => ({ [listKey]: d[listKey].map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const remove = (id) => update((d) => ({ [listKey]: d[listKey].filter((t) => t.id !== id) }));
  const add = (text) => update((d) => ({ [listKey]: [...d[listKey], task(text)] }));

  const taken = new Set(list.map((t) => t.text));

  return (
    <div className="section">
      <h3>{label}</h3>
      {list.length ? (
        <ul className="tasks">
          {list.map((t) => (
            <li key={t.id}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span className={t.done ? "done" : ""}>{t.text}</span>
              <button className="x" title="Remove" onClick={() => remove(t.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="chips">
        {chips
          .filter((c) => !taken.has(c))
          .map((c) => (
            <button key={c} className="chip" onClick={() => add(c)}>
              + {c}
            </button>
          ))}
      </div>
    </div>
  );
}

export default function Inspector({ doc, update, sel, onDelete }) {
  /* ── Nothing selected: the design brief ───────────── */
  if (!sel) {
    return (
      <aside className="panel right">
        <div className="section">
          <h3>Design</h3>
          <div className="field">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Design Twitter"
              value={doc.title}
              onChange={(e) => update({ title: e.target.value }, false)}
            />
          </div>
          <div className="field">
            <label>Brief</label>
            <textarea
              rows="4"
              placeholder="Scope, scale, constraints…"
              value={doc.brief}
              onChange={(e) => update({ brief: e.target.value }, false)}
            />
          </div>
          <p className="meta">
            {doc.nodes.length} components · {doc.edges.length} connections
          </p>
        </div>

        <Requirements
          label="Functional requirements"
          listKey="fr"
          list={doc.fr}
          chips={FR_CHIPS}
          update={update}
        />
        <Requirements
          label="Non-functional requirements"
          listKey="nfr"
          list={doc.nfr}
          chips={NFR_CHIPS}
          update={update}
        />

        <div className="section">
          <h3>Tips</h3>
          <p className="meta">
            Click a component to drop it on the canvas. Press <b>E</b> then click two
            components to connect them. Scroll to zoom, drag empty canvas to pan.
          </p>
        </div>
      </aside>
    );
  }

  /* ── Something selected: its properties ───────────── */
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
          <p className="meta" style={{ marginTop: 8 }}>
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
