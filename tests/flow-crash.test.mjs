/* Regression: a negative first animation-frame delta used to drive the flow
   clock below zero, flooring the hop index to -1. hops[-1] is undefined, so
   Canvas and FlowBar both threw and the tree unmounted.

   rAF reports the frame's *start* time, which can sit behind a performance.now()
   taken while that frame is already underway. Live it lands on some frames only
   (measured: -0.2ms), so pin it here by shifting every rAF timestamp back by
   more than one frame. Only the first delta goes negative -- later ones are
   differences, so the skew cancels, matching the real failure exactly. */
import { open, alive, fixture, check, done } from "./lib/harness.mjs";

const SKEW = `
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => cb(t - 50));
`;

const { browser, page, errors } = await open({ doc: fixture(), initScript: SKEW });

await page.keyboard.press("f");
await page.waitForSelector(".flowbar");

// Play with the run rewound to the start: pos sits at 0, so a negative first
// delta is what pushes it below zero.
await page.locator(".btn.play").click();
await page.waitForTimeout(700);

check(await alive(page), "app survives a negative first frame delta");
check((await page.locator(".flowbar").count()) === 1, "flow bar still rendered");
check(errors.length === 0, "no page errors", errors.slice(0, 3).join(" | "));

// Rewinding to zero and replaying re-seeds the clock; it must stay safe.
for (let i = 0; i < 12; i++) {
  await page.locator('.btn.icon[title="Restart"]').click();
  await page.locator(".btn.play").click();
  await page.waitForTimeout(40);
}
check(await alive(page), "app survives 12 rewind-then-play cycles");
check(errors.length === 0, "still no page errors", errors.slice(0, 3).join(" | "));

await done(browser);
