# Froni design law

Binding in every design session. Read fully before touching any file. Where an instinct conflicts with this document, the document wins. Where Ferdinand overrides in the loop, his word wins, and the design log records the revision.

## What the page is

One URL, three states in time. Until the window opens it captures emails. During the window it sells one product. Afterward it stands as the permanent record of the edition. No about page, no story page, no navigation, ever. The capture state carries the wordmark, the three lines, the field, the button, and a legal footer; nothing else without Ferdinand's confirmation. Price appears nowhere on the capture page (decided; it reveals mid-email-sequence).

## Ground and palette

- tenebrae `#131114`. The ground, always. Near-black, never pure `#000`.
- bone `#EDE6D6`. The text. A step below white; body text never pure `#fff`.
- gold `#C9A227`. Ink only, never a ground, never a fill of any area. Micro-moments: a hairline rule, a focus line, one word, a hover. Fields of gold are forbidden.
- porphyry `#4E2A3A`. May ground bone text or gold ink (the button uses it). Used sparingly.

From the July 15 design research: this is exactly the pattern of the one fully verified grave dark-ground site (Jacques Marie Mage: black ground, one warm gold accent used sparingly, vast void). The kitsch failure mode is concrete: pure black plus saturated color, dense grids, heavy display faces, ornament. Skulls-and-neon is one wrong variable away; the margin is the reverence.

## Type

- Wordmark: Gilda Display, used only as the SVG in `site\assets`. Never re-set live, never substituted.
- Body: EB Garamond, self-hosted from the site's own domain (decided July 15). No external font host, ever; that is both a GDPR ruling in Germany and a performance rule.
- Light serifs thin out on near-black: weight-test on tenebrae and take the next weight up if the regular blooms weak. Wide tracking on any small caps. Line height generous.

## Absolute prohibitions on the page

No countdown timers. No stock or unit counters. No urgency elements of any kind. No reviews, ratings, or trust badges. No press logos. No exclamation marks. No emojis. No discount language, ever. Never the words luxury or premium about the house. No link aggregators; the domain is the only link anywhere. Signage carries nouns and dates, never arguments. Date and feast never fuse in one line.

## Scripts and privacy (wired decisions, July 15)

The page must never require a cookie banner, which means nothing on it may store or read anything on the visitor's device:

- The form is plain HTML posting to a Cloudflare Pages Function that relays server-side to Klaviyo. The Klaviyo JavaScript (`klaviyo.js`) is forbidden on the page; it sets a marketing cookie.
- Analytics is PostHog on the EU cloud in cookieless server hash mode (`cookieless_mode: "always"` in the init AND the project setting enabled). No identify calls, no session replay, no surveys. The signup event fires from the same Cloudflare Function, server-side.
- Fonts self-hosted. No other third-party script, pixel, or embed of any kind.
- Double opt-in is on; the page needs a check-your-inbox state after submit, designed, not defaulted.

## Motion

Default none. At most one quiet fade on load. Nothing scroll-triggered, nothing looping, nothing hovering for attention. `prefers-reduced-motion` respected.

## Copy

Comes from Froni_Copywriting_Document_v1 or from Ferdinand, verbatim. The agent never writes house copy; blanks are marked `[COPY: ...]`. The three confirmed lines stand as placed: "Christ Pantocrator, embroidered on a heavyweight hoodie." / "200 made to order in Portugal." / "November 22."

## Quality floor

Responsive to 360 px. Visible keyboard focus (gold as the focus ink is permitted). Body contrast meets WCAG AA on tenebrae. Page weight small; assets local; no layout shift; the page works with JavaScript disabled except for analytics and live niceties.

## Assets

Brand sources live in `C:\cipher\brand\wordmark` and are copied into `site\assets`, never referenced across. The wordmark, favicons, and og image already sit there.
