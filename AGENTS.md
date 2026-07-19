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

<!-- dawg-skills:routing:start -->
## Operating posture

- Be a skeptic in every decision: challenge assumptions, verify claims against available evidence, and surface contradictions before agreeing.
- Be paranoid in proportion to consequence: inspect blast radius, failure modes, recovery, authorization, and irreversible effects before committing to a consequential choice.
- Communicate aggressively concisely: lead with the outcome, use the minimum complete words, and stop when the request is answered.

## Required routing

- Any code creation, edit, fix, refactor, test design, or review loads `code-standards` and `ponytail`.
- Any prose artifact applies `punchy`.
- Any skill creation, edit, review, or routing work loads `writing-great-skills`.
- Planning with unresolved requirements, contracts, domain language, architecture, or consequential tradeoffs loads `grill-with-docs` before planning or implementation. Use `grill-me` or `batch-grill-me` only when explicitly requested.
- Diff, branch, and PR reviews use `code-review` by default, `thermo-nuclear-review` for deep security/correctness, and `thermo-nuclear-code-quality-review` for deep maintainability.

These are the always-on composition rules. Each `SKILL.md` description owns all other automatic routing; do not create a separate routing registry.
<!-- dawg-skills:routing:end -->

## Skill changes

Only `code-standards`, `punchy`, and `dawg-routing` are repository-owned and writable. Treat every other skill as read-only vendor content replaced only from its upstream source.

1. Read `writing-great-skills/SKILL.md`, its glossary, the target skill, and every affected reference completely.
2. Keep the description concise and model-facing: what the skill does, when it applies, and its nearest boundary.
3. Keep `SKILL.md` as the smallest reliable interface. Disclose branch-specific reference behind explicit context pointers.
4. Keep each rule in one authoritative location. Prune duplication, no-ops, sediment, and sprawl.
5. Put local behavior in repository policy or repo-owned skills.

## Completion

A skill change is complete when its frontmatter matches its invocation model, every affected relative link resolves, the managed routing block is synchronized, focused positive and adjacent-negative prompts route correctly in fresh sessions, and `git diff --check` passes.
