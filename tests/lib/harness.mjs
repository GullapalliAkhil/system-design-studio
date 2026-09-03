/* Shared plumbing for the browser tests: launching a page against the dev
   server, seeding a diagram, capturing everything the page complains about,
   and a seeded RNG so a failing fuzz run can be replayed exactly. */
import { chromium } from "playwright";

export const BASE = process.env.BASE_URL || "http://localhost:5173/";
export const DOC_KEY = "sysdesign-studio:doc:v1";
export const SHOTS = process.env.SHOTS || null;

/** Four diagrams' worth of the same fixture, so tests read the same shape. */
export function fixture(edges) {
  return {
    title: "test",
    brief: "", fr: [], nfr: [], texts: [], shapes: [], drawings: [], notes: [],
    nodes: [
      { id: "n1", type: "users",  x: 80,  y: 240, w: 132, h: 92, label: "Users",      color: "#7c5cff" },
      { id: "n2", type: "server", x: 320, y: 240, w: 132, h: 92, label: "App Server", color: "#3ddc97" },
      { id: "n3", type: "redis",  x: 580, y: 110, w: 132, h: 92, label: "Redis",      color: "#ffcc66" },
      { id: "n4", type: "sqldb",  x: 580, y: 370, w: 132, h: 92, label: "PostgreSQL", color: "#ffcc66" },
    ],
    edges: edges || [
      { id: "e1", from: "n1", to: "n2", label: "", color: "#8a8fa3", dashed: false, directed: true },
      { id: "e2", from: "n2", to: "n3", label: "", color: "#8a8fa3", dashed: false, directed: true },
      { id: "e3", from: "n2", to: "n4", label: "", color: "#8a8fa3", dashed: false, directed: true },
    ],
  };
}

/**
 * Open the app with `doc` already in localStorage.
 *
 * `initScript` runs before any page script — used to bend the environment, e.g.
 * skewing requestAnimationFrame timestamps.
 */
export async function open({ doc, initScript, viewport } = {}) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: viewport || { width: 1280, height: 820 } });
  page.setDefaultTimeout(8000);

  // Both channels matter: React rethrows render errors as pageerror, but some
  // failures only ever show up as a console error.
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.stack || e).split("\n")[0]));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text().split("\n")[0];
    // React's own "The above error occurred in..." echo duplicates the throw.
    if (!t.startsWith("The above error occurred")) errors.push("console: " + t);
  });

  if (initScript) await page.addInitScript(initScript);
  await page.goto(BASE, { waitUntil: "networkidle" });
  if (doc) {
    await page.evaluate(([k, d]) => localStorage.setItem(k, JSON.stringify(d)), [DOC_KEY, doc]);
  } else {
    await page.evaluate(() => localStorage.clear());
  }
  await page.reload({ waitUntil: "networkidle" });

  return { browser, page, errors };
}

/** The React tree is still mounted (an unhandled render error unmounts it). */
export const alive = (page) => page.evaluate(() => !!document.querySelector(".app"));

/** mulberry32 — small, seeded, good enough to replay a fuzz run. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function shot(page, name, clip) {
  if (!SHOTS) return;
  await page.screenshot({ path: `${SHOTS}/${name}.png`, clip, animations: "allow" });
}

/* ── Tiny assertion helpers ────────────────────────── */

const failures = [];
export function check(ok, label, detail) {
  if (ok) {
    console.log(`  ok   ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL ${label}${detail ? ` -- ${detail}` : ""}`);
  }
}
export function eq(actual, expected, label) {
  check(actual === expected, label, `got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
}
export function done(browser) {
  return browser.close().then(() => {
    if (failures.length) {
      console.log(`\n${failures.length} failure(s)`);
      process.exit(1);
    }
  });
}
