import { TYPE_INDEX } from "../catalog.js";

const SPEEDS = [0.5, 1, 2];

const nameOf = (box) =>
  box ? box.label || TYPE_INDEX[box.type]?.name || box.kind || "shape" : "?";

export default function FlowBar({ flow, boxById, onExit }) {
  const { hops, total, index, progress, playing, done } = flow;

  if (!total) {
    return (
      <div className="flowbar empty">
        <span className="meta">
          Connect two components with <b>E</b>, then press play to watch a request travel.
        </span>
        <button className="btn icon" title="Exit flow" onClick={onExit}>
          ✕
        </button>
      </div>
    );
  }

  const hop = hops[index];
  const from = boxById[hop.from];
  const to = boxById[hop.to];
  const hint = to && to.type ? TYPE_INDEX[to.type]?.hint : null;
  // Whole bar fills across the run, not just within the current hop.
  const pct = ((index + progress) / total) * 100;

  return (
    <div className="flowbar">
      <div className="flow-progress" aria-hidden="true">
        <i style={{ width: `${done ? 100 : pct}%` }} />
      </div>

      <div className="flow-row">
        <button className="btn icon" title="Restart" onClick={flow.restart}>
          ⟲
        </button>
        <button className="btn icon" title="Previous hop" onClick={flow.prev} disabled={index === 0 && !done}>
          ⏮
        </button>
        <button
          className="btn icon play"
          title={playing ? "Pause" : done ? "Replay" : "Play"}
          onClick={flow.toggle}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button className="btn icon" title="Next hop" onClick={flow.next} disabled={done}>
          ⏭
        </button>

        <span className="flow-count">
          {done ? total : index + 1}/{total}
        </span>

        <div className="divider" />

        <div className="flow-hop">
          <span className="flow-path">
            <b>{nameOf(from)}</b>
            <em>{hop.directedLabel || "→"}</em>
            <b>{nameOf(to)}</b>
            {to && to.label === undefined && to.kind ? null : null}
          </span>
          {hint ? <span className="flow-hint">{hint}</span> : null}
        </div>

        <div className="spacer" />

        <div className="segmented tiny" role="group" aria-label="Speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={flow.speed === s ? "on" : ""}
              onClick={() => flow.setSpeed(s)}
              title={`${s}× speed`}
            >
              {s}×
            </button>
          ))}
        </div>

        <button className="btn icon" title="Exit flow" onClick={onExit}>
          ✕
        </button>
      </div>
    </div>
  );
}
