// design-loop wait. Blocks until the human clicks Confirm in the review overlay,
// then prints the feedback verbatim and exits. If it reports NO_FEEDBACK_YET,
// run it again and keep waiting; never proceed without a result.
//
// Usage: node wait.mjs [maxSeconds]   (default 540)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const runtime = path.resolve(here, '..', '..', '..', '..', '.design-loop'); // C:\froni\.design-loop
const file = path.join(runtime, 'feedback.json');
const maxSeconds = Number(process.argv[2] || 540);
const started = Date.now();

function poll() {
  if (fs.existsSync(file)) {
    let fb = {};
    try { fb = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { fb = {}; }
    try { fs.unlinkSync(file); } catch { /* already gone */ }
    const text = String(fb.text || '').trim();
    console.log('FEEDBACK ' + (fb.at || '') + '  page ' + (fb.page || '/'));
    console.log(text ? 'STATUS: CHANGES' : 'STATUS: CONFIRMED');
    if (text) {
      console.log('TEXT:');
      console.log(text);
    }
    process.exit(0);
  }
  if ((Date.now() - started) / 1000 > maxSeconds) {
    console.log('NO_FEEDBACK_YET after ' + maxSeconds + 's. Run this command again and keep waiting; do not proceed without feedback.');
    process.exit(0);
  }
  setTimeout(poll, 500);
}

poll();
