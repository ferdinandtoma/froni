# Froni website decision workflow

Private local interface for resolving the Froni website one decision at a time.
It is separate from `site/` and must never be deployed with froni.co.

The complete roadmap remains in the application, but the interface exposes only
one live decision. Each round presents three variants, one correction field,
and one confirmation button.

## Run

```bash
node website-decision-workflow/server.mjs
```

Open `http://127.0.0.1:4960`.

Drafts and submissions save locally under:

```text
website-decision-workflow/state/
```

A committed state snapshot and the complete continuation context live in
`state/state.json` and `HANDOFF.md`.

A choice saves once when it changes. Written correction is not saved on every
keystroke; it saves when the field is left or when the response is submitted.

## Wake Codex

The confirmation button writes a structured submission to the repository's
existing design-loop feedback channel. Codex waits with:

```bash
node .agents/skills/design-loop/scripts/wait.mjs 60
```

An empty correction field accepts the chosen variant. Any written correction
asks for another round on the same decision. Codex updates
`active-decision.json`, and the open interface refreshes automatically.
