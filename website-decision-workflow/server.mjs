import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const stateDir = path.join(here, "state");
const stateFile = path.join(stateDir, "state.json");
const activeFile = path.join(here, "active-decision.json");
const designLoopDir = path.join(projectRoot, ".design-loop");
const feedbackFile = path.join(designLoopDir, "feedback.json");
const port = Number(process.argv.find((value) => /^\d+$/.test(value)) || 4960);

const assetFiles = {
  "/brand-wordmark.svg": path.join(
    projectRoot,
    "brand",
    "wordmark",
    "logo",
    "FRONI-wordmark-tenebrae.svg",
  ),
  "/f-mark.svg": path.join(
    projectRoot,
    "brand",
    "wordmark",
    "icon",
    "icon-F-transparent.svg",
  ),
  "/f-mark-square.svg": path.join(
    projectRoot,
    "brand",
    "wordmark",
    "icon",
    "favicon.svg",
  ),
  "/f-mark-on-bone.svg": path.join(
    projectRoot,
    "brand",
    "wordmark",
    "icon",
    "icon-tenebrae-on-bone.svg",
  ),
  "/assets/worn-back.jpg": path.join(projectRoot, "site", "assets", "worn-back.jpg"),
  "/assets/pantocrator-icon.jpg": path.join(
    projectRoot,
    "site",
    "assets",
    "pantocrator-icon.jpg",
  ),
};

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
};

fs.mkdirSync(stateDir, { recursive: true });
fs.mkdirSync(designLoopDir, { recursive: true });

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy":
      "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'",
  });
  res.end(body);
}

function readBody(req, limit = 256 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Request too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function writeJsonAtomic(file, value) {
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, file);
}

function loadActive() {
  return JSON.parse(fs.readFileSync(activeFile, "utf8"));
}

function emptyState() {
  return {
    schemaVersion: 1,
    updatedAt: null,
    drafts: {},
    submissions: [],
    confirmed: {},
    pending: null,
  };
}

function loadState() {
  if (!fs.existsSync(stateFile)) return emptyState();
  try {
    return { ...emptyState(), ...JSON.parse(fs.readFileSync(stateFile, "utf8")) };
  } catch {
    return { ...emptyState(), recoveryNotice: "The saved workflow state could not be parsed." };
  }
}

function currentDraftKey(active) {
  return `${active.roadmapId}:${active.round}`;
}

function safeText(value, max = 12000) {
  return String(value || "").replace(/\u0000/g, "").slice(0, max);
}

function activeVersion() {
  return [
    activeFile,
    path.join(here, "app.js"),
    path.join(here, "styles.css"),
    path.join(here, "index.html"),
  ]
    .map((file) => fs.statSync(file).mtimeMs)
    .join(":");
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`);
  const urlPath = decodeURIComponent(requestUrl.pathname);

  try {
    if (req.method === "GET" && urlPath === "/api/health") {
      send(res, 200, JSON.stringify({ ok: true, localOnly: true }), types[".json"]);
      return;
    }

    if (req.method === "GET" && urlPath === "/api/version") {
      send(res, 200, activeVersion());
      return;
    }

    if (req.method === "GET" && urlPath === "/api/session") {
      send(
        res,
        200,
        JSON.stringify({
          active: loadActive(),
          state: loadState(),
        }),
        types[".json"],
      );
      return;
    }

    if (req.method === "POST" && urlPath === "/api/draft") {
      const active = loadActive();
      const state = loadState();
      const data = JSON.parse((await readBody(req)).toString("utf8") || "{}");
      if (
        data.decisionId !== active.roadmapId ||
        Number(data.round) !== Number(active.round)
      ) {
        send(res, 409, "The live decision changed. Refresh and try again.");
        return;
      }

      state.drafts[currentDraftKey(active)] = {
        selection: safeText(data.selection, 120),
        note: safeText(data.note),
        updatedAt: new Date().toISOString(),
      };
      state.updatedAt = new Date().toISOString();
      writeJsonAtomic(stateFile, state);
      send(res, 200, JSON.stringify(state), types[".json"]);
      return;
    }

    if (req.method === "POST" && urlPath === "/api/confirm") {
      const active = loadActive();
      const state = loadState();
      const data = JSON.parse((await readBody(req)).toString("utf8") || "{}");
      if (
        data.decisionId !== active.roadmapId ||
        Number(data.round) !== Number(active.round)
      ) {
        send(res, 409, "The live decision changed. Refresh and try again.");
        return;
      }

      const selection = safeText(data.selection, 120);
      const note = safeText(data.note).trim();
      const variant = active.variants.find((candidate) => candidate.id === selection);
      if (!variant && !note) {
        send(res, 400, "Choose a variant or write a correction.");
        return;
      }

      const submission = {
        decisionId: active.roadmapId,
        number: active.number,
        round: active.round,
        question: active.question,
        selection: variant?.id || "",
        selectionTitle: variant?.title || "No variant selected",
        note,
        intent: note ? "iterate" : "accept",
        submittedAt: new Date().toISOString(),
      };

      state.submissions.push(submission);
      state.pending = submission;
      state.drafts[currentDraftKey(active)] = {
        selection,
        note,
        updatedAt: submission.submittedAt,
      };
      if (submission.intent === "accept") {
        state.confirmed[active.roadmapId] = submission;
      }
      state.updatedAt = submission.submittedAt;
      writeJsonAtomic(stateFile, state);

      const feedbackText = [
        "Froni website decision workflow",
        `Decision: ${submission.number} ${submission.question}`,
        `Round: ${submission.round}`,
        `Intent: ${submission.intent}`,
        `Selected variant: ${submission.selectionTitle}`,
        `Selected id: ${submission.selection || "none"}`,
        "Correction:",
        submission.note || "none",
      ].join("\n");

      writeJsonAtomic(feedbackFile, {
        text: feedbackText,
        page: `/${active.roadmapId}`,
        at: submission.submittedAt,
      });

      send(res, 200, JSON.stringify(state), types[".json"]);
      return;
    }

    if (assetFiles[urlPath]) {
      const file = assetFiles[urlPath];
      if (!fs.existsSync(file)) {
        send(res, 404, "Asset not found");
        return;
      }
      send(
        res,
        200,
        fs.readFileSync(file),
        types[path.extname(file).toLowerCase()] || "application/octet-stream",
      );
      return;
    }

    let relative = urlPath;
    if (relative.endsWith("/")) relative += "index.html";
    const file = path.resolve(here, `.${relative}`);
    if (file !== here && !file.startsWith(`${here}${path.sep}`)) {
      send(res, 403, "Forbidden");
      return;
    }

    fs.readFile(file, (error, buffer) => {
      if (error) {
        send(res, 404, "Not found");
        return;
      }
      send(
        res,
        200,
        buffer,
        types[path.extname(file).toLowerCase()] || "application/octet-stream",
      );
    });
  } catch (error) {
    send(res, 500, error instanceof Error ? error.message : "Server error");
  }
});

server.on("error", (error) => {
  console.error(`server error: ${error.message}`);
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Froni website decisions: http://127.0.0.1:${port}`);
  console.log(`State: ${stateFile}`);
  console.log(`Wake channel: ${feedbackFile}`);
});
