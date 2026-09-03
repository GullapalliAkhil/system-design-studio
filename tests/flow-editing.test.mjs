/* Fuzzes editing the diagram while a walkthrough is playing -- the case the
   "flow is an overlay, not a mode" behaviour opens up. Seeded, so a crash can
   be replayed with SEED=<n>. */
import { open, alive, rng, fixture, check, done } from "./lib/harness.mjs";

const SEED = Number(process.env.SEED || 1);
const RUNS = Number(process.env.RUNS || 120);
const rand = rng(SEED);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];

const { browser, page, errors } = await open({ doc: fixture() });
const doc = fixture();
const stage = await page.locator(".stage").boundingBox();
const at = (n) => [stage.x + n.x + n.w / 2, stage.y + n.y + n.h / 2];

await page.keyboard.press("f");
await page.waitForSelector(".flowbar");

const actions = {
  play:    () => page.locator(".btn.play").click(),
  next:    () => page.locator('.btn.icon[title="Next hop"]').click(),
  prev:    () => page.locator('.btn.icon[title="Previous hop"]').click(),
  restart: () => page.locator('.btn.icon[title="Restart"]').click(),
  speed:   () => page.locator(".segmented.tiny button").nth(Math.floor(rand() * 3)).click(),
  toggleF: () => page.keyboard.press("f"),
  addNode: () => page.locator(".panel.left .cell").nth(Math.floor(rand() * 6)).click(),
  delNode: async () => {
    await page.mouse.click(...at(pick(doc.nodes)));
    await page.keyboard.press("Delete");
  },
  delEdge: async () => {
    const e = pick(doc.edges);
    const a = doc.nodes.find((n) => n.id === e.from);
    const b = doc.nodes.find((n) => n.id === e.to);
    if (!a || !b) return;
    // Click the midpoint of the connection, then delete it.
    await page.mouse.click((at(a)[0] + at(b)[0]) / 2, (at(a)[1] + at(b)[1]) / 2);
    await page.keyboard.press("Delete");
  },
  undo:    () => page.keyboard.press("Control+z"),
  redo:    () => page.keyboard.press("Control+Shift+z"),
  drag:    async () => {
    const [x, y] = at(pick(doc.nodes));
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + (rand() - 0.5) * 220, y + (rand() - 0.5) * 160, { steps: 5 });
    await page.mouse.up();
  },
};
const names = Object.keys(actions);

const seq = [];
let crashed = null;
for (let i = 0; i < RUNS; i++) {
  const k = pick(names);
  seq.push(k);
  try { await actions[k](); } catch { /* control not on screen right now */ }
  await page.waitForTimeout(40 + rand() * 220);
  if (errors.length || !(await alive(page))) {
    crashed = { at: i, tail: seq.slice(-14).join(" -> ") };
    break;
  }
}

check(
  !crashed,
  `${RUNS} random edit+playback actions survive (seed ${SEED})`,
  crashed && `crashed at #${crashed.at}: ${crashed.tail}\n       ${errors[0] || "(tree unmounted, no error captured)"}`
);

await done(browser);
