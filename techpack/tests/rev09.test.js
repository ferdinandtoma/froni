"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const absolute = (relativePath) => path.join(root, relativePath);
const revisionSourceFiles = [
  "src/rev09/config.js",
  "src/rev09/assets.json",
  "src/rev09/template.html",
  "src/rev09/styles.css",
  "src/rev09/diagrams.js",
  "src/rev09/render.js",
];
const revisionEntry = "Construction flats replaced with approved drawn flats; coded callouts repositioned.";

const flatAssets = {
  flatFront: {
    filename: "FRN001_flat_front.png",
    width: 896,
    height: 1200,
    sha256: "1E52625D4883CF56E6680A30342E3B42A0D8DACF6C199E40D626B47AF0D5B42A",
  },
  flatBack: {
    filename: "FRN001_flat_back.png",
    width: 896,
    height: 1200,
    sha256: "EF88135E25FE14BB0FAF7FFAAA8EE1743074280068FB2F773F37E85494828AF8",
  },
  flatSide: {
    filename: "FRN001_flat_side.png",
    width: 896,
    height: 1200,
    sha256: "F37D553C6BCD7EB64E057540318986E041A509EA9873D0A462199D9F89B511BB",
  },
  flatHoodUp: {
    filename: "FRN001_flat_hood_up.png",
    width: 896,
    height: 1118,
    sha256: "6ED9A68972304F852AE3DC7241527B537A680C0D4139A98BD5756D9AAFED7670",
  },
  flatHoodDown: {
    filename: "FRN001_flat_hood_down.png",
    width: 896,
    height: 912,
    sha256: "23F1B9A9F82F581E06014DC31F80363F1B3868AF6B3DBC0ABBEBDA6084A4EF62",
  },
};

const assertRevisionSourceExists = () => {
  assert.equal(
    fs.existsSync(absolute("src/rev09/config.js")),
    true,
    "Revision 09 implementation is missing",
  );
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

test("selects a complete Revision 09 raster-flat source set", () => {
  const missing = revisionSourceFiles.filter((file) => !fs.existsSync(absolute(file)));
  assert.deepEqual(missing, [], `missing Revision 09 source files: ${missing.join(", ")}`);
  assert.equal(fs.existsSync(absolute("src/rev09/flats.js")), false, "legacy flat renderer must not remain active");

  const templateText = fs.readFileSync(absolute("src/rev09/template.html"), "utf8");
  assert.match(templateText, /Revision 09/);
  assert.doesNotMatch(templateText, /flats\.js/);
});

test("changes only Revision 09 control fields and one revision record entry", () => {
  assertRevisionSourceExists();
  const previous = loadConfig("rev08");
  const current = loadConfig("rev09");
  assert.equal(current.meta.revision, "09");
  assert.equal(current.meta.buildDate, "17 Jul 2026");
  assert.equal(current.meta.outputFilename, "Froni_FRN-001_Tech_Pack_Rev09.pdf");
  assert.equal(current.revisionRecord[0], revisionEntry);
  assert.equal(current.revisionRecord.filter((entry) => entry === revisionEntry).length, 1);

  const normalizedCurrent = structuredClone(current);
  normalizedCurrent.meta.revision = previous.meta.revision;
  normalizedCurrent.meta.buildDate = previous.meta.buildDate;
  normalizedCurrent.meta.outputFilename = previous.meta.outputFilename;
  normalizedCurrent.revisionRecord = normalizedCurrent.revisionRecord.slice(1);
  assert.deepEqual(normalizedCurrent, previous, "prose, page order, or specification data changed outside revision control");
});

test("embeds all five approved PNGs byte-for-byte with exact dimensions", () => {
  assertRevisionSourceExists();
  const assets08 = loadAssets("rev08");
  const assets09 = loadAssets("rev09");
  for (const [key, item08] of Object.entries(assets08)) {
    assert.deepEqual(assets09[key], item08, `existing asset declaration changed: ${key}`);
  }

  for (const [key, expected] of Object.entries(flatAssets)) {
    const item = assets09[key];
    assert.ok(item, `missing asset declaration: ${key}`);
    assert.equal(item.sourcePath, `C:\\cipher\\techpack\\reference\\flats\\${expected.filename}`);
    assert.equal(item.embeddedPath, `assets/flats/${expected.filename}`);
    assert.equal(item.mimeType, "image/png");
    assert.equal(item.width, expected.width);
    assert.equal(item.height, expected.height);
    assert.equal(item.sha256, expected.sha256);
    assert.equal(item.available, true);

    const source = absolute(`reference/flats/${expected.filename}`);
    const embedded = absolute(`src/rev09/assets/flats/${expected.filename}`);
    assert.equal(fs.existsSync(source), true, `approved source is missing: ${expected.filename}`);
    assert.equal(fs.existsSync(embedded), true, `embedded copy is missing: ${expected.filename}`);
    assert.equal(sha256(source), expected.sha256);
    assert.equal(sha256(embedded), expected.sha256);
  }
});

test("renders the five approved images with aspect-preserving scaling", () => {
  assertRevisionSourceExists();
  const renderText = fs.readFileSync(absolute("src/rev09/render.js"), "utf8");
  const stylesText = fs.readFileSync(absolute("src/rev09/styles.css"), "utf8");
  for (const [key] of Object.entries(flatAssets)) {
    assert.match(renderText, new RegExp(`data-asset-key=["']${key}["']`));
    assert.match(renderText, new RegExp(`A\\.data\\.${key}`));
  }
  const baseImageRule = stylesText.match(/\.approved-flat-image\s*\{([^}]*)\}/s);
  assert.ok(baseImageRule, "approved flat image rule is missing");
  assert.match(baseImageRule[1], /object-fit:\s*contain;/);
  assert.doesNotMatch(baseImageRule[1], /(?:filter|clip-path|object-fit:\s*(?:cover|fill)|transform\s*:)/);
  assert.match(stylesText, /\.hood-pair[^}]*--flat-pair-scale:/s);
});

