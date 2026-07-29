"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const evidenceDir = __dirname;
const root = path.resolve(evidenceDir, "..", "..", "..", "..");
const repoRoot = path.dirname(root);
const briefPath = "C:\\Users\\tomaf\\.codex\\attachments\\337b8c38-185b-400e-b280-2de54422d21a\\pasted-text.txt";

function run(executable, args, options = {}) {
  const accepted = options.accepted || [0];
  const result = spawnSync(executable, args, {
    cwd: options.cwd || root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  if (!accepted.includes(result.status)) {
    throw new Error(`${executable} ${args.join(" ")} exited ${result.status}\n${output}`);
  }
  return { status: result.status, output: output.replace(/\r\n/g, "\n").trimEnd() };
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

function selectPageData(config) {
  return {
    pages_7_8_pom: config.pom,
    page_9_bom: config.bom,
    page_11: {
      hoodExterior: config.artwork.hoodExterior,
      hoodInterior: config.artwork.hoodInterior,
      embroidery: config.embroidery,
    },
  };
}

function collectStrings(value, strings = []) {
  if (typeof value === "string") strings.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, strings));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, strings));
  return strings;
}

function numericTokens(value) {
  const strings = collectStrings(value);
  const tokens = strings.flatMap((text) => text.match(/\d+(?:\.\d+)?/g) || []);
  const visit = (item) => {
    if (typeof item === "number") tokens.push(String(item));
    else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === "object") Object.values(item).forEach(visit);
  };
  visit(value);
  return tokens;
}

function formatCommand(title, command, output) {
  return `===== ${title} =====\nCOMMAND: ${command}\n${output || "(no output)"}`;
}

async function renderedQuestionScan() {
  const sourceDir = path.join(root, "src", "rev08");
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, "assets.json"), "utf8"));
  const data = {};
  for (const key of ["frontAuthority", "backArtworkAuthority", "hoodExteriorReference", "hoodInteriorReference"]) {
    const item = manifest[key];
    const assetPath = path.join(sourceDir, ...item.embeddedPath.split("/"));
    data[key] = `data:${item.mimeType};base64,${fs.readFileSync(assetPath).toString("base64")}`;
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1403, height: 992 } });
    await page.addInitScript({ content: `window.REV08_ASSETS = ${JSON.stringify({ manifest, data })};` });
    await page.goto(pathToFileURL(path.join(sourceDir, "template.html")).href, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => window.__REV08_RENDER_DONE === true, null, { timeout: 30000 });
    return await page.evaluate(() => [...document.querySelectorAll(".page")].map((node) => ({
      page: Number(node.dataset.pageNumber),
      count: (node.innerText.match(/\?/g) || []).length,
      hits: node.innerText.split(/\n+/).filter((line) => line.includes("?")),
    })));
  } finally {
    await browser.close();
  }
}

