import { useState } from "react";
import Palette from "./Palette.jsx";
import Requirements from "./Requirements.jsx";

export default function LeftPanel({ doc, update, onAdd }) {
  const [tab, setTab] = useState("components");
  const [query, setQuery] = useState("");

  const total = doc.fr.length + doc.nfr.length;
  const done = [...doc.fr, ...doc.nfr].filter((t) => t.done).length;

  return (
    <aside className="panel left">
      <div className="panel-head">
        <div className="tabs">
          <button
            className={`tab${tab === "components" ? " on" : ""}`}
            onClick={() => setTab("components")}
          >
            Components
          </button>
          <button
            className={`tab${tab === "requirements" ? " on" : ""}`}
            onClick={() => setTab("requirements")}
          >
            Requirements
            {total ? (
              <i className={`badge${done === total ? " full" : ""}`}>
                {done}/{total}
              </i>
            ) : null}
          </button>
        </div>

        {tab === "components" ? (
          <input
            className="search"
            placeholder="Search components…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        ) : null}
      </div>

      {tab === "components" ? (
        <Palette query={query} onAdd={onAdd} />
      ) : (
        <Requirements doc={doc} update={update} />
      )}
    </aside>
  );
}
