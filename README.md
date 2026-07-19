# Dawg Skills

A curated skill collection for agentic software development.

## Sync

Add this target to each downstream `Makefile`:

```make
.PHONY: skills-sync
DAWG_SKILLS_SOURCE ?= Dog-Pound/dawg-skills

skills-sync:
	npx skills add $(DAWG_SKILLS_SOURCE) --skill '*' --agent codex claude-code -y
	node .agents/skills/dawg-routing/scripts/sync-agents.mjs
```

Run `make skills-sync`. It installs the entire corpus and safely synchronizes the managed routing block in `AGENTS.md`.

CI verifies routing without modifying files:

```bash
node .agents/skills/dawg-routing/scripts/sync-agents.mjs --check
```
