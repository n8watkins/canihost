#!/usr/bin/env node
// Capture README screenshots from the running dev/prod server.
// Usage: node scripts/screenshot.mjs [baseUrl]  (default http://localhost:7681)
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.argv[2] || "http://localhost:7681";
const ROOT = path.join(import.meta.dirname, "..");
const OUT = path.join(ROOT, "assets");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

console.log(`Loading ${BASE} ...`);
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);

// 1. Hero / top of page
await page.screenshot({ path: path.join(OUT, "hero.png") });
console.log("wrote assets/hero.png");

// 2. Build a selection to show the studio populated, then screenshot calculator
const adds = await page.$$('button[aria-label^="Add "]');
for (let i = 0; i < Math.min(4, adds.length); i++) {
  await adds[i].click();
  await page.waitForTimeout(150);
}
await page.waitForTimeout(400);

// Jump to studio
await page.evaluate(() => {
  document.getElementById("studio")?.scrollIntoView({ behavior: "instant" });
});
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(OUT, "calculator.png") });
console.log("wrote assets/calculator.png");

// 3. Switch to compose tab
const composeTab = await page.$('button[role="tab"]:has-text("docker-compose")');
if (composeTab) {
  await composeTab.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "compose.png") });
  console.log("wrote assets/compose.png");
}

// 4. Full directory grid view
await page.evaluate(() => {
  document.getElementById("browse")?.scrollIntoView({ behavior: "instant" });
});
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(OUT, "directory.png") });
console.log("wrote assets/directory.png");

await browser.close();
console.log("done");
