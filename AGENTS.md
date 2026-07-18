# Dawg Skills

This repository owns the approved Skill Corpus distributed to Downstream Repositories. Use the vocabulary in `CONTEXT.md`.

## Sources of truth

- `.agents/skills/<name>/` owns each skill.
- `.claude/skills/<name>` exposes a skill to Claude through a relative symlink to `.agents/skills/<name>`. Keep one copy of the skill.
- `skills-lock.json` records imported-skill provenance. Refresh locked skills from their source; put local adaptations in repo-owned instructions or skills.
- `README.md` owns human setup and operations. `CONTEXT.md` stays glossary-only.
- `AGENTS.md` owns agent policy. `CLAUDE.md` stays a pointer to this file.

## Skill changes

1. Read `.agents/skills/writing-great-skills/SKILL.md` and its required references before creating or editing a skill.
2. Read the target `SKILL.md` and every reference needed for the affected branch completely.
3. Keep `SKILL.md` as the smallest reliable interface. Move branch-specific material into named references with explicit context pointers.
4. Keep each rule in one authoritative location. Prune duplication, no-ops, sediment, sprawl, and unsupported routing.
5. Preserve imported skills listed in `skills-lock.json`; refresh them from their recorded source instead of patching them locally.

## Completion

A skill change is complete when:

- frontmatter matches its invocation model;
- every relative link and anchor resolves;
- every changed instruction has one source of truth;
- each changed `.claude/skills` entry resolves to its canonical `.agents/skills` directory;
- `skills-lock.json` changes only as part of an upstream refresh; and
- `git diff --check` passes.
