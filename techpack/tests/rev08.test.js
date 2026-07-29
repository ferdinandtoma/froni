"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const revisionSourceFiles = [
  "src/rev08/config.js",
  "src/rev08/assets.json",
  "src/rev08/template.html",
  "src/rev08/styles.css",
  "src/rev08/flats.js",
  "src/rev08/diagrams.js",
  "src/rev08/render.js",
];

const absolute = (relativePath) => path.join(root, relativePath);

const loadConfig = (revision) => {
  const configPath = absolute(`src/${revision}/config.js`);
  delete require.cache[require.resolve(configPath)];
  return require(configPath);
};

const loadAssets = (revision) => JSON.parse(
  fs.readFileSync(absolute(`src/${revision}/assets.json`), "utf8"),
);

const sha256 = (filePath) => require("node:crypto")
  .createHash("sha256")
  .update(fs.readFileSync(filePath))
  .digest("hex")
  .toUpperCase();

const loadBrowserModule = (relativePath, exportName) => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(absolute(relativePath), "utf8"), context);
  return context.window[exportName];
};

const collectStrings = (value, strings = []) => {
  if (typeof value === "string") strings.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, strings));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, strings));
  return strings;
};

const numericTokens = (value) => collectStrings(value)
  .flatMap((text) => text.match(/\d+(?:\.\d+)?/g) || [])
  .concat((() => {
    const tokens = [];
    const visit = (item) => {
      if (typeof item === "number") tokens.push(String(item));
      else if (Array.isArray(item)) item.forEach(visit);
      else if (item && typeof item === "object") Object.values(item).forEach(visit);
    };
    visit(value);
    return tokens;
  })());

test("selects a complete Revision 08 source set", () => {
  const missing = revisionSourceFiles.filter((file) => !fs.existsSync(absolute(file)));
  assert.deepEqual(missing, [], `missing Revision 08 source files: ${missing.join(", ")}`);
});

test("runs both retained Revision 07 and active Revision 08 tests", () => {
  const packageJson = JSON.parse(fs.readFileSync(absolute("package.json"), "utf8"));
  assert.equal(packageJson.scripts.test, "node --test tests/*.test.js");
});

test("uses Revision 08 document control without changing page order", () => {
  const previous = loadConfig("rev07");
  const current = loadConfig("rev08");
  assert.equal(current.meta.documentId, "FRN-001");
  assert.equal(current.meta.revision, "08");
  assert.equal(current.meta.buildDate, "16 Jul 2026");
  assert.equal(current.meta.outputFilename, "Froni_FRN-001_Tech_Pack_Rev08.pdf");
  assert.deepEqual(
    current.pages.map(({ number, type }) => ({ number, type })),
    previous.pages.map(({ number, type }) => ({ number, type })),
  );
  assert.equal(current.pages.length, 14);
  assert.ok(current.revisionRecord.includes(
    "Set-in sleeve flats corrected; flat labels converted to coded callouts; interior verse locator image added; full plain-register language pass.",
  ));
});

test("embeds the supplied interior hood reference under the required filename", () => {
  const assets = loadAssets("rev08");
  const item = assets.hoodInteriorReference;
  assert.ok(item);
  assert.equal(item.role, "Interior hood verse placement reference photograph");
  assert.equal(item.sourcePath, "C:\\Users\\tomaf\\Downloads\\comp_hood.jpeg");
  assert.equal(item.embeddedPath, "assets/Froni_Edition_One_IAM_Verse.jpg");
  assert.equal(item.mimeType, "image/jpeg");
  assert.equal(item.width, 4096);
  assert.equal(item.height, 4096);
  assert.equal(item.sha256, "E5686F731F85D03FD98116AA3FF4F3506F60DFDB52EFB05F6F66E056B0E04A94");
  assert.equal(item.available, true);
  const embedded = absolute(`src/rev08/${item.embeddedPath}`);
  assert.equal(fs.existsSync(embedded), true);
  assert.equal(sha256(embedded), item.sha256);

  const buildText = fs.readFileSync(absolute("build.js"), "utf8");
  const renderText = fs.readFileSync(absolute("src/rev08/render.js"), "utf8");
  assert.match(buildText, /hoodInteriorReference/);
  assert.match(buildText, /Froni_Edition_One_IAM_Verse\.jpg/);
  assert.match(renderText, /data-asset-key="hoodInteriorReference"/);
  assert.match(renderText, /A\.data\.hoodInteriorReference/);
});

