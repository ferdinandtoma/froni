import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const answersDir = path.join(here, "answers");
const attachmentsDir = path.join(answersDir, "attachments");
const answersFile = path.join(answersDir, "answers.json");
const accessKeyFile = path.join(answersDir, "phone-access-key.txt");
const cliArgs = process.argv.slice(2);
const portArgument = cliArgs.find((argument) => /^\d+$/.test(argument));
const port = Number(portArgument || 4950);
const lanMode = cliArgs.includes("--lan");
const listenHost = lanMode ? "0.0.0.0" : "127.0.0.1";
const logoFile = path.join(
  projectRoot,
  "brand",
  "wordmark",
  "logo",
  "FRONI-wordmark-tenebrae.svg",
);
const designLoopDir = path.join(projectRoot, ".design-loop");
const feedbackFile = path.join(designLoopDir, "feedback.json");
const backupFormat = "froni-foundation-questionnaire-backup-v1";

fs.mkdirSync(attachmentsDir, { recursive: true });
fs.mkdirSync(designLoopDir, { recursive: true });

let accessKey = null;
if (lanMode) {
  if (fs.existsSync(accessKeyFile)) {
    accessKey = fs.readFileSync(accessKeyFile, "utf8").trim();
  }
  if (!/^[a-f0-9]{16}$/.test(accessKey || "")) {
    accessKey = crypto.randomBytes(8).toString("hex");
    fs.writeFileSync(accessKeyFile, `${accessKey}\n`, "utf8");
  }
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8", headers = {}) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    ...headers,
  });
  res.end(body);
}

function readBody(req, limit = 8 * 1024 * 1024) {
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

function isLoopbackRequest(req) {
  const address = String(req.socket.remoteAddress || "");
  return (
    address === "127.0.0.1" ||
    address === "::1" ||
    address === "::ffff:127.0.0.1"
  );
}

function keysMatch(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function mayReadPrivateData(req, requestUrl) {
  if (!accessKey || isLoopbackRequest(req)) return true;
  const header = Array.isArray(req.headers["x-froni-local-key"])
    ? req.headers["x-froni-local-key"][0]
    : req.headers["x-froni-local-key"];
  const supplied = header || requestUrl.searchParams.get("key");
  return keysMatch(supplied, accessKey);
}

function localIpv4Addresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(
      (address) =>
        address &&
        address.family === "IPv4" &&
        !address.internal &&
        /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address.address),
    )
    .map((address) => address.address);
}

function safeSegment(value, fallback) {
  const cleaned = String(value || "")
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 90);
  return cleaned || fallback;
}

function writeJsonAtomic(file, value) {
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, file);
}

function loadAnswers() {
  if (!fs.existsSync(answersFile)) {
    return {
      schemaVersion: 1,
      questionnaireVersion: null,
      updatedAt: null,
      responses: {},
    };
  }
  try {
    return JSON.parse(fs.readFileSync(answersFile, "utf8"));
  } catch {
    return {
      schemaVersion: 1,
      questionnaireVersion: null,
      updatedAt: null,
      responses: {},
      recoveryNotice: "The saved answer file could not be parsed.",
    };
  }
}

function buildBackup() {
  const files = fs
    .readdirSync(attachmentsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const file = path.join(attachmentsDir, entry.name);
      const buffer = fs.readFileSync(file);
      return {
        storedName: entry.name,
        size: buffer.length,
        dataBase64: buffer.toString("base64"),
      };
    });
  return {
    backupFormat,
    exportedAt: new Date().toISOString(),
    state: loadAnswers(),
    files,
  };
}

function restoreBackup(payload) {
  const importedState =
    payload?.backupFormat === backupFormat ? payload.state : payload;
  if (
    !importedState ||
    typeof importedState !== "object" ||
    !importedState.responses ||
    typeof importedState.responses !== "object"
  ) {
    throw new Error("Invalid questionnaire backup");
  }

  if (payload?.backupFormat === backupFormat && Array.isArray(payload.files)) {
    payload.files.forEach((entry) => {
      const storedName = safeSegment(entry?.storedName, "");
      if (!storedName || typeof entry?.dataBase64 !== "string") return;
      const target = path.join(attachmentsDir, storedName);
      const buffer = Buffer.from(entry.dataBase64, "base64");
      fs.writeFileSync(target, buffer);
    });
  }

  importedState.schemaVersion = 1;
  importedState.updatedAt = new Date().toISOString();
  writeJsonAtomic(answersFile, importedState);
  return importedState;
}

