"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const sourceFiles = [
  "build.js",
  "src/rev07/config.js",
  "src/rev07/assets.json",
  "src/rev07/template.html",
  "src/rev07/styles.css",
  "src/rev07/flats.js",
  "src/rev07/diagrams.js",
  "src/rev07/render.js",
];

const absolute = (relativePath) => path.join(root, relativePath);
const existingSources = () => sourceFiles.filter((file) => fs.existsSync(absolute(file)));

function loadConfig(t) {
  const configPath = absolute("src/rev07/config.js");
  if (!fs.existsSync(configPath)) {
    t.skip("Rev07 config does not exist yet");
    return null;
  }
  delete require.cache[require.resolve(configPath)];
  return require(configPath);
}

function loadAssets(t) {
  const assetPath = absolute("src/rev07/assets.json");
  if (!fs.existsSync(assetPath)) {
    t.skip("Rev07 asset manifest does not exist yet");
    return null;
  }
  return JSON.parse(fs.readFileSync(assetPath, "utf8"));
}

test("declares the complete Revision 07 source set", () => {
  const missing = sourceFiles.filter((file) => !fs.existsSync(absolute(file)));
  assert.deepEqual(missing, [], `missing Rev07 source files: ${missing.join(", ")}`);
});

test("uses consistent Revision 07 document control", (t) => {
  const config = loadConfig(t);
  if (!config) return;
  assert.equal(config.meta.documentId, "FRN-001");
  assert.equal(config.meta.revision, "07");
  assert.equal(config.meta.buildDate, "16 Jul 2026");
  assert.equal(config.meta.outputFilename, "Froni_FRN-001_Tech_Pack_Rev07.pdf");
  assert.equal(config.meta.classification, "Custom-development technical pack");
  assert.equal(config.pages.length, 14);
  assert.ok(config.pages.every((page) => page.title && page.type));
});

test("contains only current order, contact, neck, and decoration decisions", (t) => {
  const config = loadConfig(t);
  if (!config) return;
  assert.equal(config.order.quantity, 200);
  assert.equal(config.order.sizeSplit, "Final size split is supplied at order placement.");
  assert.equal(config.contact.name, "Ferdinand Toma");
  assert.equal(config.contact.email, "house@froni.co");
  assert.equal(Object.hasOwn(config.contact, "phone"), false);
  assert.match(config.garment.neck, /blank neck/i);
  assert.equal(config.decorations.length, 4);
  assert.deepEqual(
    config.decorations.map((item) => item.id),
    ["front_ornament", "back_icon", "hood_exterior", "hood_interior"],
  );
});

test("retains every approved A to M target and separates new POM dispositions", (t) => {
  const config = loadConfig(t);
  if (!config) return;
  const expected = {
    A: [68, 70, 72, 74], B: [57, 59, 61, 63], C: [24, 25, 26, 27],
    D: [8, 8, 8.5, 9], E: [57, 58, 59, 60], F: [18, 19, 20, 21],
    G: [26, 26, 26, 26], H: [49, 51, 53, 55], I: [6, 6, 6, 6],
    J: [6, 6, 6, 6], K: [38, 38, 38, 38], L: [26.5, 26.5, 26.5, 26.5],
    M: [10, 10, 10, 10],
  };
  assert.deepEqual(
    Object.fromEntries(config.pom.existing.map((row) => [row.code, row.targets])),
    expected,
  );
  assert.ok(config.pom.existing.every((row) => row.tolerance === "+/- 1 cm"));

  const requiredNew = [
    "Front neck drop", "Back neck drop", "Across shoulder", "Half bicep",
    "Sleeve width at defined points", "Armhole measurement method", "Hood face opening",
    "Hood depth", "Hood side-panel geometry", "Center-gusset geometry",
    "Hood neckline seam length", "Cuff rib width", "Cuff relaxed opening",
    "Hem rib dimensions", "Hem relaxed width",
  ];
  const allowed = new Set([
    "Factory proposes at first pattern",
    "Finalized from approved fit sample",
    "Derived from approved pattern",
  ]);
  assert.deepEqual(config.pom.new.map((row) => row.name), requiredNew);
  assert.ok(config.pom.new.every((row) => row.targets === null));
  assert.ok(config.pom.new.every((row) => allowed.has(row.disposition)));
});

