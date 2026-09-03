#!/usr/bin/env node
/* Runs every tests/*.test.mjs against the dev server, starting one if nothing
   is already listening. Exits non-zero if any test fails.

     npm test                  # everything
     npm test -- flow          # only tests whose name contains "flow"
     SHOTS=/tmp/shots npm test # also write screenshots
*/
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const filter = process.argv[2] || "";

const up = async () => {
  try {
    const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
};

let server = null;
if (await up()) {
  console.log(`using the dev server already at ${BASE}\n`);
} else {
  console.log(`starting the dev server for ${BASE}`);
  server = spawn("npm", ["run", "dev"], { cwd: join(here, ".."), stdio: "ignore", detached: true });
  const deadline = Date.now() + 30000;
  while (!(await up())) {
    if (Date.now() > deadline) {
      server.kill("SIGTERM");
      console.error("dev server did not come up within 30s");
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log("dev server ready\n");
}

const files = (await readdir(here))
  .filter((f) => f.endsWith(".test.mjs"))
  .filter((f) => f.includes(filter))
  .sort();

if (!files.length) {
  console.error(`no tests matched ${JSON.stringify(filter)}`);
  process.exit(1);
}

const run = (file) =>
  new Promise((resolve) => {
    const p = spawn(process.execPath, [join(here, file)], { stdio: "inherit", env: process.env });
    p.on("exit", (code) => resolve(code === 0));
  });

const failed = [];
for (const f of files) {
  console.log(`\n\x1b[1m${f}\x1b[0m`);
  if (!(await run(f))) failed.push(f);
}

console.log(`\n${"─".repeat(52)}`);
if (failed.length) {
  console.log(`\x1b[31m${failed.length} of ${files.length} failed:\x1b[0m ${failed.join(", ")}`);
} else {
  console.log(`\x1b[32mall ${files.length} test files passed\x1b[0m`);
}

// The dev server was ours, so take it down with us.
if (server) process.kill(-server.pid, "SIGTERM");
process.exit(failed.length ? 1 : 0);
