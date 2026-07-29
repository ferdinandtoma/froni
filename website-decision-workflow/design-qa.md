# Froni website decision workflow design QA

## Visual target

- Source interface: the existing Froni foundation questionnaire.
- Local source capture: `questionnaire-source-1280x720.png`.
- Local implementation capture: `workflow-desktop-final-1280x720.png`.
- Local combined comparison: `desktop-comparison.jpg`.
- Desktop browser viewport: 1280 by 720 CSS pixels.
- Desktop capture payloads: 1265 by 712 pixels each.
- Local mobile comparison: `mobile-comparison-top.jpg`.
- Local mobile variant capture: `workflow-mobile-variants-390x844.jpg`.
- Local mobile response capture: `workflow-mobile-response-390x844.jpg`.
- Mobile test frame: 390 by 844 pixels; inner page viewport: 388 by 842 pixels.
- Captures were generated during QA and are not committed to the repository.

## Comparison evidence

- The implementation preserves the questionnaire's white top bar, Froni
  wordmark treatment, warm-grey page, bordered white cards, compact sans-serif
  metadata, large serif decision headings, restrained radii, and neutral
  dividers.
- The workflow deliberately removes the questionnaire's visible chapter list.
  Progress remains visible, while only the current decision appears in the
  content column.
- The three options use real repository assets and remain visually subordinate
  to the decision question.
- Typography, spacing, controls, borders, and surface colors remain consistent
  with the source at desktop and mobile sizes.
- Images retain their proportions and intended crops. No placeholder or
  fabricated visual asset is present.

## Interaction evidence

- Exactly one decision, three radio variants, one correction textarea, and one
  confirmation button render.
- The confirmation button is disabled with no selection and no correction.
- Selecting a variant enables acceptance and changes the card's selected state.
- Entering a correction changes the action to `Send revision and wake Codex`.
- Draft selection and correction autosave locally.
- A choice saves once on change. Correction text saves on field exit, not on
  every keystroke.
- After a saved choice, an uninterrupted 67-character correction remained
  exact and focused through more than two page-version polling cycles.
- Draft writes no longer change the page version, so they cannot rebuild the
  live form under the cursor.
- A submitted correction produced a structured `iterate` message in
  `.design-loop/feedback.json`; the repository wait script received and consumed
  it.
- Empty submissions return 400. Submissions for a stale decision return 409.
- The clean handoff state has no active selection, draft, or pending item.
- The active decision contains three variants and the roadmap contains 18
  chapters, 256 unique decisions, and 256 unique IDs.
- Desktop and mobile layouts have no horizontal overflow.
- The mobile response field and action each resolve to 307 pixels inside a
  347-pixel response panel, with the action stacked below the field.
- Browser console checks returned no warnings or errors.
- A round-one F-brandmark option reused a generic edition image and did not
  visually explain the proposed navigation role. Round two replaces it with
  three literal states: paired header, collapsed control, and open menu.
- Each round-two preview uses the real F and wordmark assets in the exact
  proposed position. All three preview frames resolve to 211 pixels high, and
  the open drawer remains contained inside its frame.
- Interface asset changes now trigger one full page reload. Draft-state writes
  remain excluded, so editing cannot trigger that reload.

## Comparison history

1. Initial pass: P2. The explanatory introduction occupied 351 pixels and
   pushed the current decision to 505 pixels from the top of a 720-pixel
   viewport.
2. Second pass: the introduction was compressed, moving the decision to 312
   pixels, but the explanation still competed with the live decision.
3. Final pass: the introduction was removed. The current decision begins at
   118 pixels and the first variants begin at 635 pixels in the desktop
   comparison. Progress and the working rule remain contextual, not competing
   decisions.

Final result: passed
