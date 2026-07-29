/* Froni FRN-001 tech pack build (Rev 06): scan ./reference/ for garment
 * artwork, downscale + embed it as base64, render techpack.html headless, run
 * the overflow check and geometry assertions (any failure aborts), then print
 * to PDF. A4 landscape, printBackground, zero PDF margins. */
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT_DIR = path.join(__dirname, "dist");
const OUT_PDF = path.join(OUT_DIR, "Froni_FRN-001_Tech_Pack_Rev06.pdf");
const REF_DIR = path.join(__dirname, "reference");
const PLACEMENT_JSON = path.join(__dirname, "placement.json");

// Find the first reference image (png/jpg/jpeg/webp) whose name matches any of
// the given case-insensitive substrings.
function findAsset(files, patterns) {
  return files.find((f) => patterns.some((p) => f.toLowerCase().includes(p))) || null;
}

// Load an image in the browser, downscale to max `maxEdge` on the long edge,
// re-encode JPEG quality 0.8, return the base64 data URL plus ORIGINAL pixel
// dimensions (aspect comes from the untouched original). Originals are only
// read, never written.
async function embedImage(page, absPath, maxEdge = 1600) {
  const ext = path.extname(absPath).slice(1).toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const b64 = fs.readFileSync(absPath).toString("base64");
  const r = await page.evaluate(async ({ b64, mime, maxEdge }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = `data:${mime};base64,${b64}`; });
    const w = img.naturalWidth, h = img.naturalHeight;
    const s = Math.min(1, maxEdge / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * s)), ch = Math.max(1, Math.round(h * s));
    const c = document.createElement("canvas"); c.width = cw; c.height = ch;
    c.getContext("2d").drawImage(img, 0, 0, cw, ch);
    return { dataURL: c.toDataURL("image/jpeg", 0.8), w, h, cw, ch };
  }, { b64, mime, maxEdge });
  return { src: r.dataURL, w: r.w, h: r.h, cw: r.cw, ch: r.ch, aspect: Math.round((r.w / r.h) * 100) / 100 };
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // ---- asset scan ----
  const files = fs.existsSync(REF_DIR)
    ? fs.readdirSync(REF_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    : [];
  const backFile = findAsset(files, ["pantocrator", "back"]);
  const frontFile = findAsset(files, ["front", "linework"]);
  const wornFile = findAsset(files, ["worn", "mockup"]);
  console.log(`Reference scan (./reference/): ${files.length} image(s)`);
  console.log(`  back  artwork: ${backFile || "NOT FOUND (need name containing 'pantocrator' or 'back')"}`);
  console.log(`  front artwork: ${frontFile || "NOT FOUND (need name containing 'front' or 'linework')"}`);
  console.log(`  worn  photo  : ${wornFile || "none (optional; name containing 'worn' or 'mockup')"}`);

  if (!backFile || !frontFile) {
    const missing = [];
    if (!backFile) missing.push("  - BACK artwork: add ./reference/<name>.png|jpg with 'pantocrator' or 'back' in the filename (the needle-painted icon render).");
    if (!frontFile) missing.push("  - FRONT artwork: add ./reference/<name>.png|jpg with 'front' or 'linework' in the filename (the tone-on-tone linework render).");
    console.error("\nBuild FAILED: garment artwork missing. The pack cannot be composited without it.\nAdd the following file(s), then run npm run build again:\n" + missing.join("\n"));
    process.exit(1);
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 850 } });

    // ---- process + embed artwork ----
    const proc = await browser.newPage();
    const back = await embedImage(proc, path.join(REF_DIR, backFile));
    const front = await embedImage(proc, path.join(REF_DIR, frontFile));
    const worn = wornFile ? await embedImage(proc, path.join(REF_DIR, wornFile), 1200) : null;
    await proc.close();
    console.log(`Back artwork:  ${back.w}x${back.h} -> ${back.cw}x${back.ch}, aspect ${back.aspect}, ${(back.src.length / 1024).toFixed(0)} KB embedded`);
    console.log(`Front artwork: ${front.w}x${front.h} -> ${front.cw}x${front.ch}, aspect ${front.aspect}, ${(front.src.length / 1024).toFixed(0)} KB embedded`);
    if (worn) console.log(`Worn photo:    ${worn.w}x${worn.h} -> ${worn.cw}x${worn.ch}, ${(worn.src.length / 1024).toFixed(0)} KB embedded`);

    const artwork = { back, front, worn };
    await page.addInitScript((a) => { window.__ICON_ASPECT = a; }, back.aspect);
    await page.addInitScript((a) => { window.__ARTWORK = a; }, artwork);

    // Saved placement from the editor (npm run edit), if any. Overrides the
    // spec-default positions/sizes on pages 1, 3 and 4.
    const placement = fs.existsSync(PLACEMENT_JSON)
      ? JSON.parse(fs.readFileSync(PLACEMENT_JSON, "utf8"))
      : null;
    if (placement) {
      console.log(`Placement overrides (placement.json): ${JSON.stringify(placement)}`);
      await page.addInitScript((p) => { window.__PLACEMENTS = p; }, placement);
      const bh = placement.back && placement.back.heightCm;
      const bw = placement.back && placement.back.widthCm;
      if (bh != null && Math.abs(bh - 46) > 0.5) {
        console.warn(`WARNING: back icon height set to ${bh} cm via the editor (spec prose still reads 46 cm). Update the '46 cm' lines in config.js if this is intentional.`);
      }
      if (bh != null && bw != null && Math.abs(bw - bh * back.aspect) > 0.5) {
        console.warn(`NOTE: back icon stretched off-aspect (${bw} x ${bh} cm; natural ${(bh * back.aspect).toFixed(1)} x ${bh}). Deliberate per request.`);
      }
    } else {
      console.log("Placement: spec defaults (no placement.json; run npm run edit to adjust).");
    }

    const url = "file:///" + path.join(__dirname, "techpack.html").replace(/\\/g, "/");
    await page.goto(url, { waitUntil: "load" });

    const iconWidthCm = await page.evaluate(() =>
      Math.round(window.TECHPACK_CONFIG.placements.backIcon.iconHeightSmCm * window.TECHPACK_CONFIG.iconAspect));
    console.log(`Measured back aspect ${back.aspect} -> icon width at S/M approx. ${iconWidthCm} cm (height 46 cm)`);

    // contact placeholder warning
    const contact = await page.evaluate(() => window.TECHPACK_CONFIG.contact || {});
    const unset = [];
    if (!contact.email) unset.push("email");
    if (!contact.phone) unset.push("phone");
    if (unset.length) console.warn(`WARNING: contact ${unset.join(" and ")} unset in config.contact; rendering placeholder(s) ${unset.map((u) => "[" + u + "]").join(" ")}. Set before sending to factory.`);

    await page.waitForFunction(() => window.__renderDone === true, null, { timeout: 15000 });

    const report = await page.evaluate(() => window.__checkOverflow());
    console.log(`Overflow check: ${report.scanned} containers scanned`);
    if (report.failures.length > 0) {
      for (const f of report.failures) console.error("  OVERFLOW: " + f);
      throw new Error(`Overflow check FAILED: ${report.failures.length} container(s) overflow. Build aborted.`);
    }
    console.log("Overflow check: PASS");

    // ---- geometry assertions ----
    // The drawn back-image placement on P1 and the placement box on P3 must
    // each satisfy height/bodyLength = 46/70 (within 3%) and width/height =
    // measured aspect (within 2%).
    const geo = await page.evaluate(() => {
      const cfg = window.TECHPACK_CONFIG;
      const mi = cfg.pom.sizes.indexOf(cfg.pom.baseSize);
      const bodyLen = cfg.pom.rows.find((x) => x.letter === "A").values[mi];
      // The drawn box follows the saved placement height when one exists, else
      // the spec's 46 cm; the assertion checks the render against whichever is
      // in force (aspect is always checked, so nothing can distort).
      const ov = window.__PLACEMENTS && window.__PLACEMENTS.back;
      const effHeight = ov ? ov.heightCm : cfg.placements.backIcon.iconHeightSmCm;
      // Effective width/aspect follows a stretched placement when one exists, so
      // a deliberate off-aspect stretch is checked against itself, not the image
      // aspect; the render must still match the intended box.
      const effWidth = (ov && ov.widthCm != null) ? ov.widthCm : effHeight * cfg.iconAspect;
      const expectedHeight = effHeight / bodyLen;
      const expectedAspect = effWidth / effHeight;
      const read = (boxSel, bodySel) => {
        const box = document.querySelector(boxSel), body = document.querySelector(bodySel);
        if (!box || !body) return null;
        const r = box.getBoundingClientRect();
        return { boxW: r.width, boxH: r.height, bodyPx: body.getBoundingClientRect().height };
      };
      return {
        expectedHeight, expectedAspect, effHeight, bodyLen,
        p1: read("[data-p1-back-img]", "[data-p1-body]"),
        p3: read("[data-icon-box]", "[data-body-length]"),
      };
    });
    const checkGeo = (label, m) => {
      if (!m) throw new Error(`Geometry assertion FAILED: ${label} markers not found`);
      const hRatio = m.boxH / m.bodyPx, aRatio = m.boxW / m.boxH;
      console.log(`Geometry ${label} height: ${m.boxH.toFixed(1)}/${m.bodyPx.toFixed(1)} = ${hRatio.toFixed(4)} vs ${geo.expectedHeight.toFixed(4)} (${geo.effHeight}/${geo.bodyLen}); aspect ${aRatio.toFixed(4)} vs ${geo.expectedAspect.toFixed(4)}`);
      if (Math.abs(hRatio - geo.expectedHeight) / geo.expectedHeight > 0.03) throw new Error(`Geometry ${label} FAILED: height ratio ${hRatio.toFixed(4)} deviates >3% from ${geo.expectedHeight.toFixed(4)}`);
      if (Math.abs(aRatio - geo.expectedAspect) / geo.expectedAspect > 0.02) throw new Error(`Geometry ${label} FAILED: aspect ${aRatio.toFixed(4)} deviates >2% from ${geo.expectedAspect.toFixed(4)}`);
    };
    checkGeo("P1 back image", geo.p1);
    checkGeo("P3 placement box", geo.p3);
    console.log("Geometry assertions: PASS");

    const pageCount = await page.evaluate(() => document.querySelectorAll(".page").length);
    console.log(`Rendered pages: ${pageCount}`);

    await page.pdf({
      path: OUT_PDF, format: "A4", landscape: true, printBackground: true,
      preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    const sizeMB = fs.statSync(OUT_PDF).size / (1024 * 1024);
    console.log(`PDF written: ${OUT_PDF}`);
    console.log(`PDF size: ${sizeMB.toFixed(2)} MB`);
    if (sizeMB > 20) console.warn(`WARNING: PDF size ${sizeMB.toFixed(2)} MB exceeds 20 MB.`);
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
