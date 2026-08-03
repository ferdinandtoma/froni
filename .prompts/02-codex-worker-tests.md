<task>
Black-box test suite for the live capture worker, site/_worker.js, using only Node's built-in test runner. The worker is a Cloudflare Pages advanced-mode module: default export with fetch(request, env, ctx); it serves assets via env.ASSETS.fetch, relays POST /api/subscribe server-side to Klaviyo, redirects /t /i /y with UTM parameters, and captures $pageview and signup_submitted to PostHog only when env.POSTHOG_API_KEY is set.

Create exactly two files at the repository root:
- package.json: { "type": "module", scripts: { "test": "node --test tests/" } }, no dependencies.
- tests/worker.test.mjs: imports site/_worker.js, builds fake env (KLAVIYO_PRIVATE_KEY, KLAVIYO_LIST_ID, optional POSTHOG_API_KEY), a ctx whose waitUntil collects promises, an ASSETS stub returning HTML or non-HTML responses, and stubs global fetch to record Klaviyo and PostHog calls.

Cover:
1. Form POST /api/subscribe with valid email: relays to a.klaviyo.com with the list id, responds 303 to /#check-inbox.
2. JSON POST with valid email: 200 with ok true and state check-your-inbox.
3. Filled honeypot (website field): success response, zero Klaviyo calls.
4. Invalid email: 303 to /#error on form, 400 on JSON; zero Klaviyo calls.
5. Missing Klaviyo env: 503 on JSON path.
6. Klaviyo non-ok response: 502 on JSON path.
7. GET /api/subscribe: 405 with Allow POST. GET /api/anything-else: 404.
8. /t /i /y: 302 to / with utm_source tiktok, instagram, youtube and utm_campaign edition-one.
9. PostHog: with POSTHOG_API_KEY set, a GET serving 200 HTML fires one capture to eu.i.posthog.com after awaiting waitUntil promises, and a successful subscribe fires signup_submitted; without the key, zero PostHog calls; a non-ok ASSETS response fires none.
10. Security headers present on responses (Content-Security-Policy, X-Frame-Options), set-cookie stripped.
</task>

<constraints>
site/** is strictly read-only; do not modify any existing file. Only /package.json and /tests/worker.test.mjs may be created. Node built-ins only, no dependencies, no git commands, no commits, no pushes. If the worker uses an API your Node lacks, polyfill inside the test file, never edit the worker. If a test reveals a real worker bug, do not fix the worker; assert the current behavior and flag the finding prominently in the report.
</constraints>

<verify>
Run and paste real output, not claims: npm test from the repository root, all tests green. Iterate until green, max 5 iterations; if not green after 5, stop and report the residue rather than weakening assertions. Finish with git status --short; leave everything uncommitted.
</verify>
