/* The walkthrough's transport controls: play, step, scrub, speed, replay.
   Seeded, so a failure can be replayed with SEED=<n>. */
import { open, alive, rng, fixture, check, done } from "./lib/harness.mjs";

const SEED = Number(process.env.SEED || 7);
const RUNS = Number(process.env.RUNS || 250);
const rand = rng(SEED);

const { browser, page, errors } = await open({ doc: fixture() });
await page.keyboard.press("f");
await page.waitForSelector(".flowbar");

const count = () => page.locator(".flow-count").textContent();

/* ── A plain run reaches the end and can replay ────── */
await page.locator(".btn.play").click();
await page.waitForTimeout(3400); // 3 hops * 950ms + slack
check((await count()) === "3/3", "a full run reaches the last hop", await count());
await page.locator(".btn.play").click();
await page.waitForTimeout(1100);
const mid = await count();
check(mid === "1/3" || mid === "2/3", "pressing play at the end replays from the top", mid);
await page.waitForTimeout(2800);
check((await count()) === "3/3", "the replay also finishes", await count());

/* ── Rewinding to zero then playing is the crash case ── */
for (let i = 0; i < 40; i++) {
  await page.locator('.btn.icon[title="Restart"]').click();
  await page.locator(".btn.play").click();
  await page.waitForTimeout(8 + rand() * 40);
  if (errors.length || !(await alive(page))) break;
}
check(await alive(page) && !errors.length, "40 restart-then-play cycles survive", errors[0]);

/* ── Random transport fuzz ─────────────────────────── */
const actions = {
  play:    () => page.locator(".btn.play").click(),
  space:   () => page.keyboard.press(" "),
  next:    () => page.locator('.btn.icon[title="Next hop"]').click(),
  prev:    () => page.locator('.btn.icon[title="Previous hop"]').click(),
  restart: () => page.locator('.btn.icon[title="Restart"]').click(),
  speed:   () => page.locator(".segmented.tiny button").nth(Math.floor(rand() * 3)).click(),
  right:   () => page.keyboard.press("ArrowRight"),
  left:    () => page.keyboard.press("ArrowLeft"),
  fit:     () => page.locator(".hud .btn", { hasText: "Fit" }).click(),
};
const names = Object.keys(actions);
const seq = [];
let crashed = null;
for (let i = 0; i < RUNS; i++) {
  const k = names[Math.floor(rand() * names.length)];
  seq.push(k);
  try { await actions[k](); } catch { /* control not on screen right now */ }
  await page.waitForTimeout(rand() * 60);
  if (errors.length || !(await alive(page))) {
    crashed = `#${i}: ${seq.slice(-14).join(" -> ")}\n       ${errors[0] || "(tree unmounted)"}`;
    break;
  }
}
check(!crashed, `${RUNS} random transport actions survive (seed ${SEED})`, crashed);

await done(browser);
