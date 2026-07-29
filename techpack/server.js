/* Froni FRN-001 placement editor server (npm run edit).
 *
 * Serves techpack.html in edit mode: the front + back black flats with the
 * garment artwork as draggable / corner-resizable images. Save POSTs the
 * placement to ./placement.json; `npm run build` then bakes it into the PDF.
 *
 * Artwork is read from ./reference/ (same scan as build.js) and embedded as
 * base64 originals (the browser scales them for display; the editor measures
 * each aspect client-side). No image processing, so no browser dependency. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const DIR = __dirname;
const REF_DIR = path.join(DIR, "reference");
const PLACEMENT = path.join(DIR, "placement.json");
const PORT = 4788;

function findAsset(files, patterns) {
  return files.find((f) => patterns.some((p) => f.toLowerCase().includes(p))) || null;
}
function mimeOf(ext) {
  return ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
}
function dataURL(abs) {
  const ext = path.extname(abs).slice(1).toLowerCase();
  return `data:${mimeOf(ext)};base64,` + fs.readFileSync(abs).toString("base64");
}

// Scan ./reference/ the same way build.js does. Returns {error, back, front}
// when a required asset is missing, else the __ARTWORK object.
function artwork() {
  const files = fs.existsSync(REF_DIR)
    ? fs.readdirSync(REF_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    : [];
  const back = findAsset(files, ["pantocrator", "back"]);
  const front = findAsset(files, ["front", "linework"]);
  const worn = findAsset(files, ["worn", "mockup"]);
  if (!back || !front) return { error: true, back, front };
  const a = { back: { src: dataURL(path.join(REF_DIR, back)) }, front: { src: dataURL(path.join(REF_DIR, front)) } };
  if (worn) a.worn = { src: dataURL(path.join(REF_DIR, worn)) };
  return a;
}

function readPlacement() {
  try { return JSON.parse(fs.readFileSync(PLACEMENT, "utf8")); } catch { return null; }
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");

  // ---- placement API ----
  if (u.pathname === "/api/placement") {
    if (req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify(readPlacement()));
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const j = JSON.parse(body);
          fs.writeFileSync(PLACEMENT, JSON.stringify(j, null, 2) + "\n");
          console.log("saved placement.json:", JSON.stringify(j));
          res.writeHead(200, { "content-type": "application/json" });
          res.end('{"ok":true}');
        } catch (e) {
          res.writeHead(400);
          res.end(String((e && e.message) || e));
        }
      });
      return;
    }
    if (req.method === "DELETE") {
      try { if (fs.existsSync(PLACEMENT)) fs.unlinkSync(PLACEMENT); } catch { /* ignore */ }
      console.log("reset placement.json (removed)");
      res.writeHead(200, { "content-type": "application/json" });
      return res.end('{"ok":true}');
    }
  }

  // ---- static: config.js ----
  if (u.pathname === "/config.js") {
    res.writeHead(200, { "content-type": "application/javascript; charset=utf-8" });
    return res.end(fs.readFileSync(path.join(DIR, "config.js")));
  }

  // ---- the editor page ----
  if (u.pathname === "/" || u.pathname === "/index.html" || u.pathname === "/techpack.html") {
    const art = artwork();
    if (art.error) {
      res.writeHead(500, { "content-type": "text/html; charset=utf-8" });
      return res.end(
        `<pre style="font:14px ui-monospace,Consolas,monospace;padding:24px;color:#c62828">` +
        `Cannot open the placement editor: garment artwork missing in ./reference/.\n\n` +
        `  back  (name containing 'pantocrator' or 'back'): ${art.back || "NOT FOUND"}\n` +
        `  front (name containing 'front' or 'linework'):   ${art.front || "NOT FOUND"}\n\n` +
        `Add the file(s) to techpack/reference/ and reload.</pre>`
      );
    }
    let html = fs.readFileSync(path.join(DIR, "techpack.html"), "utf8");
    const inject =
      `<script>window.__EDIT=true;` +
      `window.__ARTWORK=${JSON.stringify(art)};` +
      `window.__PLACEMENTS=${JSON.stringify(readPlacement())};</script>`;
    html = html.replace('<script src="config.js"></script>', '<script src="config.js"></script>\n' + inject);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  res.writeHead(404);
  res.end("not found");
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`\nFRONI placement editor  ->  ${url}`);
  console.log(`  drag to move  ·  corner scales  ·  right / bottom edges stretch  ·  Save`);
  console.log(`  then bake the PDF with:  npm run build`);
  console.log(`  (Ctrl+C to stop)\n`);
  const opener = process.platform === "win32" ? `start "" "${url}"`
    : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
  exec(opener, () => { /* best-effort auto-open; ignore failures */ });
});
