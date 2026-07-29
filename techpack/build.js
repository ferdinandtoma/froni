"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const root = __dirname;
const sourceDir = path.join(root, "src", "rev12");
const templatePath = path.join(sourceDir, "template.html");
const manifestPath = path.join(sourceDir, "assets.json");
const configPath = path.join(sourceDir, "config.js");
const distDir = path.join(root, "dist");

const sourceNames = [
  "config.js",
  "assets.json",
  "template.html",
  "styles.css",
  "diagrams.js",
  "render.js",
];

const exactAssets = [
  { key: "frontAuthority", relativePath: "assets/Froni_Edition_One_Front.png" },
  { key: "backArtworkAuthority", relativePath: "assets/pantocratorStCatherines_2023x3774.jpg" },
  { key: "approvedAsymmetryMap", relativePath: "assets/artwork/FRN001_Back_Icon_Asymmetry_Pins.jpg" },
  { key: "mirrorCompositeBlessing", relativePath: "assets/artwork/Pantocrator_Blessing_Side.jpg" },
  { key: "mirrorCompositeJudge", relativePath: "assets/artwork/Pantocrator_Judge_Side.jpg" },
  { key: "hoodExteriorReference", relativePath: "assets/Froni_Edition_One_IAM.jpg" },
  { key: "hoodInteriorReference", relativePath: "assets/Froni_Edition_One_IAM_Verse.jpg" },
  { key: "flatFront", relativePath: "assets/flats/FRN001_flat_front.png" },
  { key: "flatBack", relativePath: "assets/flats/FRN001_flat_back.png" },
  { key: "flatSide", relativePath: "assets/flats/FRN001_flat_side.png" },
  { key: "flatHoodUp", relativePath: "assets/flats/FRN001_flat_hood_up.png" },
  { key: "flatHoodDown", relativePath: "assets/flats/FRN001_flat_hood_down.png" },
  { key: "hoodExplodedIllustration", relativePath: "assets/flats/Froni_Hood_Exploded_Panels.png" },
  { key: "hoodCrossSectionIllustration", relativePath: "assets/flats/Froni_Hood_CrossSection.png" },
  { key: "careTapePreview", relativePath: "assets/artwork/Froni_Care_Tape_Preview.png" },
  { key: "hoodExteriorLetteringPreview", relativePath: "assets/artwork/Froni_Hood_Exterior_Lettering_Preview.png" },
  { key: "hoodInteriorLetteringPreview", relativePath: "assets/artwork/Froni_Hood_Interior_Verse_Preview.png" },
];

const exactDocuments = [
  { key: "backAcceptanceSheet", relativePath: "assets/artwork/Froni_FRN-001-E_Artwork_Sheet_Rev01.pdf", mimeType: "application/pdf", pageCount: 3 },
  { key: "careTapeArtwork", relativePath: "assets/artwork/Froni_Edition_One_Care_Tape_Draft_Rev01.svg", mimeType: "image/svg+xml" },
  { key: "hoodExteriorLettering", relativePath: "assets/artwork/Froni_Edition_One_Hood_Exterior_Lettering_Rev01.svg", mimeType: "image/svg+xml" },
  { key: "hoodInteriorLettering", relativePath: "assets/artwork/Froni_Edition_One_Hood_Interior_Verse_Rev01.svg", mimeType: "image/svg+xml" },
];

const fail = (message) => {
  throw new Error(message);
};

const digestText = (value) => Array.isArray(value) ? value.join("") : value;

const fileDigest = (filePath) => crypto
  .createHash("sha256")
  .update(fs.readFileSync(filePath))
  .digest("hex")
  .toUpperCase();

function checkSourceSet() {
  const missing = sourceNames.filter((name) => !fs.existsSync(path.join(sourceDir, name)));
  if (missing.length) fail(`Missing Revision 12 source files: ${missing.join(", ")}`);

  const blocked = [
    ["1", "5", "0"].join(""),
    ["chris", "togram"].join(""),
    ["woven", " neck label"].join(""),
    ["lux", "ury"].join(""),
    ["prem", "ium"].join(""),
    ["qual", "ity"].join(""),
  ];
  const longDash = String.fromCodePoint(0x2014);
  const shortDash = String.fromCodePoint(0x2013);
  for (const name of ["build.js", ...sourceNames]) {
    const filePath = name === "build.js" ? path.join(root, name) : path.join(sourceDir, name);
    const text = fs.readFileSync(filePath, "utf8");
    const lower = text.toLowerCase();
    if (text.includes(longDash)) fail(`${name} contains a prohibited dash glyph`);
    if (text.includes(shortDash)) fail(`${name} contains a prohibited dash glyph`);
    for (const term of blocked) {
      if (lower.includes(term)) fail(`${name} contains blocked source text: ${term}`);
    }
  }
}

