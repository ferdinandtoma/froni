# Froni — project instructions

Froni is a Catholic clothing house. First product: the Christ Pantocrator icon from Saint Catherine's, Sinai, embroidered on a heavyweight hoodie. Edition of 200, made to order in Portugal, window opens November 22, sells until the 200th order and never reopens. This directory holds the website, working documents, and image references. Ferdinand Toma is the founder and the only decision-maker.

## How to work with Ferdinand

- Plain prose, terse, verdict first. Length as the subject needs.
- No status labels (LOCKED, PROPOSED and similar are retired). No invented metaphors or coined vocabulary. Plain verbs.
- Bullets only for genuine lists (vendors, prices, specs). Bold rarely.
- Replies end when the answer ends. No recaps, no menus, no closing rituals.
- Disagree once, plainly, with the reason. If he overrides, fold immediately and treat it as his revision.
- His decisions and your proposals stay visibly separate everywhere, above all in documents and logs. Never write a suggestion of yours as something he decided.
- Documents and notes are updated only when he asks.
- External artifacts (anything leaving the house: emails, briefs, factory documents): no em dashes, no all-caps headers, no credibility-seeking language, minimal asks.

## Map

- `site\` — the froni.co capture page. Must be deployable as-is to Cloudflare Pages at every moment. The review overlay, `_variant-*.html` files, and logs never live here at rest.
- `docs\` — working documents, including `design-log.md` (append-only record of confirmed design decisions).
- `reference\` — icon scans and artwork authorities. Naming convention in its README. The canonical scan, not any render, is the face's authority.
- `.claude\skills\design-loop\` — the design protocol. It loads for any visual work; its `references\design-law.md` binds every design decision.
- Brand sources and the garment tech pack pipeline live in `C:\cipher`. Copy assets into `site\assets`; never reference across, never modify anything in `C:\cipher` from here.

## Hard rules

- All frontend or visual work runs through the design-loop skill: dev server, the ladder, Ferdinand's confirmation through the overlay. No visual change is final without a confirm.
- Never write house copy. Blanks are marked `[COPY: ...]` and filled only from Froni_Copywriting_Document_v1 or by Ferdinand verbatim.
- Nothing on the page may store or read anything on a visitor's device; the page never shows a cookie banner. Form: plain HTML posting to a Cloudflare Pages Function that relays server-side to Klaviyo (never klaviyo.js). Analytics: PostHog EU cloud, cookieless server hash mode only. Fonts self-hosted. No other third-party script, pixel, or embed.
- No countdown timers, no counters, no urgency elements, no reviews or badges, no exclamation marks, no emojis, no discount language, never the words luxury or premium about the house. The domain is the only link anywhere.
- Price appears nowhere on the capture page.

## Commands

- Dev server: `node C:\froni\.claude\skills\design-loop\scripts\serve.mjs` (serves `site\` on http://localhost:4949, background it)
- Wait for Ferdinand's confirm: `node C:\froni\.claude\skills\design-loop\scripts\wait.mjs` (rerun on NO_FEEDBACK_YET)

## Decisions of record for the site (July 15, 2026)

Body typeface EB Garamond, self-hosted, weight-tested on tenebrae. Wordmark Gilda Display as SVG only. Klaviyo with double opt-in, wired server-side. PostHog EU cookieless as the only analytics. One URL, three states in time: email capture now, one-product store at window open, permanent record after the 200th order. The door closes on the 200th order, not on a date.
