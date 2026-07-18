# Dawg Skills

This repository owns the approved skill corpus distributed to downstream repositories.

## Sources of truth

- `.agents/skills/<name>/` owns each skill.
- `.claude/skills/<name>` is a relative symlink to the canonical `.agents/skills/<name>` directory.
- `skills-lock.json` records vendored skill sources; those directories change only through an upstream refresh.
- `AGENTS.md` owns repository policy. `CLAUDE.md` stays `@AGENTS.md`.

## Required routing

- Any code creation, edit, fix, refactor, test design, or review loads `code-standards` and `ponytail`.
- Any prose artifact applies `punchy`.
- Any skill creation, edit, review, or routing work loads `writing-great-skills`.
- Planning with unresolved requirements or tradeoffs uses `grilling`; manual grill variants apply only when explicitly invoked.
- Reviews use `code-review` by default, `thermo-nuclear-review` for deep security/correctness, and `thermo-nuclear-code-quality-review` for deep maintainability.

These are the always-on composition rules. Each `SKILL.md` description owns all other automatic routing; do not create a separate routing registry.

## Skill changes

1. Read `writing-great-skills/SKILL.md`, its glossary, the target skill, and every affected reference completely.
2. Keep the description concise and model-facing: what the skill does, when it applies, and its nearest boundary.
3. Keep `SKILL.md` as the smallest reliable interface. Disclose branch-specific reference behind explicit context pointers.
4. Keep each rule in one authoritative location. Prune duplication, no-ops, sediment, and sprawl.
5. Put local behavior in repository policy or repo-owned skills. Refresh vendored skills through the native Skills CLI.

## Completion

A skill change is complete when its frontmatter matches its invocation model, every relative link resolves, Claude symlink parity holds, focused positive and adjacent-negative prompts route correctly in fresh sessions, and `git diff --check` passes.
