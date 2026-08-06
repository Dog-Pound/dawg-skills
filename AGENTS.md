# Dawg Skills

This repository owns the approved skill corpus distributed to downstream repositories.

## Sources of truth

- `.agents/skills/<name>/` owns each skill.
- `npx skills` creates downstream agent projections and lock state.
- `AGENTS.md` owns repository policy. `CLAUDE.md` stays `@AGENTS.md`.

## Issue tracker

Every issue has a GitHub issue type. Set it when creating or first touching the issue.

Every implementation PR body includes `Closes #<number>` for each completed issue, so merge closes the issues.

Issues live in GitHub and are tracked in Dog-Pound’s DPS Planning project. See `docs/agents/issue-tracker.md`.

## Triage labels

Triage uses the five canonical label names. See `docs/agents/triage-labels.md`.

## Domain docs

Domain documentation uses the single-context layout. See `docs/agents/domain.md`.
