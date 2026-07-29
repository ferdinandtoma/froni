# Site Tech Pack — froni.co capture page

Standing build reference, July 15, 2026. All values below are starting values from Ferdinand's setup spec; each is tunable at its ladder rung in the design loop and nothing visual is final without a CONFIRMED there. The design law (`.claude\skills\design-loop\references\design-law.md`) binds everything here.

## Tokens

All tokens live as CSS custom properties on `:root` in `site\styles.css`.

Color (rung 4):

- tenebrae `#131114` — ground
- bone `#EDE6D6` — text
- gold `#C9A227` — ink only
- porphyry `#4E2A3A` — sparing ground

Type (rung 2):

- Body: EB Garamond, self-hosted
- `--text-body`: `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)`
- `--text-line` (the three lines): `clamp(1.125rem, 1.05rem + 0.5vw, 1.375rem)`
- `--text-small`: `0.8125rem`
- Body line-height: `1.6`
- Small-caps tracking: `0.08em` (`--tracking-caps`)

Spacing (rung 3): `--s1..--s9` = 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6 rem.

Breakpoints (rung 8): 360, 720.

Motion (rung 9):

- `--t-fast`: 180ms
- `--t-med`: 400ms
- `--t-slow`: 900ms
- `--ease-settle`: `cubic-bezier(0.22, 1, 0.36, 1)`

## Anatomy and states

The page carries the wordmark, the three lines, the form, nothing else. (The design law also names a legal footer for the capture state; it is not yet placed and waits on copy and a rung 1 decision.)

The three lines and the button text stand verbatim as confirmed: "Christ Pantocrator, embroidered on a heavyweight hoodie." / "200 made to order in Portugal." / "November 22." Button: "Notify me".

Form states, all seven (rung 6):

1. default — bone hairline under the field
2. focus — gold underline draws in over `--t-fast`
3. filled — field holds a value; underline stays bone until focus
4. submitting — button disabled, request in flight
5. error — `[COPY: error]` line appears; field keeps its value
6. check-your-inbox — form dissolves over `--t-med` to `[COPY: check-inbox]` (double opt-in is on)
7. confirmed — `[COPY: confirmed]` line, reached at `#confirmed` after the opt-in link

Copy slots on the page: `[COPY: error]`, `[COPY: check-inbox]`, `[COPY: consent]`, `[COPY: confirmed]`. Filled only from Froni_Copywriting_Document_v1 or by Ferdinand.

State mechanics (implementation, not taste): the form root carries `data-state`; CSS renders each state from it. Without JS, states check-your-inbox, error, and confirmed are reachable as `#check-inbox`, `#error`, `#confirmed` via CSS `:target` after the function's redirect. With JS, fetch drives the transitions. On localhost the network is mocked: success after ~600ms; an address beginning `error@` rehearses the error state. Every state is therefore rehearsable in the design loop.

## Motion

Entrance only, driven entirely by the motion tokens (rung 9):

- 300ms stillness on tenebrae
- wordmark fades in over `--t-slow` with a 6px settle
- the three lines follow, staggered 250ms apart, each 600ms with a 4px rise
- field and button last
- total under 2500ms; then the page is completely still

Starting timeline (each figure a token in the `--entrance-*` group): still 300ms; wordmark 300–1200ms; lines at 800 / 1050 / 1300ms, 600ms each; form 1550–2150ms. Total 2150ms.

After entrance, motion exists only at the hand: gold underline draws on input focus over `--t-fast`, existing button hover, form dissolves to check-your-inbox over `--t-med`.

`prefers-reduced-motion`: everything present immediately, no transforms, no transitions.

## Assets

- `assets\FRONI-wordmark-bone.svg` — wordmark, Gilda Display as SVG only, copied from `C:\cipher`, never re-set live
- `assets\favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png`
- `assets\fonts\eb-garamond-latin.woff2` — variable weight axis; one file serves 400, 500, 600 (Google's latin subset ships the weights as a single variable font)
- `assets\fonts\eb-garamond-latin-italic.woff2` — 400 italic
- The body renders in 400; that weight file is preloaded. Weight is weight-tested on tenebrae at rung 2 (law: take the next weight up if the regular blooms weak) — the variable file already carries 500 and 600.
- No external font host referenced anywhere.

## Wiring

- Form: plain HTML, `action="/api/subscribe"`, `method="post"`, honeypot field. Without JS it is a normal POST; the function answers form posts with a 303 redirect back to the page (`#check-inbox` or `#error`). With JS, fetch posts JSON to the same endpoint and drives the states.
- Function: `site\functions\api\subscribe.js` (Cloudflare Pages Function). Validates the email, silently accepts and drops a filled honeypot, relays server-side to Klaviyo's subscribe endpoint (double opt-in respected by list settings), returns JSON matching the client states. Secrets come only from env vars `KLAVIYO_PRIVATE_KEY` and `KLAVIYO_LIST_ID`; no secret value exists in the repo.
- Live function testing needs `wrangler pages dev site`; not required for the design loop, where localhost mocks the response.
- Analytics: PostHog EU cloud, cookieless. Script injected after first paint (window load), `cookieless_mode: "always"`, `api_host: https://eu.i.posthog.com`, session recording and surveys disabled, no identify calls. Project key is the single constant `POSTHOG_KEY` at the top of `site\app.js`, marked `[ENV: POSTHOG_KEY]`. Fully disabled when the hostname is localhost.
- The server-side signup event to PostHog (design law: fires from the same function) is not yet wired; it goes in when the PostHog project exists.
- Klaviyo: server-side only, `klaviyo.js` forbidden. Double opt-in on.

## Quality gates

- First load ≤ 200KB including fonts (PostHog excluded, post-paint)
- CLS 0
- AA contrast
- Works at 360px
- Works without JS except analytics
- Reduced-motion parity
