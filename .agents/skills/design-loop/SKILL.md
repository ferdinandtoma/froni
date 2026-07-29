---
name: design-loop
description: Iterative human-in-the-loop design protocol for the Froni site. Use this skill for ANY frontend, visual, or design work in this repository, including building or changing the capture page, HTML, CSS, layout, typography, color, spacing, the form and its states, responsive behavior, favicons, or placing copy into the page. Trigger it even for one-line style tweaks and even if the user never says the word design. It carries the binding Froni design law (references/design-law.md) and the confirmation loop (dev server plus wait script) through which Ferdinand approves every aspect by eye before it stands.
---

# Design loop

Every visual decision on this site is confirmed by Ferdinand looking at a rendered page, not by descriptions in chat. This skill defines the loop that makes that happen and the law the design must obey. Nothing visual is final until it has been confirmed through the loop.

## Session open, always in this order

1. Read `references/design-law.md` in full. It binds every change.
2. Read `C:\froni\docs\design-log.md` if it exists. Rungs confirmed there are closed; do not reopen them unless Ferdinand asks.
3. Start the dev server as a background process:
   `node C:\froni\.Codex\skills\design-loop\scripts\serve.mjs`
   It serves `C:\froni\site` on http://localhost:4949 and injects a review overlay (text field plus Confirm button) into every HTML page at serve time. The overlay exists only in the served response, never in the source files.
4. Open the browser for him: `start http://localhost:4949` (PowerShell/cmd).
5. Say which rung of the ladder is live, in one plain sentence.

## The wait, which is how Ferdinand wakes you

After presenting anything, run:
`node C:\froni\.Codex\skills\design-loop\scripts\wait.mjs`

It blocks until he clicks Confirm in the overlay, then prints:
- `STATUS: CONFIRMED` if the text field was empty. The aspect stands.
- `STATUS: CHANGES` plus his text, verbatim, if he typed. Do what the text says.
- `NO_FEEDBACK_YET` if nothing arrived within the poll window. Run the same command again and keep waiting. Never proceed past a rung without a CONFIRMED, and never invent feedback.

Give the wait call a long tool timeout when possible. Repeated NO_FEEDBACK_YET is normal; he is looking.

## The ladder

One aspect per confirmation (his rule, July 15). Work the rungs in order, no skipping, one CONFIRMED closes a rung:

1. Structure and skeleton. What is on the page, in what order, how it sits in the viewport.
2. Typography. EB Garamond rendering on tenebrae: weight, sizes, line height, tracking. Taste rung.
3. Spacing and rhythm. Gaps, margins, the breathing of the page. Taste rung.
4. Color application. Where gold ink lands, whether porphyry appears, contrast of bone on tenebrae. Taste rung.
5. Wordmark treatment. Size and placement of the SVG. Taste rung.
6. The form. Field, button, focus, hover, error, success, and the check-your-inbox state after submit.
7. Micro-details. Selection color, favicon rendering, og preview, title, scrollbar if styled.
8. Responsive. 360 px up; social traffic is mobile-first, so the phone view is not an afterthought.
9. Motion. Default is none; at most one quiet page-load fade. Taste rung only if anything moves.
10. Final pass. Contrast check, keyboard focus visible, reduced motion respected, page weight, no layout shift.

## Per-rung protocol

- Taste rungs open with 2 or 3 variants (his rule, July 15: variants first, then single proposals for changes). Build them as `_variant-a.html`, `_variant-b.html` in the site folder; the overlay shows switch buttons automatically. After his first feedback, converge with single proposals on the main page until an empty-field CONFIRMED.
- Mechanical rungs are single proposals from the start.
- Before each wait, say in chat, in one or two plain sentences, what changed and what is being decided. No more than that.
- On CHANGES: do exactly what the text says. If it breaks the design law or physics, say so once, plainly, then fold if he holds; a held override is a revision of the law and goes in the log as his decision.
- On CONFIRMED: append to the log, delete any `_variant-*.html` files, move to the next rung.

## The log

`C:\froni\docs\design-log.md`, append-only. Each entry: date, rung, what now stands. Quote Ferdinand verbatim where his words decided the outcome. Anything that was your idea is written as a proposal he accepted, never as his decision. Never rewrite or delete old entries; a change of mind gets a new entry.

## Hygiene

- The overlay is injection-only. If it ever appears in a source file, that is a bug to fix immediately.
- `_variant-*.html` files never survive a closed rung. The `site\` folder must be deployable as-is at every moment.
- Nothing that stores or reads anything on the visitor's device may ever be added to the page. The permitted scripts are listed in the design law; there are no others.
- Copy is not yours to write. Placeholder blanks are marked `[COPY: ...]` and filled only from Froni_Copywriting_Document_v1 or by Ferdinand.

## How to talk during the loop

Plain prose, terse, no status labels, no invented vocabulary. Cite past decisions plainly ("you confirmed the type scale on the 15th"). Replies end when the answer ends.
