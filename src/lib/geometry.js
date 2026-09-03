export const NODE_W = 132;
export const NODE_H = 92;
export const GRID = 10;

let counter = 0;
export const uid = (p = "n") => `${p}${Date.now().toString(36)}${(counter++).toString(36)}`;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const snapTo = (v, on, step = GRID) => (on ? Math.round(v / step) * step : v);

/** Where a ray from the centre of a box toward (tx,ty) crosses the box border. */
export function edgePoint(cx, cy, w, h, tx, ty) {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const hw = w / 2;
  const hh = h / 2;
  if (adx * hh > ady * hw) {
    const s = dx > 0 ? 1 : -1;
    return { x: cx + s * hw, y: cy + (dy / adx) * hw };
  }
  const s = dy > 0 ? 1 : -1;
  return { x: cx + (dx / ady) * hh, y: cy + s * hh };
}

/** Anchor points + path for an edge between two node boxes. */
export function edgeGeometry(a, b, curved) {
  const acx = a.x + a.w / 2;
  const acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2;
  const bcy = b.y + b.h / 2;
  const pad = 10;
  const from = edgePoint(acx, acy, a.w + pad, a.h + pad, bcx, bcy);
  const to = edgePoint(bcx, bcy, b.w + pad, b.h + pad, acx, acy);

  if (!curved) {
    return { from, to, d: `M${from.x},${from.y} L${to.x},${to.y}`, mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 } };
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const k = 0.45;
  const c1 = horizontal ? { x: from.x + dx * k, y: from.y } : { x: from.x, y: from.y + dy * k };
  const c2 = horizontal ? { x: to.x - dx * k, y: to.y } : { x: to.x, y: to.y - dy * k };
  return {
    from,
    to,
    // Exposed so callers can walk the curve, not just draw it.
    c1,
    c2,
    d: `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`,
    // Cubic Bézier evaluated at t = 0.5.
    mid: {
      x: (from.x + 3 * c1.x + 3 * c2.x + to.x) / 8,
      y: (from.y + 3 * c1.y + 3 * c2.y + to.y) / 8,
    },
  };
}

/**
 * Point at t ∈ [0,1] along an edge produced by edgeGeometry().
 * Straight edges lerp; curved ones evaluate the cubic Bézier directly, which
 * avoids measuring the rendered path with getPointAtLength() every frame.
 */
export function pointOnEdge(geo, t) {
  const { from, to, c1, c2 } = geo;
  const u = clamp(t, 0, 1);
  if (!c1 || !c2) {
    return { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u };
  }
  const v = 1 - u;
  const b0 = v * v * v;
  const b1 = 3 * v * v * u;
  const b2 = 3 * v * u * u;
  const b3 = u * u * u;
  return {
    x: b0 * from.x + b1 * c1.x + b2 * c2.x + b3 * to.x,
    y: b0 * from.y + b1 * c1.y + b2 * c2.y + b3 * to.y,
  };
}

/** Greedy word wrap for SVG <text>, which has no automatic wrapping. */
export function wrapText(text, maxWidth, fontSize, maxLines = 3) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const perChar = fontSize * 0.56;
  const maxChars = Math.max(5, Math.floor(maxWidth / perChar));
  const lines = [];
  let cur = words[0];
  for (let i = 1; i < words.length; i++) {
    if ((cur + " " + words[i]).length <= maxChars) cur += " " + words[i];
    else {
      lines.push(cur);
      cur = words[i];
    }
  }
  lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].slice(0, maxChars - 1).trimEnd() + "…";
    return kept;
  }
  return lines;
}

/** Bounding box of everything on the canvas — used by zoom-to-fit and export. */
export function contentBounds(doc, padding = 60) {
  const pts = [];
  const push = (x, y) => pts.push([x, y]);
  for (const n of doc.nodes) {
    push(n.x, n.y);
    push(n.x + n.w, n.y + n.h);
  }
  for (const s of doc.shapes) {
    push(s.x, s.y);
    push(s.x + s.w, s.y + s.h);
  }
  for (const t of doc.texts) {
    push(t.x, t.y - t.size);
    push(t.x + Math.max(120, t.text.length * t.size * 0.55), t.y + t.size);
  }
  for (const d of doc.drawings) for (const [x, y] of d.points) push(x, y);
  if (!pts.length) return { x: 0, y: 0, w: 1200, h: 800 };
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  return {
    x: minX,
    y: minY,
    w: Math.max(200, Math.max(...xs) + padding - minX),
    h: Math.max(200, Math.max(...ys) + padding - minY),
  };
}

/** Bounding box of a freehand stroke, or null if it has no points. */
export function pointsBounds(points) {
  if (!points || !points.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Builds a "sits entirely inside `box`" test.
 *
 * Group boxes carry what they visually contain, so containment follows the
 * drawn outline rather than the bounding rect: an ellipse checks all four
 * corners against the ellipse itself, otherwise anything tucked into the
 * corners of its bounding box would come along despite sitting outside it.
 */
export function containsBox(box) {
  if (box.kind === "ellipse") {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const rx = box.w / 2;
    const ry = box.h / 2;
    const has = (x, y) => rx > 0 && ry > 0 && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    return (x, y, w = 0, h = 0) =>
      has(x, y) && has(x + w, y) && has(x, y + h) && has(x + w, y + h);
  }
  return (x, y, w = 0, h = 0) =>
    x >= box.x && y >= box.y && x + w <= box.x + box.w && y + h <= box.y + box.h;
}

/** Douglas–Peucker-lite: drop points that sit almost on the previous segment. */
export function simplify(points, tolerance = 1.2) {
  if (points.length < 3) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = out[out.length - 1];
    const [x, y] = points[i];
    if (Math.hypot(x - px, y - py) >= tolerance) out.push(points[i]);
  }
  out.push(points[points.length - 1]);
  return out;
}

/** Smooth polyline through freehand points using midpoint quadratics. */
export function strokePath(points) {
  if (!points.length) return "";
  if (points.length < 3) return `M${points.map((p) => p.join(",")).join(" L")}`;
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    d += ` Q${x0},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2}`;
  }
  const last = points[points.length - 1];
  d += ` L${last[0]},${last[1]}`;
  return d;
}