test("covers construction, materials, responsibilities, stages, and factory response", (t) => {
  const config = loadConfig(t);
  if (!config) return;
  for (const term of [
    "stitch class", "SPI", "seam allowance", "seam finish", "thread ticket",
    "needle system", "reinforcement", "stabilization",
  ]) {
    assert.match(config.constructionEngineeringBaseline, new RegExp(term, "i"));
  }
  const constructionAreas = [
    "Shoulder seam", "Armhole seam", "Sleeve underarm seam", "Body side seam",
    "Cuff rib attachment", "Hem rib attachment", "Hood side-panel assembly",
    "Hood center-gusset assembly", "Inner and outer hood joining",
    "Hood-to-neckline attachment", "Neckline stabilization", "Care-tape attachment",
    "Embroidery stabilization and removal",
  ];
  assert.deepEqual(config.construction.map((row) => row.area), constructionAreas);
  assert.ok(config.construction.every((row) => row.fixed && row.factoryProposal && row.firstFit && row.pps));

  const bomItems = [
    "Body French terry", "Rib", "Sewing thread", "Embroidery thread",
    "Embroidery bobbin", "Embroidery needles", "Temporary embroidery stabilizers",
    "Permanent localized back stabilizer", "Neckline stabilization",
    "Printed care, fibre, origin, and wordmark tape", "Factory shipment polybag",
    "Factory shipment cartons",
  ];
  assert.deepEqual(config.bom.map((row) => row.item), bomItems);
  assert.ok(config.bom.every((row) => row.fixedSpec && row.sourcingParty && row.approvalEvidence && row.approvalStage));

  const stages = [
    "Factory technical review and feasibility confirmation", "Construction proposal",
    "First pattern", "First fit sample without final embroidery where appropriate",
    "Fit corrections", "Approved graded pattern and updated measurement chart",
    "Production-fabric approval", "Embroidery strike-offs on production fabric",
    "Embroidered pre-production sample", "PPS approval", "Bulk production",
    "Final QC and shipment",
  ];
  assert.deepEqual(config.developmentStages.map((row) => row.stage), stages);
  assert.ok(config.developmentStages.every((row) => row.approvalOutput));
  assert.match(config.developmentStages[4].approvalOutput, /corrected physical fit sample/i);
  assert.ok(config.responsibilities.length >= 9);

  const responseText = config.factoryResponse.join("\n").toLowerCase();
  for (const phrase of [
    "yes or no", "pattern-development price", "first fit-sample price",
    "corrected fit-sample price", "pps price", "embroidery setup and strike-off charges",
    "provisional bulk unit price at 200 units", "fabric minimum and fabric lead time",
    "sample lead time", "bulk lead time after pps", "earliest committed ex-factory date",
    "maximum usable embroidery field", "embroidery machine make and field configuration",
    "garment factory's contract and responsibility", "payment terms", "incoterm",
    "shipping estimate to germany",
  ]) assert.ok(responseText.includes(phrase), `missing factory response field: ${phrase}`);
});

test("records exact authority roles and explicit missing production assets", (t) => {
  const assets = loadAssets(t);
  if (!assets) return;
  assert.equal(assets.frontAuthority.role, "Front design reference photograph");
  assert.equal(assets.frontAuthority.sourcePath, "C:\\froni\\reference\\Froni_Edition_One_Front.png");
  assert.equal(assets.frontAuthority.embeddedPath, "assets/Froni_Edition_One_Front.png");
  assert.equal(assets.frontAuthority.mimeType, "image/png");
  assert.equal(assets.frontAuthority.sha256, "68AD1490D3502161214FE31EA9041F8C675671DD470AE1B7A581DC6AE81154BB");
  assert.equal(assets.frontAuthority.width, 500);
  assert.equal(assets.frontAuthority.height, 603);
  assert.equal(assets.frontAuthority.available, true);
  assert.equal(assets.canonicalBack.role, "Canonical back icon scan");
  assert.equal(assets.canonicalBack.sourcePath, "C:\\froni\\reference\\pantocratorStCatherines_2023x3774.jpg");
  assert.equal(assets.canonicalBack.mimeType, "image/jpeg");
  assert.equal(assets.canonicalBack.available, true);
  assert.ok(assets.hoodExteriorReference, "hood exterior reference photograph must be recorded");
  assert.equal(assets.hoodExteriorReference.role, "Exterior hood embroidery reference photograph");
  assert.equal(assets.hoodExteriorReference.sourcePath, "C:\\froni\\reference\\Froni_Edition_One_IAM.jpg");
  assert.equal(assets.hoodExteriorReference.embeddedPath, "assets/Froni_Edition_One_IAM.jpg");
  assert.equal(assets.hoodExteriorReference.mimeType, "image/jpeg");
  assert.equal(assets.hoodExteriorReference.sha256, "5D09ADA81A689A51C88149AA5477A1FE5DD51A5B94CF22B7B3D19D838D65C600");
  assert.equal(assets.hoodExteriorReference.width, 4096);
  assert.equal(assets.hoodExteriorReference.height, 4096);
  assert.equal(assets.hoodExteriorReference.available, true);
  assert.match(fs.readFileSync(absolute("build.js"), "utf8"), /item\.mimeType/);
  assert.match(fs.readFileSync(absolute("src/rev07/render.js"), "utf8"), /hoodExteriorReference/);
  for (const key of [
    "frontProductionVector", "mirrorComposite", "hoodExteriorLettering",
    "hoodInteriorLettering", "approvedAsymmetryMap", "careTapeArtwork",
    "digitizedMasters",
  ]) {
    assert.equal(assets[key].available, false, `${key} must remain an explicit missing deliverable`);
  }
});

