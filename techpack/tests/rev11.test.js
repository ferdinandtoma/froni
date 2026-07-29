"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const absolute = (relativePath) => path.join(root, relativePath);
const revisionEntry = "Back icon acceptance artwork sheet, asymmetry pin map, and mirror judging references added.";

const sourceFiles = [
  "config.js",
  "assets.json",
  "template.html",
  "styles.css",
  "diagrams.js",
  "render.js",
];

const suppliedAssets = {
  backAcceptanceSheet: {
    filename: "Froni_FRN-001-E_Artwork_Sheet_Rev01.pdf",
    mimeType: "application/pdf",
    sha256: "A4345CC1BDFF0915F93D2E11C71B8B1AA8089C70617E358243DE3510DEE056C4",
    pageCount: 3,
  },
  approvedAsymmetryMap: {
    filename: "FRN001_Back_Icon_Asymmetry_Pins.jpg",
    mimeType: "image/jpeg",
    sha256: "D1D4AE73F4D7E53118B43D87231EC13A530EA8A8455EBEA48C7FEE93EE32D6F9",
    width: 750,
    height: 1300,
  },
  mirrorCompositeBlessing: {
    filename: "Pantocrator_Blessing_Side.jpg",
    mimeType: "image/jpeg",
    sha256: "2C96D558847702DC1EDB8D8111BBAA93ACAE8801EADFACD9744A89ED4C584DEB",
    width: 1664,
    height: 3652,
  },
  mirrorCompositeJudge: {
    filename: "Pantocrator_Judge_Side.jpg",
    mimeType: "image/jpeg",
    sha256: "58C8A1AF4238209DBA5AFD92AF122BCB111F7B19522CDB3F870179D26CC46CB9",
    width: 1996,
    height: 3676,
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

const jpegDimensions = (filePath) => {
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, `${filePath} is not a JPEG`);
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = bytes.readUInt16BE(offset + 2);
    offset += 2 + length;
  }
  throw new Error(`No JPEG size marker found in ${filePath}`);
};

test("retains a complete Revision 11 source", () => {
  const missing = sourceFiles.filter((name) => !fs.existsSync(absolute(`src/rev11/${name}`)));
  assert.deepEqual(missing, [], `missing Revision 11 source files: ${missing.join(", ")}`);

  const templateText = fs.readFileSync(absolute("src/rev11/template.html"), "utf8");
  assert.match(templateText, /Revision 11/);
});

test("changes only Revision 11 control fields and adds one revision record entry", () => {
  const previous = loadConfig("rev10");
  const current = loadConfig("rev11");

  assert.equal(current.meta.revision, "11");
  assert.equal(current.meta.buildDate, "22 Jul 2026");
  assert.equal(current.meta.outputFilename, "Froni_FRN-001_Tech_Pack_Rev11.pdf");
  assert.equal(current.revisionRecord[0], revisionEntry);
  assert.equal(current.revisionRecord.filter((entry) => entry === revisionEntry).length, 1);

  const normalized = structuredClone(current);
  normalized.meta = structuredClone(previous.meta);
  normalized.revisionRecord = normalized.revisionRecord.slice(1);
  assert.deepEqual(normalized, previous, "configuration changed beyond Revision 11 document control");
});

test("embeds the exact supplied artwork sheet and judging-reference assets", () => {
  const previous = loadAssets("rev10");
  const current = loadAssets("rev11");
  for (const [key, value] of Object.entries(previous)) {
    if (key === "mirrorComposite" || key === "approvedAsymmetryMap") continue;
    assert.deepEqual(current[key], value, `unrelated asset declaration changed: ${key}`);
  }
  assert.equal(Object.hasOwn(current, "mirrorComposite"), false);

  for (const [key, expected] of Object.entries(suppliedAssets)) {
    const item = current[key];
    assert.ok(item, `missing asset declaration: ${key}`);
    assert.equal(item.embeddedPath, `assets/artwork/${expected.filename}`);
    assert.equal(item.mimeType, expected.mimeType);
    assert.equal(item.available, true);
    assert.equal(item.sha256, expected.sha256);
    if (expected.pageCount) assert.equal(item.pageCount, expected.pageCount);
    if (expected.width) assert.equal(item.width, expected.width);
    if (expected.height) assert.equal(item.height, expected.height);

    const embedded = absolute(`src/rev11/${item.embeddedPath}`);
    assert.equal(fs.existsSync(embedded), true, `missing embedded asset: ${expected.filename}`);
    assert.equal(sha256(embedded), expected.sha256);
    if (expected.mimeType === "image/jpeg") {
      assert.deepEqual(jpegDimensions(embedded), { width: expected.width, height: expected.height });
    }
  }
});

test("replaces only the two Page 10 missing-artwork panels", () => {
  const renderText = fs.readFileSync(absolute("src/rev11/render.js"), "utf8");
  const buildText = fs.readFileSync(absolute("build.js"), "utf8");
  const start = renderText.indexOf("const renderArtwork");
  const end = renderText.indexOf("const renderHoodArtwork", start);
  const pageTen = renderText.slice(start, end);

  assert.match(pageTen, /data-asset-key="approvedAsymmetryMap"/);
  assert.match(pageTen, /data-asset-key="mirrorCompositeBlessing"/);
  assert.match(pageTen, /data-asset-key="mirrorCompositeJudge"/);
  assert.match(pageTen, /FRN-001-E artwork sheet, Rev 01/);
  assert.doesNotMatch(pageTen, /data-missing-asset="mirrorComposite"/);
  assert.doesNotMatch(pageTen, /data-missing-asset="approvedAsymmetryMap"/);

  for (const key of ["approvedAsymmetryMap", "mirrorCompositeBlessing", "mirrorCompositeJudge"]) {
    assert.match(buildText, new RegExp(`key: ["']${key}["']`));
  }
  assert.match(buildText, /key: ["']backAcceptanceSheet["']/);

  const requiredMissing = renderText.match(/const requiredMissing = \[([^\]]+)\]/)?.[1] || "";
  for (const key of ["frontProductionVector", "hoodExteriorLettering", "hoodInteriorLettering", "careTapeArtwork", "digitizedMasters"]) {
    assert.match(requiredMissing, new RegExp(`["']${key}["']`));
  }
  assert.doesNotMatch(requiredMissing, /mirrorComposite|approvedAsymmetryMap/);
});

test("keeps every non-artwork diagram output unchanged", () => {
  const previous = loadBrowserModule("src/rev10/diagrams.js", "REV10_DIAGRAMS");
  const current = loadBrowserModule("src/rev11/diagrams.js", "REV11_DIAGRAMS");
  for (const method of ["bodyPom", "hoodRibPom", "placementLocator"]) {
    if (method === "placementLocator") {
      assert.equal(current[method]("front"), previous[method]("front"));
      assert.equal(current[method]("back"), previous[method]("back"));
    } else {
      assert.equal(current[method](), previous[method]());
    }
  }
});
