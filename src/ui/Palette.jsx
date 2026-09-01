import { useMemo, useState } from "react";
import { CATEGORIES, TYPE_INDEX } from "../catalog.js";
import { Icon } from "../icons.jsx";

/* Flatten a category into concept icons followed by its brand logos.
   Keyed by type as a guard: the catalog holds no duplicates today, and keying
   here means a future one collapses to a single cell rather than silently
   colliding React keys and rendering the same component twice. */
function entriesFor(cat) {
  const byType = new Map();
  for (const it of cat.items) {
    byType.set(it.type, { type: it.type, name: it.name, color: cat.color });
  }
  for (const b of cat.brands || []) {
    const m = TYPE_INDEX[b];
    if (m && m.category === cat.name) byType.set(b, { type: b, name: m.name, color: m.color });
  }
  return [...byType.values()];
}

export default function Palette({ onAdd }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        name: cat.name,
        color: cat.color,
        entries: entriesFor(cat).filter(
          (e) => !needle || e.name.toLowerCase().includes(needle) || e.type.includes(needle)
        ),
      })).filter((g) => g.entries.length),
    [needle]
  );

  return (
    <aside className="panel left">
      <div className="panel-head">
        <input
          className="search"
          placeholder="Search components…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {groups.length === 0 ? <div className="empty">No component matches “{query}”.</div> : null}

      {groups.map((g) => (
        <div className="section" key={g.name}>
          <h3>
            <i className="dot" style={{ color: g.color, background: g.color }} />
            {g.name}
          </h3>
          <div className="grid">
            {g.entries.map((e) => (
              <button
                key={e.type}
                className="cell"
                style={{ "--tint": e.color }}
                title={TYPE_INDEX[e.type]?.hint || e.name}
                onClick={() => onAdd(e.type)}
              >
                <Icon type={e.type} color={e.color} size={26} />
                <span>{e.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
