/* How the walkthrough reads on the canvas: what dims, what stays lit as the
   request builds up a trail, and the motion on the hop being crossed. */
import { open, fixture, check, eq, done, shot } from "./lib/harness.mjs";

/* e3 is drawn n4 -> n2 but travelled n2 -> n4, so its pulses must run in
   reverse relative to the path direction. */
const doc = fixture([
  { id: "e1", from: "n1", to: "n2", label: "", color: "#8a8fa3", dashed: false, directed: true },
  { id: "e2", from: "n2", to: "n3", label: "", color: "#8a8fa3", dashed: false, directed: true },
  { id: "e3", from: "n4", to: "n2", label: "", color: "#8a8fa3", dashed: false, directed: false },
]);

const { browser, page, errors } = await open({ doc });

/** Opacity actually applied to each faded group, labelled by its content. */
const opacities = () =>
  page.evaluate(() =>
    [...document.querySelectorAll(".stage svg g.flow-fade")]
      .map((g) => {
        const t = g.querySelector("text");
        const name = t ? t.textContent : "edge";
        return `${name}:${Number(getComputedStyle(g).opacity).toFixed(2)}`;
      })
      .join(" ")
  );

const fx = () =>
  page.evaluate(() => {
    const one = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { name: cs.animationName, dir: cs.animationDirection };
    };
    return {
      march: one(".flow-march"),
      marchCount: document.querySelectorAll(".flow-march").length,
      ping: one(".flow-ping"),
      offsets: [...document.querySelectorAll(".flow-march")].map(
        (el) => getComputedStyle(el).strokeDashoffset
      ),
    };
  });

const ALL_LIT = "edge:1.00 edge:1.00 edge:1.00 Users:1.00 App Server:1.00 Redis:1.00 PostgreSQL:1.00";

/* ── Nothing is touched until a run starts ─────────── */
eq(await opacities(), ALL_LIT, "nothing is dimmed before the walkthrough opens");
eq((await fx()).marchCount, 0, "no travelling pulses before the walkthrough opens");

await page.keyboard.press("f");
await page.waitForSelector(".flowbar");
await page.waitForTimeout(350);

/* ── Hop 1: only the first leg is lit ──────────────── */
eq(
  await opacities(),
  "edge:1.00 edge:0.20 edge:0.20 Users:1.00 App Server:1.00 Redis:0.20 PostgreSQL:0.20",
  "hop 1 lights the first leg and dims what the request has not reached"
);
await shot(page, "visuals-hop1");

const a = await fx();
eq(a.marchCount, 1, "pulses run on exactly one connection -- the hop being crossed");
eq(a.march?.name, "flow-march", "the pulse animation is running");
eq(a.ping?.name, "flow-ping", "the arrival ring is pinging");
await page.waitForTimeout(240);
const b = await fx();
check(b.offsets[0] !== a.offsets[0], "pulses actually travel", `${a.offsets[0]} -> ${b.offsets[0]}`);

/* ── Trail: crossed connections stay lit ───────────── */
await page.locator('.btn.icon[title="Next hop"]').click();
await page.waitForTimeout(300);
eq(
  await opacities(),
  "edge:1.00 edge:1.00 edge:0.20 Users:1.00 App Server:1.00 Redis:1.00 PostgreSQL:0.20",
  "hop 2 keeps the already-crossed leg lit"
);
await shot(page, "visuals-hop2");

await page.locator('.btn.icon[title="Next hop"]').click();
await page.waitForTimeout(300);
eq(
  await opacities(),
  ALL_LIT,
  "hop 3 has the whole travelled route lit"
);
eq((await fx()).march?.dir, "reverse", "pulses reverse on a link travelled against how it was drawn");
await shot(page, "visuals-hop3");

/* ── Leaving the walkthrough restores the diagram ──── */
await page.keyboard.press("Escape");
await page.waitForTimeout(350);
eq(await opacities(), ALL_LIT, "leaving the walkthrough returns everything to full strength");
eq((await fx()).marchCount, 0, "pulses stop when the walkthrough closes");

/* ── Reduced motion ────────────────────────────────── */
await page.emulateMedia({ reducedMotion: "reduce" });
await page.keyboard.press("f");
await page.waitForTimeout(250);
eq((await fx()).march?.name, "none", "pulses hold still under prefers-reduced-motion");

check(errors.length === 0, "no page errors", errors.slice(0, 2).join(" | "));
await done(browser);
