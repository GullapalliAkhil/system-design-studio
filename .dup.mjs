import { chromium } from "playwright";
import { appendFileSync, writeFileSync } from "fs";
const OUT = "/private/tmp/claude-501/-Users-gullapalliakhilsai-Desktop-opensource-systemDesign/fb8d82e3-3f2a-4ef4-b19b-abf2069dee4e/scratchpad/dup.txt";
writeFileSync(OUT, "");
const log = (s) => appendFileSync(OUT, s + "\n");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1512, height: 945 } });
page.setDefaultTimeout(6000);
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await page.goto(process.argv[2], { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

let bad = 0;
const check = (n, ok, extra = "") => { if (!ok) bad++; log(`${ok ? "PASS" : "FAIL"}  ${n}${extra ? " — " + extra : ""}`); };

const labels = await page.locator(".panel.left .cell span").allTextContents();
const titles = await page.locator(".panel.left .cell").evaluateAll((els) => els.map((e) => e.getAttribute("title")));
const seen = new Map();
labels.forEach((l) => seen.set(l, (seen.get(l) || 0) + 1));
const repeats = [...seen].filter(([, n]) => n > 1);

check("palette shows 66 components", labels.length === 66, `got ${labels.length}`);
check("no repeated labels in the palette", repeats.length === 0, repeats.map(([l, n]) => `${l} x${n}`).join(", "));
check("every cell has a hint", titles.every((t) => t && t.length > 3));
check("no React duplicate-key warnings", !errs.some((e) => /same key|duplicate/i.test(e)));

// Each cell must still place exactly one working component.
await page.locator(".panel.left .cell").nth(0).click();
await page.waitForTimeout(200);
const nodes = await page.evaluate(() => (JSON.parse(localStorage.getItem("sysdesign-studio:doc:v1") || "{}").nodes || []).length);
check("clicking a component still places it", nodes === 1);

log(`${bad === 0 ? "ALL PASS" : bad + " FAILED"} · pageerrors: ${errs.length ? errs.join(" | ") : "none"}`);
await browser.close();