test("adds the interior reference block without altering its specification bullets", () => {
  const previous = loadConfig("rev07");
  const current = loadConfig("rev08");
  assert.equal(current.artwork.hoodInterior.unit, previous.artwork.hoodInterior.unit);
  assert.equal(current.artwork.hoodInterior.placement, previous.artwork.hoodInterior.placement);
  assert.deepEqual(current.artwork.hoodInterior.lettering, previous.artwork.hoodInterior.lettering);
  assert.equal(current.artwork.hoodInterior.note, previous.artwork.hoodInterior.note);
  assert.equal(
    current.artwork.hoodInterior.reference,
    "The photograph shows intended interior verse placement and proportion only.",
  );
});

test("redraws front, back, and side flats as full-length set-in sleeve views", () => {
  const flatText = fs.readFileSync(absolute("src/rev08/flats.js"), "utf8");
  assert.equal((flatText.match(/data-construction="set-in"/g) || []).length, 3);
  assert.equal((flatText.match(/data-sleeve-length="full"/g) || []).length, 3);
  assert.equal((flatText.match(/data-seam-origin="shoulder-point"/g) || []).length, 3);
  for (const field of [
    'data-body-length-cm="70"',
    'data-half-chest-cm="59"',
    'data-sleeve-cm="58"',
    'data-shoulder-cm="19"',
    'data-hem-rib-cm="6"',
    'data-cuff-rib-cm="6"',
  ]) {
    assert.equal((flatText.match(new RegExp(field, "g")) || []).length, 3, `missing M-basis field ${field}`);
  }
  assert.doesNotMatch(flatText, /raglan/i);
  for (const expectedHoodPath of [
    "M91 62 Q83 34 99 16 Q120 2 141 16 Q157 34 149 62 Q120 79 91 62 Z",
    "M86 63 Q86 31 101 17 Q120 6 139 17 Q154 31 154 63 Q120 83 86 63 Z",
    "M103 60 Q92 34 105 14 Q132 1 149 23 Q158 43 147 65 Q130 76 103 60 Z",
  ]) assert.ok(flatText.includes(expectedHoodPath), `hood geometry changed: ${expectedHoodPath}`);
  for (const expectedAttachmentPath of [
    "M91 61 Q120 84 149 61",
    "M91 61 Q120 72 149 61",
    "M101 62 Q119 72 137 60",
  ]) assert.ok(flatText.includes(expectedAttachmentPath), `hood attachment changed: ${expectedAttachmentPath}`);
});

test("uses coded or outside labels on every affected flat and schematic", () => {
  const flatText = fs.readFileSync(absolute("src/rev08/flats.js"), "utf8");
  const diagramText = fs.readFileSync(absolute("src/rev08/diagrams.js"), "utf8");
  const renderText = fs.readFileSync(absolute("src/rev08/render.js"), "utf8");
  const flats = loadBrowserModule("src/rev08/flats.js", "REV08_FLATS");
  const diagrams = loadBrowserModule("src/rev08/diagrams.js", "REV08_DIAGRAMS");
  const flatMarkup = Object.values(flats).map((draw) => draw()).join("\n");
  const diagramMarkup = [
    diagrams.hoodExploded(), diagrams.hoodCrossSection(), diagrams.bodyPom(), diagrams.hoodRibPom(),
  ].join("\n");
  for (const phrase of ["Cuff rib", "Hem rib", "Center gusset", "Three panels", "Attachment line"]) {
    assert.doesNotMatch(flatMarkup, new RegExp(`<text[^>]*>[^<]*${phrase}`, "i"));
  }
  assert.doesNotMatch(diagramMarkup, /<text[^>]*>\s*(?:Cuff rib|Hem rib)\s*<\/text>/i);
  for (const code of ["C1", "C2", "C3", "C4", "C5"]) assert.match(flatMarkup, new RegExp(`>${code}<`));
  assert.match(diagramMarkup, />R1</);
  assert.match(diagramMarkup, />R2</);
  assert.match(renderText, /C1 Cuff rib/);
  assert.match(renderText, /C5 Hood attachment line/);
  assert.match(renderText, /R1 Cuff rib/);
  assert.match(renderText, /R2 Hem rib/);
  assert.match(diagramText, /data-label-position="outside"/);
  assert.match(diagramText, /class="label-leader"/);
});

