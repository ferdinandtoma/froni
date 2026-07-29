"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const absolute = (relativePath) => path.join(root, relativePath);

const revisionEntry = "Hood and care-tape artwork authorities added; fibre, embroidery-thread, and factory-response content updated; icon frame ruling carried to Revision 13.";

const sourceFiles = [
  "config.js",
  "assets.json",
  "template.html",
  "styles.css",
  "diagrams.js",
  "render.js",
];

const suppliedAssets = {
  hoodExteriorLettering: {
    filename: "Froni_Edition_One_Hood_Exterior_Lettering_Rev01.svg",
    mimeType: "image/svg+xml",
    sha256: "434010A348F91EFE4E1A6140931CF5B4FA73ACA547E18B16EC7E36675073A529",
  },
  hoodExteriorLetteringPreview: {
    filename: "Froni_Hood_Exterior_Lettering_Preview.png",
    mimeType: "image/png",
    sha256: "C04EC12DDF2EA2EB30E2AC763A67CD9A4E9A1A1DA2EA952458D2F577B0BC39FC",
    width: 3024,
    height: 3931,
  },
  hoodInteriorLettering: {
    filename: "Froni_Edition_One_Hood_Interior_Verse_Rev01.svg",
    mimeType: "image/svg+xml",
    sha256: "2D0F8265E357F880EC70FB1220E78CF4D6829BE98BE25F4EDE1F54696E7EE811",
  },
  hoodInteriorLetteringPreview: {
    filename: "Froni_Hood_Interior_Verse_Preview.png",
    mimeType: "image/png",
    sha256: "3C80533FEE61AE3215C892E87D6844346F1A458614191A67D9590AC7A9817619",
    width: 6546,
    height: 509,
  },
  careTapeArtwork: {
    filename: "Froni_Edition_One_Care_Tape_Draft_Rev01.svg",
    mimeType: "image/svg+xml",
    sha256: "F8D86F9F7F24DBE11A6CFA2CB812541377ACE1AA4C8BDEC3DBBE6C2803524523",
  },
  careTapePreview: {
    filename: "Froni_Care_Tape_Preview.png",
    mimeType: "image/png",
    sha256: "4497905C1AB16DA51EFA8296724F4DEF1E2B06A90BAF432CF74EE04A6AF822B3",
    width: 5164,
    height: 567,
  },
};

const loadConfig = (revision) => {
  const filePath = absolute(`src/${revision}/config.js`);
  delete require.cache[require.resolve(filePath)];
  return require(filePath);
};

const loadAssets = (revision) => JSON.parse(
  fs.readFileSync(absolute(`src/${revision}/assets.json`), "utf8"),
);

const sha256 = (filePath) => crypto
  .createHash("sha256")
  .update(fs.readFileSync(filePath))
  .digest("hex")
  .toUpperCase();

const pngDimensions = (filePath) => {
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG", `${filePath} is not a PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

const extractFunction = (text, startMarker, endMarker) => {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start);
  assert.notEqual(start, -1, `missing marker: ${startMarker}`);
  assert.notEqual(end, -1, `missing marker: ${endMarker}`);
  return text.slice(start, end);
};

