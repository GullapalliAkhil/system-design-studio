/* Dragging a group box carries whatever sits inside it. */
import { open, alive, check, eq, done, DOC_KEY, shot } from "./lib/harness.mjs";

const doc = {
  title: "group move",
  brief: "", fr: [], nfr: [], notes: [],
  nodes: [
    // Inside the rectangle.
    { id: "in1", type: "server", x: 160, y: 200, w: 132, h: 92, label: "In A", color: "#3ddc97" },
    { id: "in2", type: "redis",  x: 160, y: 320, w: 132, h: 92, label: "In B", color: "#ffcc66" },
    // Straddling the rectangle's right edge (spans 460..592, border at 520) --
    // only partially inside, so it stays put.
    { id: "edge1", type: "sqldb", x: 460, y: 200, w: 132, h: 92, label: "Straddle", color: "#ffcc66" },
    // Well outside.
    { id: "out1", type: "users", x: 700, y: 200, w: 132, h: 92, label: "Out", color: "#7c5cff" },
    // Inside the circle, near its centre.
    { id: "circ", type: "server", x: 720, y: 520, w: 132, h: 92, label: "Circled", color: "#3ddc97" },
  ],
  edges: [],
  texts: [
    { id: "t-in",  x: 190, y: 460, text: "inside",  size: 16, color: "#f4f7ff" },
    { id: "t-out", x: 760, y: 200, text: "outside", size: 16, color: "#f4f7ff" },
  ],
  drawings: [
    { id: "d-in",  points: [[200, 490], [240, 500], [280, 490]], color: "#ff5fb0", width: 3 },
    { id: "d-out", points: [[900, 700], [940, 710], [980, 700]], color: "#ff5fb0", width: 3 },
  ],
  shapes: [
    // The rectangle under test: x 120..520, y 160..540.
    { id: "box", kind: "rect", x: 120, y: 160, w: 400, h: 380, color: "#3d9bff", dashed: true, label: "Group" },
    // A circle whose bounding box also covers a node sitting in its corner.
    { id: "circle", kind: "ellipse", x: 620, y: 420, w: 340, h: 340, color: "#00e5ff", dashed: true, label: "Ring" },
    // Nested fully inside the rectangle.
    { id: "nested", kind: "rect", x: 150, y: 180, w: 90, h: 60, color: "#ffd23f", dashed: true, label: "" },
  ],
};
// Sits in the circle's bounding-box corner but outside the circle itself.
doc.nodes.push({ id: "corner", type: "sqldb", x: 624, y: 424, w: 100, h: 70, label: "Corner", color: "#ffcc66" });

const { browser, page, errors } = await open({ doc, viewport: { width: 1500, height: 950 } });

const read = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), DOC_KEY);
const stage = await page.locator(".stage").boundingBox();

/** Drag a shape by its outline (the border is the handle, not the interior). */
async function dragShape(id, dx, dy) {
  const s = (await read()).shapes.find((x) => x.id === id);
  // Grab the top border, midway across -- inside the fat transparent handle.
  const gx = stage.x + s.x + s.w / 2;
  const gy = stage.y + s.y;
  await page.mouse.move(gx, gy);
  await page.mouse.down();
  await page.mouse.move(gx + dx / 2, gy + dy / 2, { steps: 6 });
  await page.mouse.move(gx + dx, gy + dy, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(150);
}

const before = await read();
const posOf = (d, kind, id) => {
  const it = d[kind].find((x) => x.id === id);
  return it ? `${it.x},${it.y}` : "(missing)";
};
const moved = (a, b, kind, id, dx, dy) => {
  const p = a[kind].find((x) => x.id === id);
  const q = b[kind].find((x) => x.id === id);
  return q.x === p.x + dx && q.y === p.y + dy;
};

/* ── Rectangle carries its contents ────────────────── */
await dragShape("box", 120, 60);
let after = await read();
const rd = [120, 60];

check(moved(before, after, "shapes", "box", ...rd), "rect box itself moves");
check(moved(before, after, "nodes", "in1", ...rd), "node fully inside moves with the rect");
check(moved(before, after, "nodes", "in2", ...rd), "second node inside moves with the rect");
check(moved(before, after, "shapes", "nested", ...rd), "nested shape moves with the rect");
check(moved(before, after, "texts", "t-in", ...rd), "text inside moves with the rect");
check(
  after.drawings.find((d) => d.id === "d-in").points[0][0] ===
    before.drawings.find((d) => d.id === "d-in").points[0][0] + 120,
  "freehand stroke inside moves with the rect"
);
check(moved(before, after, "nodes", "edge1", 0, 0), "node straddling the border stays put");
check(moved(before, after, "nodes", "out1", 0, 0), "node outside stays put");
check(moved(before, after, "texts", "t-out", 0, 0), "text outside stays put");
check(
  after.drawings.find((d) => d.id === "d-out").points[0][0] ===
    before.drawings.find((d) => d.id === "d-out").points[0][0],
  "freehand stroke outside stays put"
);

/* ── Ellipse uses the circle, not its bounding box ─── */
const b2 = await read();
await dragShape("circle", -80, 40);
const a2 = await read();
check(moved(b2, a2, "shapes", "circle", -80, 40), "circle itself moves");
check(moved(b2, a2, "nodes", "circ", -80, 40), "node inside the circle moves with it");
check(
  moved(b2, a2, "nodes", "corner", 0, 0),
  "node in the circle's bbox corner but outside the circle stays put"
);

/* ── Relative layout is preserved ──────────────────── */
const gap = (d) => {
  const s = d.shapes.find((x) => x.id === "box");
  const n = d.nodes.find((x) => x.id === "in1");
  return `${n.x - s.x},${n.y - s.y}`;
};
eq(gap(a2), gap(before), "offset between box and its contents is unchanged");

/* ── Undo restores the whole group in one step ─────── */
const b3 = await read();
await page.locator(".stage").click({ position: { x: 20, y: 20 } });
await page.keyboard.press("Control+z");
await page.waitForTimeout(200);
const a3 = await read();
check(
  posOf(a3, "shapes", "circle") === posOf(b2, "shapes", "circle") &&
    posOf(a3, "nodes", "circ") === posOf(b2, "nodes", "circ"),
  "one undo rewinds the box and its contents together",
  `box ${posOf(a3, "shapes", "circle")} vs ${posOf(b2, "shapes", "circle")}, ` +
    `node ${posOf(a3, "nodes", "circ")} vs ${posOf(b2, "nodes", "circ")}`
);
void b3;

await shot(page, "group-move");
check(await alive(page), "app still mounted");
check(errors.length === 0, "no page errors", errors.slice(0, 2).join(" | "));

await done(browser);