test("enforces the plain register on every rendered page", () => {
  const current = loadConfig("rev08");
  const prose = collectStrings(current).join("\n");
  const sourceText = revisionSourceFiles
    .map((file) => fs.readFileSync(absolute(file), "utf8"))
    .join("\n");
  const banned = [
    "canonical", "please", "kindly", "it is important", "note that", "in order to",
    "ensure", "comprehensive", "robust", "seamless", "leverage", "utilize",
  ];
  for (const term of banned) {
    assert.equal(prose.toLowerCase().includes(term), false, `config prose contains ${term}`);
    assert.equal(sourceText.toLowerCase().includes(term), false, `Revision 08 source contains ${term}`);
  }
  for (const acronym of ["POM", "BOM", "PPS", "SPI", "QC"]) {
    assert.doesNotMatch(sourceText, new RegExp(`\\b${acronym}\\b`), `expand ${acronym} in visible prose`);
  }
  assert.equal(sourceText.includes(String.fromCodePoint(0x2014)), false);
  assert.equal(/\bbecause\b/i.test(prose), false, "requirements must state responsibility without explanatory phrasing");
  assert.equal(collectStrings(current).filter((text) => text.includes("?")).length, 0);

  const renderText = fs.readFileSync(absolute("src/rev08/render.js"), "utf8");
  assert.match(renderText, /registerFragments/);
  assert.match(renderText, /questionMarks/);
  assert.match(renderText, /page\.dataset\.pageNumber !== "14"/);
});

test("preserves all numeric specification data", () => {
  const previous = loadConfig("rev07");
  const current = loadConfig("rev08");
  assert.deepEqual(
    current.pom.existing.map(({ code, targets, tolerance }) => ({ code, targets, tolerance })),
    previous.pom.existing.map(({ code, targets, tolerance }) => ({ code, targets, tolerance })),
  );
  assert.deepEqual(current.bom.map((row) => row.item), previous.bom.map((row) => row.item));
  assert.deepEqual(current.embroidery.setup.map((row) => row[0]), previous.embroidery.setup.map((row) => row[0]));
  for (const section of ["pom", "bom"]) {
    assert.deepEqual(numericTokens(current[section]), numericTokens(previous[section]), `${section} numeric tokens changed`);
  }
  assert.deepEqual(numericTokens(current.embroidery.setup), numericTokens(previous.embroidery.setup));
  assert.deepEqual(numericTokens(current.embroidery.backBudget), numericTokens(previous.embroidery.backBudget));
  assert.deepEqual(numericTokens(current.artwork.hoodExterior), numericTokens(previous.artwork.hoodExterior));
  const { reference: interiorReference, ...currentInterior } = current.artwork.hoodInterior;
  assert.equal(interiorReference, "The photograph shows intended interior verse placement and proportion only.");
  assert.deepEqual(numericTokens(currentInterior), numericTokens(previous.artwork.hoodInterior));
});

test("preserves factory-cost causation for embroidery execution faults", () => {
  const current = loadConfig("rev08");
  assert.ok(current.embroidery.ownership.includes(
    "The garment factory bears the cost of strike-offs repeated due to embroidery execution faults.",
  ));
});

test("states the no-new-target requirement once without doubled emphasis", () => {
  const renderText = fs.readFileSync(absolute("src/rev08/render.js"), "utf8");
  assert.doesNotMatch(renderText, /Every row remains without a new target value\./);
  assert.match(renderText, /No new target number is authorized\./);
});
