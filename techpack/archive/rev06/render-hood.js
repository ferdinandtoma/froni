/* Render hood-omega.html to a high-res PNG (2x). Usage: node render-hood.js <out.png> */
"use strict";
const path = require("path");
const { chromium } = require("playwright");
(async () => {
  const out = process.argv[2] || path.join(__dirname, "hood-omega.png");
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 2 });
  await p.goto("file:///" + path.join(__dirname, "hood-omega.html").replace(/\\/g, "/"), { waitUntil: "load" });
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 8000 });
  await p.screenshot({ path: out });
  await b.close();
  console.log("wrote", out);
})().catch((e) => { console.error(e.message || e); process.exit(1); });
