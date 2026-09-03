# Tests

Browser tests driven by Playwright against the running app. There is no test
framework — each file is a plain script that prints `ok` / `FAIL` lines and
exits non-zero if anything failed.

```bash
npm test                    # every test file
npm test -- flow            # only files whose name contains "flow"
SHOTS=/tmp/shots npm test   # also write screenshots
```

The runner reuses a dev server if one is already listening on `localhost:5173`,
otherwise it starts one and shuts it down afterwards. Point it elsewhere with
`BASE_URL=...`.

Playwright needs its browser once per machine:

```bash
npx playwright install chromium
```

## What each file covers

| File | Covers |
| --- | --- |
| `flow-crash.test.mjs` | Regression for the negative first frame delta that drove the flow clock below zero and unmounted the tree |
| `flow-transport.test.mjs` | Play, step, scrub, speed and replay, plus a random transport fuzz |
| `flow-editing.test.mjs` | Editing the diagram — adding, deleting, dragging, undo — while a walkthrough plays |
| `flow-visuals.test.mjs` | What dims and what stays lit as the request builds a trail, and the motion on the hop being crossed |
| `group-move.test.mjs` | Dragging a group box carries the nodes, text, strokes and nested boxes inside it |

## Seeds

The fuzzing tests use a seeded RNG so a failure can be replayed exactly:

```bash
SEED=42 RUNS=400 node tests/flow-editing.test.mjs
```

A crash prints the seed and the last actions leading up to it. Reproduce it with
that seed before changing anything, so you can tell a fix from a coincidence —
these failures are timing-dependent and a clean run proves little on its own.

## Adding a test

Drop a `*.test.mjs` file in this directory; the runner picks it up automatically.
`lib/harness.mjs` provides page setup with error capture (`open`), the shared
diagram fixture (`fixture`), the seeded RNG (`rng`), and the `check` / `eq` /
`done` assertions.
