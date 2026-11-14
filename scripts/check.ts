// Self-check for the hero picker. Run with: npm run check
import assert from "node:assert/strict";
import { resumeData, stack, type Layer } from "../src/data/resume";
import { matches, needsText, mailto } from "../src/lib/match";

const ids = stack.map((s) => s.id);
const items = [...resumeData.projects, ...resumeData.work];

for (const item of items) {
  assert.ok(item.layers.length > 0, "every project and role needs at least one layer");
  for (const layer of item.layers) assert.ok(ids.includes(layer), `unknown layer "${layer}"`);
}

// No option in the picker may come up empty, alone or with everything ticked.
for (const id of ids) {
  assert.ok(resumeData.projects.some((p) => matches(p, [id])), `no project proves "${id}"`);
  assert.ok(resumeData.work.some((w) => matches(w, [id])), `no role proves "${id}"`);
}
assert.ok(items.some((i) => matches(i, ids)), "ticking everything matches nothing");

assert.equal(matches({ layers: ["web"] }, []), false);
assert.equal(matches({ layers: ["web", "ai"] }, ["ai", "web"]), true);
assert.equal(matches({ layers: ["web"] }, ["web", "ai"]), false);

assert.equal(needsText(["ai", "mobile"] as Layer[]), "A mobile app + AI features");
assert.equal(mailto("a@b.c", []), "mailto:a@b.c?subject=Project%20enquiry&body=Hi%20Suvajit%2C%0A%0AA%20bit%20about%20the%20project%3A%0A");
assert.ok(mailto("a@b.c", ["api"]).includes("Backend%20%26%20real-time"), "& must be encoded");

console.log("check passed");
