// Self-check for the career corridor. Run with: npm run check
import assert from "node:assert/strict";
import { resumeData } from "../src/data/resume";
import { cardPose, clamp01 } from "../src/lib/scene";

// Every card shows a headline, and React keys the cards by company.
for (const job of resumeData.work) assert.ok(job.headline, `${job.company} has no headline`);
assert.equal(new Set(resumeData.work.map((job) => job.company)).size, resumeData.work.length);

assert.equal(clamp01(-1), 0);
assert.equal(clamp01(2), 1);

const focus = cardPose(0);
assert.ok(focus.z === 0 && focus.opacity === 1 && focus.focused, "the card in focus is at full size and opacity");
assert.equal(cardPose(3).opacity, 0, "cards three steps ahead are invisible");
assert.ok(cardPose(1).opacity < 1 && cardPose(1).opacity > cardPose(2).opacity, "cards fade with distance");
assert.ok(cardPose(1).z < 0, "cards ahead sit further away");
assert.ok(cardPose(-0.25).z > 0 && cardPose(-0.25).opacity < 1, "a passed card flies toward the camera and fades");
assert.equal(cardPose(-0.5).opacity, 0, "a passed card is gone half a step later");
assert.equal(cardPose(0.6).focused, false, "only the nearest card takes clicks");

console.log("check passed");
