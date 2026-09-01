import { useState } from "react";
import { FR_CHIPS, NFR_CHIPS } from "../catalog.js";
import { task } from "../lib/doc.js";

/* One editable checklist. Tasks can be added free-form, seeded from the preset
   chips, renamed in place, ticked off, or removed. */
function TodoList({ label, listKey, list, chips, update }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);

  const add = (text) => {
    const t = text.trim();
    if (!t) return;
    update((d) => ({ [listKey]: [...d[listKey], task(t)] }));
  };
  const toggle = (id) =>
    update((d) => ({ [listKey]: d[listKey].map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const rename = (id, text) =>
    update((d) => ({ [listKey]: d[listKey].map((t) => (t.id === id ? { ...t, text } : t)) }), false);
  const remove = (id) => update((d) => ({ [listKey]: d[listKey].filter((t) => t.id !== id) }));
  const clearDone = () => update((d) => ({ [listKey]: d[listKey].filter((t) => !t.done) }));

  const done = list.filter((t) => t.done).length;
  const taken = new Set(list.map((t) => t.text));
  const suggestions = chips.filter((c) => !taken.has(c));

  return (
    <div className="section">
      <h3>
        {label}
        {list.length ? (
          <span className="count">
            {done}/{list.length}
          </span>
        ) : null}
      </h3>

      {list.length ? (
        <>
          <div className="progress" aria-hidden="true">
            <i style={{ width: `${(done / list.length) * 100}%` }} />
          </div>
          <ul className="tasks">
            {list.map((t) => (
              <li key={t.id}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggle(t.id)}
                  title={t.done ? "Mark as not done" : "Mark as done"}
                />
                {editingId === t.id ? (
                  <input
                    className="task-edit"
                    autoFocus
                    value={t.text}
                    onChange={(e) => rename(t.id, e.target.value)}
                    onBlur={() => {
                      if (!t.text.trim()) remove(t.id);
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
                    }}
                  />
                ) : (
                  <span
                    className={t.done ? "done" : ""}
                    title="Click to edit"
                    onClick={() => setEditingId(t.id)}
                  >
                    {t.text}
                  </span>
                )}
                <button className="x" title="Delete" onClick={() => remove(t.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <form
        className="add-row"
        onSubmit={(e) => {
          e.preventDefault();
          add(draft);
          setDraft("");
        }}
      >
        <input
          value={draft}
          placeholder={`Add a ${listKey === "fr" ? "requirement" : "constraint"}…`}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn icon" type="submit" title="Add" disabled={!draft.trim()}>
          +
        </button>
      </form>

      {suggestions.length ? (
        <div className="chips">
          {suggestions.map((c) => (
            <button key={c} className="chip" onClick={() => add(c)}>
              + {c}
            </button>
          ))}
        </div>
      ) : null}

      {done ? (
        <button className="link" onClick={clearDone}>
          Clear {done} completed
        </button>
      ) : null}
    </div>
  );
}

export default function Requirements({ doc, update }) {
  return (
    <>
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
            rows="3"
            placeholder="Scope, scale, constraints…"
            value={doc.brief}
            onChange={(e) => update({ brief: e.target.value }, false)}
          />
        </div>
      </div>

      <TodoList label="Functional" listKey="fr" list={doc.fr} chips={FR_CHIPS} update={update} />
      <TodoList label="Non-functional" listKey="nfr" list={doc.nfr} chips={NFR_CHIPS} update={update} />
    </>
  );
}
