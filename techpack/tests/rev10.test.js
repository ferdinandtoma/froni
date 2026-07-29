"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const absolute = (relativePath) => path.join(root, relativePath);
const revisionEntry = "Hood assembly illustrations replaced with drawn illustrations; register corrections applied.";

const sourceFiles = [
  "config.js",
  "assets.json",
  "template.html",
  "styles.css",
  "diagrams.js",
  "render.js",
];

const hoodAssets = {
  hoodExplodedIllustration: "Froni_Hood_Exploded_Panels.png",
  hoodCrossSectionIllustration: "Froni_Hood_CrossSection.png",
};

const loadConfig = (revision) => {
  const filePath = absolute(`src/${revision}/config.js`);
  delete require.cache[require.resolve(filePath)];
  return require(filePath);
};

const loadAssets = (revision) => JSON.parse(
  fs.readFileSync(absolute(`src/${revision}/assets.json`), "utf8"),
);

const loadBrowserModule = (relativePath, exportName) => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(absolute(relativePath), "utf8"), context);
  return context.window[exportName];
};

const sha256 = (filePath) => crypto
  .createHash("sha256")
  .update(fs.readFileSync(filePath))
  .digest("hex")
  .toUpperCase();

const occurrences = (text, value) => text.split(value).length - 1;