test("positions coded markers outside the raster with thin feature leaders", () => {
  assertRevisionSourceExists();
  const renderText = fs.readFileSync(absolute("src/rev09/render.js"), "utf8");
  const stylesText = fs.readFileSync(absolute("src/rev09/styles.css"), "utf8");
  for (const code of ["C1", "C2", "C3", "C4", "C5"]) {
    assert.match(renderText, new RegExp(`data-callout-code=["']${code}["']`));
  }
  assert.equal((renderText.match(/data-callout-code="C1"/g) || []).length, 2);
  assert.equal((renderText.match(/data-callout-code="C2"/g) || []).length, 2);
  assert.equal((renderText.match(/data-callout-code="C3"/g) || []).length, 1);
  assert.equal((renderText.match(/data-callout-code="C4"/g) || []).length, 1);
  assert.equal((renderText.match(/data-callout-code="C5"/g) || []).length, 1);
  assert.equal((renderText.match(/class="flat-callout-line"/g) || []).length, 7);
  assert.match(stylesText, /\.flat-callout-line\s*\{[^}]*stroke-width:\s*0\.45;/s);
  assert.doesNotMatch(renderText, /REV09_FLATS|F\.front\(|F\.back\(|F\.side\(|F\.hoodUp\(|F\.hoodDown\(/);
});

test("keeps page 3 and 4 captions, legends, and disclaimers unchanged", () => {
  assertRevisionSourceExists();
  const previousRender = fs.readFileSync(absolute("src/rev08/render.js"), "utf8");
  const previousFlats = fs.readFileSync(absolute("src/rev08/flats.js"), "utf8");
  const current = fs.readFileSync(absolute("src/rev09/render.js"), "utf8");
  const captions = [
    "Front view",
    "Back view",
    "Side view",
    "Hood-up view",
    "Hood-down view",
  ];
  const unchangedRenderCopy = [
    "Coded callouts:</strong> C1 Cuff rib; C2 Hem rib; C3 Center gusset.",
    "Coded callouts:</strong> C1 Cuff rib; C2 Hem rib; C4 Three-panel hood; C5 Hood attachment line.",
    "Construction locations and panel boundaries are identified for factory review.",
    "Hood volume and drape are finalized from the approved physical fit sample.",
  ];
  for (const text of captions) {
    assert.equal(previousFlats.includes(text), true, `Revision 08 baseline caption is missing: ${text}`);
    assert.equal(current.includes(text), true, `Revision 09 changed or removed caption: ${text}`);
  }
  for (const text of unchangedRenderCopy) {
    assert.equal(previousRender.includes(text), true, `Revision 08 baseline text is missing: ${text}`);
    assert.equal(current.includes(text), true, `Revision 09 changed or removed text: ${text}`);
  }
});

test("keeps page 5 hood drawings byte-equivalent at render time", () => {
  assertRevisionSourceExists();
  const previous = loadBrowserModule("src/rev08/diagrams.js", "REV08_DIAGRAMS");
  const current = loadBrowserModule("src/rev09/diagrams.js", "REV09_DIAGRAMS");
  assert.equal(current.hoodExploded(), previous.hoodExploded());
  assert.equal(current.hoodCrossSection(), previous.hoodCrossSection());

  const renderText = fs.readFileSync(absolute("src/rev09/render.js"), "utf8");
  const start = renderText.indexOf("const renderHoodAssembly");
  const end = renderText.indexOf("const renderConstruction", start);
  const pageFiveBlock = renderText.slice(start, end);
  assert.match(pageFiveBlock, /D\.hoodExploded\(\)/);
  assert.match(pageFiveBlock, /D\.hoodCrossSection\(\)/);
  assert.doesNotMatch(pageFiveBlock, /approved-flat|<img|data-asset-key/);
});

test("audits Revision 09 footers and approved raster-only pages", () => {
  assertRevisionSourceExists();
  const renderText = fs.readFileSync(absolute("src/rev09/render.js"), "utf8");
  assert.match(renderText, /footer\.textContent\.includes\(`Revision \$\{C\.meta\.revision\}`\)/);
  assert.match(renderText, /"Revision 09"/);
  assert.match(renderText, /page\.dataset\.pageNumber === "5"/);
  assert.match(renderText, /querySelectorAll\("\[data-approved-flat='true'\]"\)\.length !== 5/);
});
