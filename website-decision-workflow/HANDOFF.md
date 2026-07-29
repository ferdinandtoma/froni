# Website decision workflow handoff

Date: 29 July 2026

## Purpose

This is a private decision tool for resolving the Froni website from first
principles. It is not the public website and must not be deployed with
`froni.co`.

The roadmap is exhaustive, but the interface presents exactly one live
decision:

1. Three concrete variants.
2. One correction field.
3. One confirmation button.

The button writes to the repository design-loop channel and wakes Codex. A
blank correction accepts the selected variant. Written feedback normally asks
for another round on the same decision.

## Authority and source context

Read these before continuing:

1. `AGENTS.md`
2. `docs/Froni_Source_of_Truth_28Jul2026.md`
3. `brand-questionnaire/reports/Froni_Brand_Foundation_Context_Report_29Jul2026.md`
4. `website-decision-workflow/state/state.json`
5. `website-decision-workflow/active-decision.json`

The website reference order supplied by Ferdinand is:

1. Omnèque for effect.
2. Massena for structure.
3. Jacques Marie Mage for edition depth.

Do not import the references' unwanted mechanics. Froni does not adopt
celebrity proof, press proof, luxury language, raffles, broken mobile behavior,
collector hype, or catalogue density.

The current foundation report discards the prior visual system except for the
wordmark and F asset. The website remains the primary place, presents one
public work at a time, and distinguishes introduction, commerce, and permanent
record as states of one identity. Mobile speed, readability, accessibility,
and substance outrank visual effects.

## Working rules established in this session

- Present one decision at a time. Do not expose future questions as competing
  content.
- Every round contains three variants and a stated Codex position.
- A preview must literally show the proposed interface behavior. Generic
  edition imagery is not sufficient evidence for a navigation or identity
  choice.
- Treat written feedback by meaning. A note can be a correction, a rejection,
  a clear decision, or a meta instruction. Do not mechanically assume that
  every non-empty note requires another design round.
- Do not save correction text on every keystroke.
- A choice saves once when changed. Correction text saves when the field is
  left or when the response is submitted.
- Draft writes must never trigger a page rebuild. Only changes to the active
  decision or interface assets may reload the page.
- No current design choice becomes a permanent rule merely because it worked.
  The website can change completely with each edition.

## Decisions recorded

### 01.01 Current-site skeleton

Use the fixed grid and record logic as an underlying skeleton. The visible
edition remains free above it.

Scope: the current site only. This is not permanent house canon.

### 01.02 Current-site wordmark

The wordmark is the persistent, quiet house locator for the current site.

Scope: the current site only. Its position and behavior must be re-earned by a
future edition.

### 01.03 Current-site F brandmark

The F brandmark is not needed anywhere in the current site. There is no F menu
or navigation control. Possible use on legal pages may be considered later,
but it is not part of the present system.

Scope: the current site only.

### 01.04 No permanent design set

No visual or structural decision is permanent. The website changes with each
edition. Prior decisions describe the current site, not every future site.

Legal, accessibility, performance, commerce, and record completeness remain
operating obligations. They are not a visual house style.

### 01.05 Re-earn everything

Nothing carries forward by default. Every edition begins from its own work and
may reuse a prior solution only after independently earning it again.

## Next starting point

`active-decision.json` is prepared at decision 01.06:

> How much visual difference should the process permit between consecutive
> editions?

No answer has been recorded for 01.06. Codex currently recommends no visual
ceiling, but Ferdinand has not confirmed it.

The roadmap contains 18 chapters and 256 unique decisions. Five decisions are
confirmed, leaving 251.

## Technical map

- `server.mjs` serves the private app on `127.0.0.1:4960`.
- `index.html`, `styles.css`, and `app.js` implement the interface.
- `roadmap.js` contains all 256 decision prompts.
- `active-decision.json` contains the one live round and its three variants.
- `state/state.json` contains the committed decision history, confirmed
  resolutions, drafts, and pending submission.
- `design-qa.md` records visual and interaction verification.
- `.design-loop/feedback.json` is the transient wake channel and is consumed by
  the repository wait script.

The server exposes:

- `GET /api/health`
- `GET /api/session`
- `GET /api/version`
- `POST /api/draft`
- `POST /api/confirm`

The version endpoint includes the modification times of the active decision,
application script, stylesheet, and HTML. It intentionally excludes state
writes, which prevents autosave from replacing text under the cursor.

The interface uses only repository assets. It does not fabricate imagery:

- `brand/wordmark/logo/FRONI-wordmark-tenebrae.svg`
- `brand/wordmark/icon/icon-F-transparent.svg`
- `brand/wordmark/icon/favicon.svg`
- `brand/wordmark/icon/icon-tenebrae-on-bone.svg`
- `site/assets/worn-back.jpg`
- `site/assets/pantocrator-icon.jpg`

## Resume procedure

From the repository root:

```bash
node website-decision-workflow/server.mjs 4960
```

Open:

```text
http://127.0.0.1:4960/
```

Then wait for the confirmation button:

```bash
node .agents/skills/design-loop/scripts/wait.mjs 60
```

Run the wait command again after `NO_FEEDBACK_YET`.

When feedback arrives:

1. Read the selection, correction, and actual intent.
2. If accepted, add the resolution to `state.confirmed`, clear `pending` and
   the completed draft, then replace `active-decision.json` with the next
   unresolved decision.
3. If revised, keep the same roadmap ID, increment the round, and make all
   three options and previews answer the correction literally.
4. Keep one active decision only.
5. Validate JSON, JavaScript syntax, browser layout, interactions, and console
   logs.
6. Commit the resulting state and handoff updates when Ferdinand asks to save
   the session.

## Known failures already fixed

### Typing interruption

Initial draft saves changed the version watched by the page, which rebuilt the
form while Ferdinand typed. Correction text now stays intact through polling.
Draft writes are excluded from the reload version.

### Generic preview mismatch

A generic edition image was initially reused for the F navigation option and
did not show the proposed control. Later rounds introduced literal paired
header, collapsed control, open menu, browser icon, record, and closing-state
previews. Continue this standard for every new decision.

### Permanent-system assumption

The early workflow treated identity choices as cross-edition invariants.
Ferdinand rejected that premise. All current design decisions are now scoped
to the present site, and the next edition re-earns everything.

## Validation at handoff

- 18 chapters.
- 256 decisions.
- 256 unique decision IDs.
- Five confirmed decisions.
- No pending submission.
- No saved draft for the next decision.
- JavaScript and JSON parsing pass.
- Desktop and mobile layouts have no horizontal overflow.
- The wake path has been exercised end to end.
- Browser console checks have no warnings or errors.
