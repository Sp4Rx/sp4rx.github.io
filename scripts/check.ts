// Self-check for the data the page depends on. Run with: npm run check
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resumeData } from "../src/data/resume";

// Every career card shows a headline, and React keys cards by company and project name.
for (const job of resumeData.work) assert.ok(job.headline, `${job.company} has no headline`);
assert.equal(new Set(resumeData.work.map((job) => job.company)).size, resumeData.work.length);
assert.equal(new Set(resumeData.projects.map((p) => p.name)).size, resumeData.projects.length);

// The share image and the coin photo are static files the page and meta tags point at.
for (const file of ["public/og.jpg", "public/suvajit.webp"]) assert.ok(existsSync(file), `${file} is missing`);

console.log("check passed");