test("selects a complete Revision 12 source", () => {
  const missing = sourceFiles.filter((name) => !fs.existsSync(absolute(`src/rev12/${name}`)));
  assert.deepEqual(missing, [], `missing Revision 12 source files: ${missing.join(", ")}`);

  const buildText = fs.readFileSync(absolute("build.js"), "utf8");
  const templateText = fs.readFileSync(absolute("src/rev12/template.html"), "utf8");
  assert.match(buildText, /src["'],\s*["']rev12/);
  assert.match(templateText, /Revision 12/);
});

test("changes only the listed Revision 12 configuration fields", () => {
  const previous = loadConfig("rev11");
  const current = loadConfig("rev12");

  assert.equal(current.meta.revision, "12");
  assert.equal(current.meta.buildDate, "23 Jul 2026");
  assert.equal(current.meta.outputFilename, "Froni_FRN-001_Tech_Pack_Rev12.pdf");
  assert.equal(current.revisionRecord[0], revisionEntry);
  assert.equal(current.revisionRecord.filter((entry) => entry === revisionEntry).length, 1);

  assert.deepEqual(current.materials.tape, [
    "Printed care, fibre, origin, and wordmark tape only",
    "Oberstoff: 100% Baumwolle",
    "Body: 100% cotton",
    "Bündchen: 95-98% Baumwolle, 2-5% Elastan",
    "Rib: 95-98% cotton, 2-5% elastane",
    "Made in Portugal",
    "FRONI is permitted only on this printed tape",
  ]);

  const embroideryThread = current.bom.find((row) => row.item === "Embroidery thread");
  assert.equal(
    embroideryThread.fixedSpec,
    "Madeira Frosted Matt 40 wt or approved Gunold equivalent; 60 wt permitted at the digitizer's discretion for finest face and hand detail",
  );
  assert.ok(current.artwork.back.execution.includes(
    "40 wt thread throughout; 60 wt permitted at the digitizer's discretion for finest face and hand detail",
  ));
  assert.ok(current.artwork.back.execution.includes(
    "If usable field width is 45 cm, icon width caps at 43 cm and height follows the artwork aspect",
  ));
  assert.equal(current.artwork.hoodExterior.color, "Marigold, target C9A227; factory submits nearest thread shades for the strike-off A/B");
  assert.equal(
    current.artwork.hoodExterior.note,
    "Production letterform artwork: Froni_Edition_One_Hood_Exterior_Lettering_Rev01.svg. EB Garamond regular capitals. Cap height 30 mm, baseline pitch 45 mm, glyph block centered on the gusset.",
  );
  assert.equal(
    current.artwork.hoodInterior.note,
    "Production lettering artwork: Froni_Edition_One_Hood_Interior_Verse_Rev01.svg. EB Garamond italic. X-height fixed at 7 mm; single-line unit, 26.9 cm advance; the unit tiles end to end with a 20 mm trailing space; repeat 2 to 3 units as clean fit permits. The verse runs as a single-line band; exact position finalized from the approved fit sample.",
  );
  assert.ok(current.artwork.hoodInterior.lettering.includes(
    "Escalate to 8-9 mm if italic counters close on production cloth",
  ));
  assert.deepEqual(
    current.embroidery.setup.find((row) => row[0] === "Face and hand detail"),
    ["Face and hand detail", "40 wt; 60 wt at the digitizer's discretion"],
  );
  assert.deepEqual(
    current.embroidery.setup.find((row) => row[0] === "Gold"),
    ["Gold", "Marigold, target C9A227; factory submits nearest thread shades for the strike-off A/B"],
  );
  assert.equal(
    current.factoryResponse.filter((field) => field === "Factory closure periods in the next six months").length,
    1,
  );

  const normalized = structuredClone(current);
  normalized.meta = structuredClone(previous.meta);
  normalized.revisionRecord = normalized.revisionRecord.slice(1);
  normalized.materials.tape = structuredClone(previous.materials.tape);
  normalized.bom.find((row) => row.item === "Embroidery thread").fixedSpec =
    previous.bom.find((row) => row.item === "Embroidery thread").fixedSpec;
  normalized.artwork.back.execution = structuredClone(previous.artwork.back.execution);
  normalized.artwork.hoodExterior.color = previous.artwork.hoodExterior.color;
  normalized.artwork.hoodExterior.note = previous.artwork.hoodExterior.note;
  normalized.artwork.hoodInterior.note = previous.artwork.hoodInterior.note;
  normalized.embroidery.setup = structuredClone(previous.embroidery.setup);
  normalized.factoryResponse = normalized.factoryResponse.filter(
    (field) => field !== "Factory closure periods in the next six months",
  );
  assert.deepEqual(normalized, previous, "configuration changed beyond the listed Revision 12 fields");
});

test("packages the exact six supplied artwork files", () => {
  const previous = loadAssets("rev11");
  const current = loadAssets("rev12");
  const newKeys = new Set(Object.keys(suppliedAssets));

  for (const [key, value] of Object.entries(previous)) {
    if (newKeys.has(key)) continue;
    assert.deepEqual(current[key], value, `unrelated asset declaration changed: ${key}`);
  }

  for (const [key, expected] of Object.entries(suppliedAssets)) {
    const item = current[key];
    assert.ok(item, `missing asset declaration: ${key}`);
    assert.equal(item.embeddedPath, `assets/artwork/${expected.filename}`);
    assert.equal(item.mimeType, expected.mimeType);
    assert.equal(item.available, true);
    assert.equal(item.sha256, expected.sha256);
    if (expected.width) assert.equal(item.width, expected.width);
    if (expected.height) assert.equal(item.height, expected.height);

    const embedded = absolute(`src/rev12/${item.embeddedPath}`);
    assert.equal(fs.existsSync(embedded), true, `missing embedded asset: ${expected.filename}`);
    assert.equal(sha256(embedded), expected.sha256);
    if (expected.mimeType === "image/png") {
      assert.deepEqual(pngDimensions(embedded), { width: expected.width, height: expected.height });
    }
  }
});

test("replaces only the Page 2 and Page 11 missing-artwork panels", () => {
  const renderText = fs.readFileSync(absolute("src/rev12/render.js"), "utf8");
  const contentSource = [
    renderText,
    fs.readFileSync(absolute("src/rev12/config.js"), "utf8"),
    fs.readFileSync(absolute("src/rev12/assets.json"), "utf8"),
  ].join("\n");

  for (const key of ["careTapePreview", "hoodExteriorLetteringPreview", "hoodInteriorLetteringPreview"]) {
    assert.match(renderText, new RegExp(`data-asset-key=["']${key}["']`));
  }
  for (const key of ["careTapeArtwork", "hoodExteriorLettering", "hoodInteriorLettering"]) {
    assert.doesNotMatch(renderText, new RegExp(`data-missing-asset=["']${key}["']`));
  }
  for (const filename of Object.values(suppliedAssets).map((item) => item.filename)) {
    assert.match(contentSource, new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const requiredMissing = renderText.match(/const requiredMissing = \[([^\]]+)\]/)?.[1] || "";
  assert.match(requiredMissing, /frontProductionVector/);
  assert.match(requiredMissing, /digitizedMasters/);
  assert.doesNotMatch(requiredMissing, /careTapeArtwork|hoodExteriorLettering|hoodInteriorLettering/);
});

test("keeps Page 5 illustrations, measurements, and construction unchanged", () => {
  const previousConfig = loadConfig("rev11");
  const currentConfig = loadConfig("rev12");
  assert.deepEqual(currentConfig.pom, previousConfig.pom);
  assert.deepEqual(currentConfig.construction, previousConfig.construction);

  const previousRender = fs.readFileSync(absolute("src/rev11/render.js"), "utf8");
  const currentRender = fs.readFileSync(absolute("src/rev12/render.js"), "utf8");
  assert.equal(
    extractFunction(currentRender, "const renderHoodAssembly", "const renderConstruction"),
    extractFunction(previousRender, "const renderHoodAssembly", "const renderConstruction"),
  );
  assert.deepEqual(
    fs.readFileSync(absolute("src/rev12/diagrams.js")),
    fs.readFileSync(absolute("src/rev11/diagrams.js")),
  );
});
