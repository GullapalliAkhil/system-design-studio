import { useCallback, useRef, useState } from "react";
import { uid } from "./geometry.js";

export const STORAGE_KEY = "sysdesign-studio:doc:v1";
const HISTORY_LIMIT = 80;

export function emptyDoc() {
  return {
    title: "",
    brief: "",
    fr: [],
    nfr: [],
    nodes: [],
    edges: [],
    texts: [],
    shapes: [],
    drawings: [],
    notes: [],
  };
}

export const task = (text, done = false) => ({ id: uid("t"), text, done });

/** Tolerates docs written by older versions / hand-edited JSON. */
export function normalizeDoc(raw) {
  const base = emptyDoc();
  if (!raw || typeof raw !== "object") return base;
  const asTasks = (list) =>
    Array.isArray(list)
      ? list.map((x) => (typeof x === "string" ? task(x) : { id: x.id || uid("t"), text: String(x.text ?? ""), done: !!x.done }))
      : [];
  return {
    ...base,
    ...raw,
    title: String(raw.title ?? ""),
    brief: String(raw.brief ?? ""),
    fr: asTasks(raw.fr),
    nfr: asTasks(raw.nfr),
    nodes: Array.isArray(raw.nodes) ? raw.nodes : [],
    edges: Array.isArray(raw.edges) ? raw.edges : [],
    texts: Array.isArray(raw.texts) ? raw.texts : [],
    shapes: Array.isArray(raw.shapes) ? raw.shapes : [],
    drawings: Array.isArray(raw.drawings) ? raw.drawings : [],
    notes: Array.isArray(raw.notes) ? raw.notes : [],
  };
}

export function loadDoc() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeDoc(JSON.parse(raw)) : emptyDoc();
  } catch {
    return emptyDoc();
  }
}

export function saveDoc(doc) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    /* quota or private mode — autosave is best-effort */
  }
}

/**
 * Document state with undo/redo.
 *
 * `snapshot()` records the current doc as an undo point. Call it once at the
 * start of a gesture (before the first mutation of a drag), not on every frame,
 * so a whole drag collapses into a single undo step.
 */
export function useDoc(initial) {
  const [doc, setDoc] = useState(initial);
  const past = useRef([]);
  const future = useRef([]);
  const [depth, setDepth] = useState({ undo: 0, redo: 0 });

  const sync = () => setDepth({ undo: past.current.length, redo: future.current.length });

  const snapshot = useCallback(() => {
    setDoc((cur) => {
      past.current = [...past.current.slice(-HISTORY_LIMIT + 1), cur];
      future.current = [];
      return cur;
    });
    // Defer so the counters reflect the ref writes above.
    queueMicrotask(sync);
  }, []);

  /** Mutate the doc. `commit` records an undo point first (one-shot changes). */
  const update = useCallback(
    (fn, commit = true) => {
      if (commit) snapshot();
      setDoc((cur) => ({ ...cur, ...(typeof fn === "function" ? fn(cur) : fn) }));
    },
    [snapshot]
  );

  const replace = useCallback(
    (next, commit = true) => {
      if (commit) snapshot();
      setDoc(normalizeDoc(next));
    },
    [snapshot]
  );

  const undo = useCallback(() => {
    setDoc((cur) => {
      if (!past.current.length) return cur;
      const prev = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [cur, ...future.current].slice(0, HISTORY_LIMIT);
      return prev;
    });
    queueMicrotask(sync);
  }, []);

  const redo = useCallback(() => {
    setDoc((cur) => {
      if (!future.current.length) return cur;
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, cur].slice(-HISTORY_LIMIT);
      return next;
    });
    queueMicrotask(sync);
  }, []);

  return { doc, setDoc, update, replace, snapshot, undo, redo, canUndo: depth.undo > 0, canRedo: depth.redo > 0 };
}
