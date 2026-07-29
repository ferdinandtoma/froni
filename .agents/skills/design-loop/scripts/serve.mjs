// design-loop dev server. Zero dependencies. Node 18+.
// Serves the site with a review overlay injected at serve time; the overlay
// never exists in the source files. Feedback lands in C:\froni\.design-loop\feedback.json
// where wait.mjs picks it up.
//
// Usage: node serve.mjs [rootDir] [port]
// Defaults: rootDir = <project>\site, port = 4949

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..', '..', '..', '..'); // C:\froni
const root = path.resolve(process.argv[2] || path.join(projectRoot, 'site'));
const port = Number(process.argv[3] || 4949);
const runtime = path.join(projectRoot, '.design-loop');
fs.mkdirSync(runtime, { recursive: true });

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

function latestMtime(dir) {
  let m = 0;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return m; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    try {
      const st = fs.statSync(p);
      m = e.isDirectory() ? Math.max(m, latestMtime(p)) : Math.max(m, st.mtimeMs);
    } catch { /* file vanished mid-scan */ }
  }
  return m;
}

// The review overlay. Injected before </body> of every served HTML page.
// Empty text + Confirm = confirmed. Text + Confirm = change request.
const overlay = [
  '<div id="__dl" style="position:fixed;bottom:12px;right:12px;z-index:2147483647;',
  'background:#0b0a0c;border:1px solid #3a3a3a;border-radius:4px;padding:8px;',
  'font:12px system-ui,sans-serif;color:#cfcfcf;opacity:.94;max-width:320px">',
  '<div id="__dl_v" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px"></div>',
  '<div style="display:flex;gap:6px;align-items:flex-end">',
  '<textarea id="__dl_t" placeholder="empty = confirmed" ',
  'style="width:220px;height:52px;background:#141414;color:#ddd;border:1px solid #333;',
  'font:12px system-ui,sans-serif;padding:4px;resize:vertical"></textarea>',
  '<button id="__dl_b" style="padding:6px 12px;background:#2a2a2a;color:#eee;',
  'border:1px solid #444;cursor:pointer;font:12px system-ui,sans-serif">Confirm</button>',
  '</div><div id="__dl_s" style="margin-top:4px;font-size:10px;color:#777">design loop</div></div>',
  '<script>(function(){',
  'var t=document.getElementById("__dl_t"),b=document.getElementById("__dl_b"),',
  's=document.getElementById("__dl_s"),v=document.getElementById("__dl_v");',
  'fetch("/__variants").then(function(r){return r.json()}).then(function(list){',
  'if(!list.length)return;',
  'var mk=function(label,href){var a=document.createElement("a");a.textContent=label;a.href=href;',
  'a.style.cssText="padding:2px 8px;border:1px solid #444;color:#ddd;text-decoration:none;font-size:11px";',
  'v.appendChild(a)};mk("base","/");',
  'list.forEach(function(f){mk(f.replace("_variant-","").replace(".html",""),"/"+f)});});',
  'b.onclick=function(){',
  'fetch("/__feedback",{method:"POST",headers:{"Content-Type":"application/json"},',
  'body:JSON.stringify({text:t.value,page:location.pathname})}).then(function(){',
  't.value="";s.textContent="sent "+new Date().toLocaleTimeString();});};',
  'var base=null;setInterval(function(){fetch("/__mtime").then(function(r){return r.text()})',
  '.then(function(m){if(base===null){base=m;}else if(m!==base){location.reload();}})',
  '.catch(function(){})},1000);',
  '})();</script>',
].join('');

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  if (req.method === 'POST' && urlPath === '/__feedback') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body || '{}'); } catch { data = { text: body }; }
      const payload = {
        text: String(data.text || '').trim(),
        page: String(data.page || '/'),
        at: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(runtime, 'feedback.json'), JSON.stringify(payload, null, 2));
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      console.log('[feedback] ' + payload.at + ' ' + (payload.text ? 'CHANGES' : 'CONFIRMED'));
    });
    return;
  }

  if (urlPath === '/__variants') {
    let list = [];
    try {
      list = fs.readdirSync(root).filter((f) => /^_variant-.+\.html$/i.test(f));
    } catch { /* root unreadable */ }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(list));
    return;
  }

  if (urlPath === '/__mtime') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
    res.end(String(latestMtime(root)));
    return;
  }

  // Static files, path-traversal safe.
  let rel = urlPath;
  if (rel.endsWith('/')) rel += 'index.html';
  const filePath = path.resolve(root, '.' + rel);
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('forbidden'); return;
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('not found: ' + rel); return; }
    const ext = path.extname(filePath).toLowerCase();
    const type = types[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    if (ext === '.html') {
      const html = buf.toString('utf8');
      res.end(/<\/body>/i.test(html) ? html.replace(/<\/body>/i, overlay + '</body>') : html + overlay);
    } else {
      res.end(buf);
    }
  });
});

server.on('error', (e) => {
  console.error('server error: ' + e.message + (e.code === 'EADDRINUSE' ? ' (pass another port: node serve.mjs [root] [port])' : ''));
  process.exit(1);
});

server.listen(port, () => {
  console.log('design loop serving ' + root);
  console.log('open   http://localhost:' + port);
  console.log('feedback lands in ' + runtime);
});
