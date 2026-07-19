# Domain docs

This repository uses a single-context domain-documentation layout.

## Before exploring

Read when present:

- `CONTEXT.md`
- Relevant ADRs under `docs/adr/`

Proceed silently when either is absent. Create domain documentation only when `/domain-modeling`, `/grill-with-docs`, or `/improve-codebase-architecture` resolves real terminology or decisions.

## Layout

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Vocabulary

Use domain terms as defined in `CONTEXT.md`. Reconsider undefined synonyms or note a genuine vocabulary gap for `/domain-modeling`.

## ADR conflicts

Explicitly identify output that contradicts an existing ADR.
