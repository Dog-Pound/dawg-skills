# Dawg Skills

This repository owns the approved skill corpus distributed to downstream repositories.

## Sources of truth

- `.agents/skills/<name>/` owns each skill.
- `npx skills` creates downstream agent projections and lock state.
- `AGENTS.md` owns repository policy. `CLAUDE.md` stays `@AGENTS.md`.

## Issue tracker

Every issue has a GitHub issue type. Set it when creating or first touching the issue.

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

1. Read `writing-great-skills/SKILL.md`, its glossary, the target skill, and every affected reference completely.
2. Keep the description concise and model-facing: what the skill does, when it applies, and its nearest boundary.
3. Keep `SKILL.md` as the smallest reliable interface. Disclose branch-specific reference behind explicit context pointers.
4. Keep each rule in one authoritative location. Prune duplication, no-ops, sediment, and sprawl.
5. Put local behavior in repository policy or repo-owned skills. Replace vendored skills only from their upstream source.

## Completion

A skill change is complete when its frontmatter matches its invocation model, every affected relative link resolves, the managed routing block is synchronized, focused positive and adjacent-negative prompts route correctly in fresh sessions, and `git diff --check` passes.