const reviewOverlay = [
  '<div id="__dl" style="position:fixed;bottom:12px;right:12px;z-index:2147483647;',
  'font:12px system-ui,sans-serif;color:#ddd;max-width:calc(100vw - 24px)">',
  '<button id="__dl_o" style="padding:7px 10px;background:#222;color:#eee;',
  'border:1px solid #555;border-radius:4px;cursor:pointer;font:12px system-ui,sans-serif">',
  'Review interface</button>',
  '<div id="__dl_p" hidden style="background:#111;border:1px solid #555;border-radius:4px;',
  'padding:8px;opacity:.96;max-width:320px">',
  '<div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:6px">',
  '<span>Interface review</span><button id="__dl_c" style="padding:0;border:0;',
  'background:transparent;color:#aaa;cursor:pointer;font:11px system-ui,sans-serif">',
  'Minimize</button></div><div style="display:flex;gap:6px;align-items:flex-end">',
  '<textarea id="__dl_t" placeholder="Interface review note" ',
  'style="width:min(220px,calc(100vw - 130px));height:52px;background:#191919;color:#eee;border:1px solid #555;',
  'font:12px system-ui,sans-serif;padding:4px;resize:vertical"></textarea>',
  '<button id="__dl_b" style="padding:6px 12px;background:#333;color:#fff;',
  'border:1px solid #666;cursor:pointer;font:12px system-ui,sans-serif">Confirm</button>',
  '</div><div id="__dl_s" style="margin-top:4px;font-size:10px;color:#999">',
  'Confirm when the interface is ready</div></div></div>',
  '<script>(function(){var o=document.getElementById("__dl_o"),',
  'p=document.getElementById("__dl_p"),c=document.getElementById("__dl_c"),',
  't=document.getElementById("__dl_t"),b=document.getElementById("__dl_b"),',
  's=document.getElementById("__dl_s"),k=new URLSearchParams(location.search).get("key")||"";',
  'o.onclick=function(){o.hidden=true;p.hidden=false;t.focus();};',
  'c.onclick=function(){p.hidden=true;o.hidden=false;};',
  'b.onclick=function(){var h={"Content-Type":"application/json"};',
  'if(k)h["X-Froni-Local-Key"]=k;',
  'fetch("/__feedback",{method:"POST",headers:h,',
  'body:JSON.stringify({text:t.value,page:location.pathname})}).then(function(){',
  't.value="";s.textContent="sent "+new Date().toLocaleTimeString();});};})();</script>',
].join("");

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`);
  const urlPath = decodeURIComponent(requestUrl.pathname);

  try {
    if (
      (urlPath.startsWith("/api/") || urlPath === "/__feedback") &&
      !mayReadPrivateData(req, requestUrl)
    ) {
      send(res, 401, "Use the private phone link shown by the local server.");
      return;
    }

    if (req.method === "GET" && urlPath === "/api/health") {
      send(
        res,
        200,
        JSON.stringify({ ok: true, localOnly: true }),
        types[".json"],
      );
      return;
    }

    if (req.method === "GET" && urlPath === "/api/state") {
      send(res, 200, JSON.stringify(loadAnswers()), types[".json"]);
      return;
    }

    if (req.method === "GET" && urlPath === "/api/backup") {
      send(
        res,
        200,
        JSON.stringify(buildBackup()),
        types[".json"],
        {
          "Content-Disposition":
            'attachment; filename="froni-foundation-questionnaire-backup.json"',
        },
      );
      return;
    }

    if (req.method === "POST" && urlPath === "/api/state") {
      const raw = await readBody(req);
      const state = JSON.parse(raw.toString("utf8") || "{}");
      state.schemaVersion = 1;
      state.updatedAt = new Date().toISOString();
      writeJsonAtomic(answersFile, state);
      send(res, 200, JSON.stringify({ ok: true, updatedAt: state.updatedAt }), types[".json"]);
      return;
    }

    if (req.method === "POST" && urlPath === "/api/import") {
      const raw = await readBody(req, 256 * 1024 * 1024);
      const payload = JSON.parse(raw.toString("utf8") || "{}");
      const importedState = restoreBackup(payload);
      send(
        res,
        200,
        JSON.stringify({ ok: true, updatedAt: importedState.updatedAt }),
        types[".json"],
      );
      return;
    }

    if (req.method === "POST" && urlPath === "/api/upload") {
      const questionId = safeSegment(req.headers["x-question-id"], "question");
      let decodedName = String(req.headers["x-file-name"] || "");
      try {
        decodedName = decodeURIComponent(decodedName);
      } catch {
        // Keep the received name when it is not percent encoded.
      }
      const originalName = safeSegment(decodedName, "attachment");
      const raw = await readBody(req, 30 * 1024 * 1024);
      const ext = path.extname(originalName).slice(0, 12);
      const base = path.basename(originalName, ext);
      const storedName = `${questionId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${base}${ext}`;
      fs.writeFileSync(path.join(attachmentsDir, storedName), raw);
      send(
        res,
        200,
        JSON.stringify({
          ok: true,
          name: originalName,
          storedName,
          size: raw.length,
          type: String(req.headers["x-file-type"] || "application/octet-stream"),
          savedAt: new Date().toISOString(),
        }),
        types[".json"],
      );
      return;
    }

    if (req.method === "GET" && urlPath.startsWith("/api/attachment/")) {
      const name = safeSegment(urlPath.slice("/api/attachment/".length), "");
      const file = path.join(attachmentsDir, name);
      if (
        !name ||
        !file.startsWith(`${attachmentsDir}${path.sep}`) ||
        !fs.existsSync(file)
      ) {
        send(res, 404, "Attachment not found");
        return;
      }
      const stat = fs.statSync(file);
      send(
        res,
        200,
        fs.readFileSync(file),
        "application/octet-stream",
        {
          "Content-Length": stat.size,
          "Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"`,
        },
      );
      return;
    }

    if (req.method === "POST" && urlPath === "/__feedback") {
      const raw = await readBody(req, 128 * 1024);
      let data = {};
      try {
        data = JSON.parse(raw.toString("utf8") || "{}");
      } catch {
        data = { text: raw.toString("utf8") };
      }
      const payload = {
        text: String(data.text || "").trim(),
        page: String(data.page || "/"),
        at: new Date().toISOString(),
      };
      writeJsonAtomic(feedbackFile, payload);
      send(res, 200, "ok");
      return;
    }

    if (req.method === "GET" && urlPath === "/brand-wordmark.svg") {
      if (!fs.existsSync(logoFile)) {
        send(res, 404, "Logo not found");
        return;
      }
      send(res, 200, fs.readFileSync(logoFile), types[".svg"]);
      return;
    }

    let rel = urlPath;
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.resolve(here, `.${rel}`);
    if (file !== here && !file.startsWith(`${here}${path.sep}`)) {
      send(res, 403, "Forbidden");
      return;
    }
    fs.readFile(file, (error, buffer) => {
      if (error) {
        send(res, 404, "Not found");
        return;
      }
      const ext = path.extname(file).toLowerCase();
      const type = types[ext] || "application/octet-stream";
      if (ext === ".html") {
        const html = buffer.toString("utf8");
        send(
          res,
          200,
          html.replace(/<\/body>/i, `${reviewOverlay}</body>`),
          type,
          {
            "Content-Security-Policy":
              "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'",
          },
        );
        return;
      }
      send(res, 200, buffer, type);
    });
  } catch (error) {
    send(res, 500, error instanceof Error ? error.message : "Server error");
  }
});

server.on("error", (error) => {
  console.error(`server error: ${error.message}`);
  process.exit(1);
});

server.listen(port, listenHost, () => {
  console.log(`Froni foundation questionnaire: http://127.0.0.1:${port}`);
  if (lanMode) {
    localIpv4Addresses().forEach((address) => {
      console.log(`Phone: http://${address}:${port}/?key=${accessKey}`);
    });
    console.log("Phone access is limited by a private key. Use trusted Wi-Fi.");
  }
  console.log(`Answers: ${answersFile}`);
});