function loadExactAssets() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const data = {};
  for (const expected of exactAssets) {
    const item = manifest[expected.key];
    if (!item || item.available !== true) fail(`${expected.key} is not recorded as available`);
    if (item.embeddedPath !== expected.relativePath) fail(`${expected.key} must use ${expected.relativePath}`);
    if (!item.sourcePath || !item.role || !item.mimeType || !item.width || !item.height || !item.sha256) {
      fail(`${expected.key} has incomplete authority metadata`);
    }
    const filePath = path.resolve(sourceDir, ...expected.relativePath.split("/"));
    const relative = path.relative(sourceDir, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`${expected.key} escapes the Revision 12 source directory`);
    if (!fs.existsSync(filePath)) fail(`${expected.key} exact asset copy is missing`);
    const actualDigest = fileDigest(filePath);
    const recordedDigest = digestText(item.sha256).toUpperCase();
    if (actualDigest !== recordedDigest) fail(`${expected.key} SHA-256 mismatch`);
    data[expected.key] = `data:${item.mimeType};base64,${fs.readFileSync(filePath).toString("base64")}`;
  }

  for (const expected of exactDocuments) {
    const item = manifest[expected.key];
    if (!item || item.available !== true) fail(`${expected.key} is not recorded as available`);
    if (item.embeddedPath !== expected.relativePath) fail(`${expected.key} must use ${expected.relativePath}`);
    if (!item.sourcePath || !item.role || item.mimeType !== expected.mimeType || !item.sha256) {
      fail(`${expected.key} has incomplete authority metadata`);
    }
    if (expected.pageCount && item.pageCount !== expected.pageCount) {
      fail(`${expected.key} page count does not match the authority record`);
    }
    const filePath = path.resolve(sourceDir, ...expected.relativePath.split("/"));
    const relative = path.relative(sourceDir, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`${expected.key} escapes the Revision 12 source directory`);
    if (!fs.existsSync(filePath)) fail(`${expected.key} exact document copy is missing`);
    const actualDigest = fileDigest(filePath);
    const recordedDigest = digestText(item.sha256).toUpperCase();
    if (actualDigest !== recordedDigest) fail(`${expected.key} SHA-256 mismatch`);
  }

  for (const key of ["frontProductionVector", "digitizedMasters"]) {
    if (!manifest[key] || manifest[key].available !== false) fail(`${key} must remain an explicit unavailable deliverable`);
  }

  return { manifest, data };
}

function inspectPdf(filePath) {
  const result = spawnSync("pdfinfo", [filePath], { encoding: "utf8", windowsHide: true });
  if (result.error && result.error.code === "ENOENT") return { pages: null, tool: "unavailable" };
  if (result.status !== 0) fail(`pdfinfo failed for temporary PDF: ${(result.stderr || result.stdout || "unknown error").trim()}`);
  const match = result.stdout.match(/^Pages:\s+(\d+)$/m);
  if (!match) fail("pdfinfo did not report a page count for the temporary PDF");
  return { pages: Number(match[1]), tool: "pdfinfo" };
}

async function build() {
  checkSourceSet();
  const config = require(configPath);
  if (config.meta.revision !== "12" || config.pages.length !== 14) fail("Document control is not Revision 12 with 14 pages");
  const assets = loadExactAssets();
  const outputPath = path.join(distDir, config.meta.outputFilename);
  const temporaryPath = path.join(distDir, `.${config.meta.outputFilename}.${process.pid}.${Date.now()}.tmp`);
  fs.mkdirSync(distDir, { recursive: true });

  const browserErrors = [];
  let browser;
  let audit;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1403, height: 992 }, deviceScaleFactor: 1 });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    await page.addInitScript({ content: `window.REV12_ASSETS = ${JSON.stringify(assets)};` });
    await page.goto(pathToFileURL(templatePath).href, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => window.__REV12_RENDER_DONE === true, null, { timeout: 30000 });

    if (browserErrors.length) fail(`Browser errors:\n${browserErrors.join("\n")}`);

    const imageDimensions = await page.evaluate(() => [...document.querySelectorAll("[data-asset-key]")].map((card) => {
      const image = card.querySelector("img");
      return {
        key: card.dataset.assetKey,
        width: image ? image.naturalWidth : 0,
        height: image ? image.naturalHeight : 0,
      };
    }));
    for (const image of imageDimensions) {
      const expected = assets.manifest[image.key];
      if (!expected || image.width !== expected.width || image.height !== expected.height) {
        fail(`${image.key} rendered dimensions ${image.width}x${image.height} do not match the manifest`);
      }
    }

    audit = await page.evaluate(() => window.__rev12Audit());
    const auditFailures = [
      ...audit.overflowFailures,
      ...audit.safeMarginFailures,
      ...audit.markerFailures,
      ...audit.contentFailures,
    ];
    if (auditFailures.length) fail(`Revision 12 DOM audit failed:\n${auditFailures.join("\n")}`);

    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: temporaryPath,
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
  } catch (error) {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath, { force: true });
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  const temporaryStat = fs.statSync(temporaryPath);
  if (temporaryStat.size < 100000) {
    fs.rmSync(temporaryPath, { force: true });
    fail(`Temporary PDF is unexpectedly small: ${temporaryStat.size} bytes`);
  }
  const pdfInspection = inspectPdf(temporaryPath);
  if (pdfInspection.pages !== null && pdfInspection.pages !== 14) {
    fs.rmSync(temporaryPath, { force: true });
    fail(`Temporary PDF has ${pdfInspection.pages} pages instead of 14`);
  }

  fs.renameSync(temporaryPath, outputPath);
  const finalStat = fs.statSync(outputPath);
  console.log(`Revision 12 source checks: ${sourceNames.length + 1} files`);
  console.log(`Exact authority and approved-flat assets embedded: ${exactAssets.length}`);
  console.log(`Exact authority documents packaged: ${exactDocuments.length}`);
  console.log(`DOM audit: ${audit.pageCount} pages, ${audit.scannedBoxes} boxes, no failures`);
  console.log(`Semantic views: ${audit.views.join(", ")}`);
  console.log(`Construction locations: ${audit.locations.join(", ")}`);
  console.log(`Temporary PDF inspection: ${pdfInspection.pages ?? audit.pageCount} pages via ${pdfInspection.tool}`);
  console.log(`Output: ${outputPath}`);
  console.log(`Size: ${finalStat.size} bytes`);
}

build().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