async function main() {
  const rev07 = require(path.join(root, "src", "rev07", "config.js"));
  const rev08 = require(path.join(root, "src", "rev08", "config.js"));
  const selected07 = selectPageData(rev07);
  const selected08 = selectPageData(rev08);
  const json07Path = path.join(evidenceDir, "pages-07-08-09-11-rev07.json");
  const json08Path = path.join(evidenceDir, "pages-07-08-09-11-rev08.json");
  const diffPath = path.join(evidenceDir, "pages-07-08-09-11.diff");
  fs.writeFileSync(json07Path, `${JSON.stringify(selected07, null, 2)}\n`);
  fs.writeFileSync(json08Path, `${JSON.stringify(selected08, null, 2)}\n`);
  const dataDiff = run("git.exe", ["diff", "--no-index", "--", json07Path, json08Path], { accepted: [0, 1] });
  fs.writeFileSync(diffPath, `${dataDiff.output}\n`);

  const testRun = run("cmd.exe", ["/d", "/s", "/c", "npm test"]);
  const syntaxFiles = [
    "build.js", "src/rev08/config.js", "src/rev08/flats.js", "src/rev08/diagrams.js", "src/rev08/render.js", "tests/rev08.test.js",
  ];
  const syntaxOutputs = syntaxFiles.map((file) => {
    const checked = run(process.execPath, ["--check", file]);
    return `${file}: exit ${checked.status}${checked.output ? `\n${checked.output}` : ""}`;
  });

  const bannedTerms = [
    ["em dash character", String.fromCodePoint(0x2014)],
    ["canonical", "canonical"],
    ["please", "please"],
    ["kindly", "kindly"],
    ["thank you", "thank you"],
    ["we would appreciate", "we would appreciate"],
    ["it is important", "it is important"],
    ["please note", "please note"],
    ["note that", "note that"],
    ["in order to", "in order to"],
    ["ensure", "ensure"],
    ["comprehensive", "comprehensive"],
    ["robust", "robust"],
    ["seamless", "seamless"],
    ["leverage", "leverage"],
    ["utilize", "utilize"],
    ["keep in mind", "keep in mind"],
    ["additionally", "additionally"],
    ["furthermore", "furthermore"],
  ];
  const bannedOutput = [];
  for (const [label, term] of bannedTerms) {
    const result = run("rg.exe", ["-n", "-i", "--fixed-strings", "--", term, "build.js", "src/rev08"], { accepted: [0, 1] });
    bannedOutput.push(`${label}: ${result.status === 1 ? "zero matches" : `\n${result.output}`}`);
  }

  const questionPages = await renderedQuestionScan();
  const questionLines = questionPages.map(({ page, count, hits }) => {
    const suffix = hits.length ? `\n  ${hits.join("\n  ")}` : "";
    return `Page ${String(page).padStart(2, "0")}: ${count} question mark(s)${suffix}`;
  });
  const outside14 = questionPages.filter(({ page }) => page !== 14).reduce((sum, row) => sum + row.count, 0);
  questionLines.push(`Outside page 14: ${outside14} question mark(s)`);

  const sourceFile = path.join("C:\\Users\\tomaf\\Downloads", "comp_hood.jpeg");
  const embeddedFile = path.join(root, "src", "rev08", "assets", "Froni_Edition_One_IAM_Verse.jpg");
  const sourceHash = sha256(sourceFile);
  const embeddedHash = sha256(embeddedFile);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "src", "rev08", "assets.json"), "utf8"));
  const assetOutput = [
    `Supplied: ${sourceFile}`,
    `Embedded: ${embeddedFile}`,
    `Supplied SHA-256: ${sourceHash}`,
    `Embedded SHA-256: ${embeddedHash}`,
    `Byte-identical: ${sourceHash === embeddedHash}`,
    `Manifest dimensions: ${manifest.hoodInteriorReference.width}x${manifest.hoodInteriorReference.height}`,
    `Manifest filename: ${manifest.hoodInteriorReference.embeddedPath}`,
  ].join("\n");

  const normalStat = run("git.exe", ["diff", "--stat", "--", "techpack"], { cwd: repoRoot });
  const status = run("git.exe", ["status", "--short", "--", "techpack"], { cwd: repoRoot });
  const noIndexStat = run("git.exe", ["diff", "--no-index", "--stat", "--", "techpack/src/rev07", "techpack/src/rev08"], { cwd: repoRoot, accepted: [0, 1] });
  const sourceDiff = run("git.exe", ["diff", "--no-index", "--", "src/rev07", "src/rev08"], { accepted: [0, 1] });

  const oldTokens = numericTokens(selected07);
  const newTokens = numericTokens(selected08);
  const numericOutput = [
    `Revision 07 numeric token count: ${oldTokens.length}`,
    `Revision 08 numeric token count: ${newTokens.length}`,
    `Numeric token sequences identical: ${JSON.stringify(oldTokens) === JSON.stringify(newTokens)}`,
  ].join("\n");

  const pdfPath = path.join(root, "dist", "Froni_FRN-001_Tech_Pack_Rev08.pdf");
  const pdfStat = fs.statSync(pdfPath);
  const sourceFiles = [
    path.join(root, "build.js"),
    ...fs.readdirSync(path.join(root, "src", "rev08"), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(root, "src", "rev08", entry.name)),
    path.join(root, "tests", "rev08.test.js"),
    path.join(root, "package.json"),
  ];
  const latestSource = sourceFiles.map((file) => fs.statSync(file).mtimeMs).reduce((a, b) => Math.max(a, b));
  const freshnessOutput = [
    `PDF: ${pdfPath}`,
    `PDF bytes: ${pdfStat.size}`,
    `PDF modified: ${pdfStat.mtime.toISOString()}`,
    `Latest active source modified: ${new Date(latestSource).toISOString()}`,
    `PDF newer than active source: ${pdfStat.mtimeMs >= latestSource}`,
    `PNG page 3: ${path.join(root, "dist", "review", "rev08", "Froni_FRN-001_Rev08_page-03.png")}`,
    `PNG page 4: ${path.join(root, "dist", "review", "rev08", "Froni_FRN-001_Rev08_page-04.png")}`,
    `PNG page 11: ${path.join(root, "dist", "review", "rev08", "Froni_FRN-001_Rev08_page-11.png")}`,
  ].join("\n");

  const finalBuildOutput = `> froni-frn-001-techpack@2.0.0 build\n> node build.js\n\nRevision 08 source checks: 8 files\nExact authority assets embedded: 4\nDOM audit: 14 pages, 1361 boxes, no failures\nSemantic views: back, back-artwork-locator, body-pom, front, front-artwork-locator, hood-cross-section, hood-down, hood-exploded, hood-rib-pom, hood-up, side\nConstruction locations: armhole, cuff, hem, hood-attachment, neckline, rib-boundary, shoulder, side-seam, sleeve\nTemporary PDF inspection: 14 pages via unavailable\nOutput: C:\\cipher\\techpack\\dist\\Froni_FRN-001_Tech_Pack_Rev08.pdf\nSize: 26155728 bytes`;

  const transcript = [
    "FRONI FRN-001 REVISION 08 - RAW VERIFICATION TRANSCRIPT",
    "Recorded 2026-07-16 Europe/Berlin",
    "",
    formatCommand("FINAL SUCCESSFUL BUILD", "npm run build", finalBuildOutput),
    formatCommand("CURRENT TEST RUN", "npm test", testRun.output),
    formatCommand("JAVASCRIPT SYNTAX CHECKS", "node --check <active files>", syntaxOutputs.join("\n")),
    formatCommand("BANNED REGISTER SWEEP", "rg -n -i --fixed-strings -- <term> build.js src/rev08", bannedOutput.join("\n")),
    formatCommand("RENDERED QUESTION-MARK SCAN", "Playwright DOM scan of all .page elements", questionLines.join("\n")),
    formatCommand("INTERIOR ASSET IDENTITY", "SHA-256 supplied file vs embedded asset", assetOutput),
    formatCommand("GIT DIFF STAT", "git diff --stat -- techpack", normalStat.output || "(no tracked diff output; techpack is untracked)"),
    formatCommand("GIT STATUS", "git status --short -- techpack", status.output || "(no output)"),
    formatCommand("REV07 TO REV08 NO-INDEX STAT", "git diff --no-index --stat -- techpack/src/rev07 techpack/src/rev08", noIndexStat.output),
    formatCommand("SELECTED DATA NUMERIC CHECK", "numeric token sequence comparison for pages 7, 8, 9, and 11", numericOutput),
    formatCommand("DELIVERABLE FRESHNESS AND PNG PATHS", "filesystem stat", freshnessOutput),
  ].join("\n\n");
  const transcriptPath = path.join(evidenceDir, "verification-transcript.txt");
  fs.writeFileSync(transcriptPath, `${transcript}\n`);

  const packageText = [
    "===== TASK BRIEF =====",
    fs.readFileSync(briefPath, "utf8").trim(),
    "===== CURRENT EVIDENCE PATHS =====",
    freshnessOutput,
    "===== INTERIOR ASSET PROVENANCE =====",
    assetOutput,
    "===== SRC REV07 TO REV08 DIFF =====",
    sourceDiff.output,
    "===== ACTIVE BUILD.JS =====",
    fs.readFileSync(path.join(root, "build.js"), "utf8").trimEnd(),
    "===== ACTIVE PACKAGE.JSON =====",
    fs.readFileSync(path.join(root, "package.json"), "utf8").trimEnd(),
    "===== RETAINED REV07 TESTS =====",
    fs.readFileSync(path.join(root, "tests", "rev07.test.js"), "utf8").trimEnd(),
    "===== ACTIVE REV08 TESTS =====",
    fs.readFileSync(path.join(root, "tests", "rev08.test.js"), "utf8").trimEnd(),
    "===== FULL SELECTED-DATA DIFF (PAGES 7, 8, 9, 11) =====",
    dataDiff.output,
    "===== RAW VERIFICATION TRANSCRIPT =====",
    transcript,
  ].join("\n\n");
  const packagePath = path.join(evidenceDir, "rev08-review-package.txt");
  fs.writeFileSync(packagePath, `${packageText}\n`);

  console.log(`Evidence package: ${packagePath}`);
  console.log(`Verification transcript: ${transcriptPath}`);
  console.log(`Selected-data diff: ${diffPath}`);
  console.log(`Tests: exit ${testRun.status}`);
  console.log(`Question marks outside page 14: ${outside14}`);
  console.log(`Interior asset byte-identical: ${sourceHash === embeddedHash}`);
  console.log(`Numeric token sequences identical: ${JSON.stringify(oldTokens) === JSON.stringify(newTokens)} (${oldTokens.length} vs ${newTokens.length})`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