const pngDimensions = (filePath) => {
  const bytes = fs.readFileSync(filePath);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

test("retains a complete Revision 10 source and both hood illustrations", () => {
  const missing = sourceFiles.filter((name) => !fs.existsSync(absolute(`src/rev10/${name}`)));
  assert.deepEqual(missing, [], `missing Revision 10 source files: ${missing.join(", ")}`);

  const templateText = fs.readFileSync(absolute("src/rev10/template.html"), "utf8");
  const assetsText = fs.readFileSync(absolute("src/rev10/assets.json"), "utf8");
  assert.match(assetsText, /Froni_Hood_Exploded_Panels\.png/);
  assert.match(assetsText, /Froni_Hood_CrossSection\.png/);
  assert.match(templateText, /Revision 10/);
});

test("changes only the specified configuration prose and Revision 10 control fields", () => {
  const previous = loadConfig("rev09");
  const current = loadConfig("rev10");

  assert.equal(current.meta.revision, "10");
  assert.equal(current.meta.buildDate, "20 Jul 2026");
  assert.equal(current.meta.outputFilename, "Froni_FRN-001_Tech_Pack_Rev10.pdf");
  assert.equal(current.revisionRecord[0], revisionEntry);
  assert.equal(current.revisionRecord.filter((entry) => entry === revisionEntry).length, 1);
  assert.equal(current.developmentStatus, "Bulk cutting may begin only after all six listed approvals are recorded.");
  assert.equal(current.artwork.front.authority, "The supplied front design reference photograph controls the ornament. The cross is centered.");
  assert.equal(current.artwork.front.placement, "Centered on the approved front-panel pattern. Final embroidery geometry follows the production vector and the approved pattern.");
  assert.equal(current.artwork.back.authority, "The Saint Catherine's scan controls the face. Mirrored or regenerated images are not accepted as artwork authority.");
  assert.equal(current.artwork.hoodExterior.reference, "The supplied hood photograph controls the intended embroidered appearance and confirms the upright vertical stack.");

  const normalized = structuredClone(current);
  normalized.meta = structuredClone(previous.meta);
  normalized.developmentStatus = previous.developmentStatus;
  normalized.revisionRecord = normalized.revisionRecord.slice(1).map((entry) =>
    entry.replace("wording revised throughout", "full plain-register language pass"));
  normalized.artwork.front.authority = previous.artwork.front.authority;
  normalized.artwork.front.placement = previous.artwork.front.placement;
  normalized.artwork.back.authority = previous.artwork.back.authority;
  normalized.artwork.hoodExterior.reference = previous.artwork.hoodExterior.reference;
  assert.deepEqual(normalized, previous, "configuration changed beyond the exact register and control edits");
});

test("applies every exact register correction and removes every prohibited legacy phrase", () => {
  const sourceText = sourceFiles
    .map((name) => fs.readFileSync(absolute(`src/rev10/${name}`), "utf8"))
    .join("\n");

  const removed = [
    "This custom-development pack is not ready for bulk cutting.",
    "The factory may use this pack to decide whether to accept the fully custom cut-and-sew development and to quote development, sampling, embroidery setup, lead times, and a provisional bulk unit price.",
    "full plain-register language pass",
    "New method key",
    "Missing pattern-defining point of measurement",
    "House presentation components are outside the garment manufacturing bill of materials.",
    "The user-supplied front design reference photograph controls the ornament.",
    "The user-supplied hood photograph controls the intended embroidered appearance",
    "The cross remains centered by the current design decision.",
    "Final embroidery geometry waits for the production vector and approved pattern.",
    "Generated or mirrored renders do not replace the artwork authority.",
    "Revision 09",
    "17 Jul 2026",
    "\u2014",
  ];
  for (const phrase of removed) assert.equal(sourceText.includes(phrase), false, `legacy source text remains: ${phrase}`);

  const required = [
    "This pack is the basis for the acceptance decision and for quoting development, sampling, embroidery setup, lead times, and a provisional bulk unit price.",
    "wording revised throughout",
    "Pattern-defining point of measurement",
    "No other packaging is part of this bill of materials.",
    "The supplied front design reference photograph controls the ornament.",
    "The supplied hood photograph controls the intended embroidered appearance",
    "The cross is centered.",
    "Final embroidery geometry follows the production vector and the approved pattern.",
    "Mirrored or regenerated images are not accepted as artwork authority.",
  ];
  for (const phrase of required) assert.equal(sourceText.includes(phrase), true, `required source text is missing: ${phrase}`);
  assert.equal(occurrences(sourceText, "Method key"), 2);
});

test("embeds the two standardized PNG hood illustrations exactly", () => {
  const previous = loadAssets("rev09");
  const current = loadAssets("rev10");
  for (const [key, value] of Object.entries(previous)) {
    if (key === "backArtworkAuthority") continue;
    assert.deepEqual(current[key], value, `unrelated asset declaration changed: ${key}`);
  }
  assert.deepEqual(current.backArtworkAuthority, {
    ...previous.backArtworkAuthority,
    role: "Back icon artwork authority",
  });

  for (const [key, filename] of Object.entries(hoodAssets)) {
    const item = current[key];
    assert.ok(item, `missing asset declaration: ${key}`);
    assert.equal(item.sourcePath, `C:\\cipher\\techpack\\reference\\flats\\${filename}`);
    assert.equal(item.embeddedPath, `assets/flats/${filename}`);
    assert.equal(item.mimeType, "image/png");
    assert.equal(item.width, 1376);
    assert.equal(item.height, 768);
    assert.equal(item.available, true);

    const reference = absolute(`reference/flats/${filename}`);
    const embedded = absolute(`src/rev10/assets/flats/${filename}`);
    assert.equal(fs.existsSync(reference), true, `missing final reference asset: ${filename}`);
    assert.equal(fs.existsSync(embedded), true, `missing embedded asset: ${filename}`);
    assert.deepEqual(pngDimensions(reference), { width: 1376, height: 768 });
    assert.deepEqual(pngDimensions(embedded), { width: 1376, height: 768 });
    assert.equal(sha256(reference), item.sha256);
    assert.equal(sha256(embedded), item.sha256);
  }

  assert.equal(fs.existsSync("C:\\Users\\tomaf\\Downloads\\8a984877-8909-426c-a774-a7b7f064aac7.jpeg"), false);
  assert.equal(fs.existsSync("C:\\Users\\tomaf\\Downloads\\01720ea7-c977-4d9a-a62d-e40412fe2bff.jpeg"), false);
});

test("rebuilds Page 5 from the approved images with six labels and two assembly arrows", () => {
  const renderText = fs.readFileSync(absolute("src/rev10/render.js"), "utf8");
  const diagramsText = fs.readFileSync(absolute("src/rev10/diagrams.js"), "utf8");
  const start = renderText.indexOf("const renderHoodAssembly");
  const end = renderText.indexOf("const renderConstruction", start);
  const pageFive = renderText.slice(start, end);

  for (const text of [
    "Exploded three-panel hood",
    "Double-layer assembly cross-section",
    "Left side panel",
    "Center gusset",
    "Right side panel",
    "Outer self-fabric layer",
    "Embroidery back concealed inside assembly",
    "Inner self-fabric layer",
    "Outer and inner geometry, control points, and notches are derived from the approved pattern",
    "Finished hood assembly attaches to approved neckline seam",
  ]) assert.equal(pageFive.includes(text), true, `Page 5 text missing: ${text}`);

  assert.match(pageFive, /"hoodExplodedIllustration"/);
  assert.match(pageFive, /"hoodCrossSectionIllustration"/);
  assert.match(renderText, /src="\$\{A\.data\[key\]\}"/);
  assert.equal(occurrences(pageFive, "data-hood-label="), 6);
  assert.equal(occurrences(pageFive, "data-assembly-arrow="), 2);
  assert.doesNotMatch(pageFive, /D\.hoodExploded\(\)|D\.hoodCrossSection\(\)/);
  assert.doesNotMatch(diagramsText, /hoodExploded|hoodCrossSection|data-panel="hood-side-left"|data-layer="outer-self-fabric"/);
});

test("keeps the Page 10 scan title while changing only its Role line", () => {
  const assets = loadAssets("rev10");
  const configText = fs.readFileSync(absolute("src/rev10/config.js"), "utf8");
  const renderText = fs.readFileSync(absolute("src/rev10/render.js"), "utf8");
  assert.equal(assets.backArtworkAuthority.role, "Back icon artwork authority");
  assert.match(renderText, /assetCard\("backArtworkAuthority", "Saint Catherine's scan"\)/);
  assert.match(renderText, /<p><strong>Role:<\/strong> \$\{esc\(item\.role\)\}<\/p>/);
  assert.match(configText, /The Saint Catherine's scan controls the face\./);
  assert.equal(occurrences(renderText, "Back icon artwork authority"), 0, "Role text must come from manifest data only");
});

test("keeps all non-Page-5 diagram outputs unchanged", () => {
  const previous = loadBrowserModule("src/rev09/diagrams.js", "REV09_DIAGRAMS");
  const current = loadBrowserModule("src/rev10/diagrams.js", "REV10_DIAGRAMS");
  assert.equal(current.bodyPom(), previous.bodyPom());
  assert.equal(current.hoodRibPom(), previous.hoodRibPom());
  assert.equal(current.placementLocator("front"), previous.placementLocator("front"));
  assert.equal(current.placementLocator("back"), previous.placementLocator("back"));
});