test("draws and keys every new POM method without invented hood notches", () => {
  const diagramText = fs.readFileSync(absolute("src/rev07/diagrams.js"), "utf8");
  const renderText = fs.readFileSync(absolute("src/rev07/render.js"), "utf8");
  const expectedMethods = [
    "front-neck-drop", "back-neck-drop", "across-shoulder", "half-bicep",
    "sleeve-width-defined-points", "armhole-measurement-method",
    "hood-face-opening", "hood-depth", "hood-side-panel-geometry",
    "center-gusset-geometry", "hood-neckline-seam-length", "cuff-rib-width",
    "cuff-relaxed-opening", "hem-rib-dimensions", "hem-relaxed-width",
  ];
  const foundMethods = [...diagramText.matchAll(/data-pom-method="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(foundMethods, expectedMethods);
  assert.doesNotMatch(diagramText, /class="notch"/);
  assert.match(diagramText, /notches are derived from the approved pattern/i);
  assert.match(renderText, /N1-N6 are drawn on the body and sleeve schematic on page 7/i);
  assert.match(renderText, /N7-N15 are drawn on the hood and rib schematic on this page/i);
});

test("prints a vertical Greek locator and visible construction-location legend", () => {
  const renderText = fs.readFileSync(absolute("src/rev07/render.js"), "utf8");
  assert.match(renderText, /data-greek-stack="true"/);
  assert.match(renderText, /hoodExterior\.string\.split\(\/\\s\+\//);
  const expectedLocations = [
    "shoulder", "armhole", "sleeve", "side-seam", "cuff", "hem",
    "rib-boundary", "neckline", "hood-attachment",
  ];
  const foundLocations = [...renderText.matchAll(/data-visible-location="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(foundLocations, expectedLocations);
});

test("active Revision 07 sources contain no stale canon or prohibited copy", () => {
  const texts = existingSources().map((file) => [file, fs.readFileSync(absolute(file), "utf8")]);
  const forbidden = [
    ["1", "5", "0"].join(""),
    ["christo", "gram"].join(""),
    ["woven", " neck label"].join(""),
    ["one of ", "1", "5", "0"].join(""),
    "luxury", "premium", "quality",
  ];
  for (const [file, text] of texts) {
    const lower = text.toLowerCase();
    for (const term of forbidden) assert.equal(lower.includes(term), false, `${file} contains prohibited term ${term}`);
    assert.equal(text.includes(String.fromCodePoint(0x2014)), false, `${file} contains an em dash`);
    assert.equal(/\[(?:email|phone)\]/i.test(text), false, `${file} contains a contact placeholder`);
  }
});

test("page and section headings use sentence or title case", (t) => {
  const config = loadConfig(t);
  if (!config) return;
  const headings = [
    ...config.pages.map((page) => page.title),
    ...(config.sectionTitles || []),
  ];
  const allCaps = headings.filter((heading) => {
    const letters = heading.replace(/[^A-Za-z]/g, "");
    return letters.length > 3 && letters === letters.toUpperCase();
  });
  assert.deepEqual(allCaps, []);
});
