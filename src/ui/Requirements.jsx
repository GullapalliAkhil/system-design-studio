import { useState } from "react";
import { task } from "../lib/doc.js";

/* One checklist. Everything in it is typed by the user — no seeded defaults. */
function TodoList({ label, listKey, list, update }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    update((d) => ({ [listKey]: [...d[listKey], task(text)] }));
    setDraft("");
  };
  const toggle = (id) =>
    update((d) => ({ [listKey]: d[listKey].map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const rename = (id, text) =>
    update((d) => ({ [listKey]: d[listKey].map((t) => (t.id === id ? { ...t, text } : t)) }), false);
  const remove = (id) => update((d) => ({ [listKey]: d[listKey].filter((t) => t.id !== id) }));

  const done = list.filter((t) => t.done).length;

  return (
    <div className="todo">
      <h4>
        {label}
        {list.length ? (
          <span className="count">
            {done}/{list.length}
          </span>
        ) : null}
      </h4>

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
                  <span className={t.done ? "done" : ""} title="Click to edit" onClick={() => setEditingId(t.id)}>
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
          add();
        }}
      >
        <input
          value={draft}
          placeholder="Type and press Enter…"
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn icon" type="submit" title="Add" disabled={!draft.trim()}>
          +
        </button>
      </form>
    </div>
  );
}

export default function Requirements({ doc, update }) {
  const [open, setOpen] = useState(false);

  const all = [...doc.fr, ...doc.nfr];
  const done = all.filter((t) => t.done).length;

  return (
    <div className={`collapse${open ? " open" : ""}`}>
      <button className="collapse-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="chev" aria-hidden="true">
          ▸
        </span>
        Requirements
        {all.length ? (
          <i className={`badge${done === all.length ? " full" : ""}`}>
            {done}/{all.length}
          </i>
        ) : null}
      </button>

      {open ? (
        <div className="collapse-body">
          <TodoList label="Functional" listKey="fr" list={doc.fr} update={update} />
          <TodoList label="Non-functional" listKey="nfr" list={doc.nfr} update={update} />
        </div>
      ) : null}
    </div>
  );
}
